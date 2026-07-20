/**
 * Backup manager for dashboard state.
 * Stores backup history in chrome.storage.local (or localStorage fallback).
 * Supports auto-backup via chrome.alarms and manual backup with file export.
 */

import {
  loadState,
  saveState,
  readNotes,
  writeNotes,
  readRecent,
  writeRecent,
} from './storage.js';

const BACKUP_STORAGE_KEY = 'linkDashboard_backups';
const MAX_BACKUPS_DEFAULT = 10;

// ── Low-level storage ────────────────────────────────────

async function readBackupStore() {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const result = await chrome.storage.local.get(BACKUP_STORAGE_KEY);
    return result[BACKUP_STORAGE_KEY] ?? { backups: [], config: defaultConfig() };
  }
  try {
    const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { backups: [], config: defaultConfig() };
  } catch {
    return { backups: [], config: defaultConfig() };
  }
}

async function writeBackupStore(store) {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ [BACKUP_STORAGE_KEY]: store });
    return;
  }
  localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(store));
}

function defaultConfig() {
  return {
    autoBackup: false,
    interval: 'daily',
    maxBackups: MAX_BACKUPS_DEFAULT,
  };
}

// ── Checksum ─────────────────────────────────────────────

function computeChecksum(data) {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return hash.toString(36);
}

// ── Config ───────────────────────────────────────────────

export async function getConfig() {
  const store = await readBackupStore();
  return { ...defaultConfig(), ...(store.config || {}) };
}

export async function updateConfig(patch) {
  const store = await readBackupStore();
  store.config = { ...defaultConfig(), ...(store.config || {}), ...patch };
  await writeBackupStore(store);
  return store.config;
}

// ── Create backup ────────────────────────────────────────

export async function createBackup(type = 'manual') {
  const state = await loadState();
  const notes = await readNotes();
  const recent = await readRecent();

  const data = {
    shortcuts: state.shortcuts,
    archived: state.archived,
    settings: state.settings,
    notes,
    recent,
  };

  const backup = {
    id: `bk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    type,
    data,
    checksum: computeChecksum(data),
  };

  const store = await readBackupStore();
  store.backups.unshift(backup);

  // Rotate: keep only maxBackups
  const max = store.config?.maxBackups || MAX_BACKUPS_DEFAULT;
  if (store.backups.length > max) {
    store.backups = store.backups.slice(0, max);
  }

  await writeBackupStore(store);
  return backup;
}

// ── List backups ─────────────────────────────────────────

export async function getBackups() {
  const store = await readBackupStore();
  return store.backups || [];
}

// ── Get single backup ────────────────────────────────────

export async function getBackup(backupId) {
  const store = await readBackupStore();
  return (store.backups || []).find((b) => b.id === backupId) || null;
}

// ── Delete backup ────────────────────────────────────────

export async function deleteBackup(backupId) {
  const store = await readBackupStore();
  store.backups = (store.backups || []).filter((b) => b.id !== backupId);
  await writeBackupStore(store);
}

// ── Restore backup ───────────────────────────────────────

export async function restoreBackup(backupId) {
  const backup = await getBackup(backupId);
  if (!backup) throw new Error('Backup not found');

  // Verify integrity
  if (backup.checksum && computeChecksum(backup.data) !== backup.checksum) {
    console.warn('Backup checksum mismatch — restoring anyway');
  }

  const { data } = backup;

  // Restore main state
  await saveState({
    shortcuts: data.shortcuts || [],
    archived: data.archived || [],
    settings: data.settings || {},
  });

  // Restore notes
  if (typeof data.notes === 'string') {
    await writeNotes(data.notes);
  }

  // Restore recent
  if (Array.isArray(data.recent)) {
    await writeRecent(data.recent);
  }

  return backup;
}

// ── Rotate backups ───────────────────────────────────────

export async function rotateBackups() {
  const store = await readBackupStore();
  const max = store.config?.maxBackups || MAX_BACKUPS_DEFAULT;
  if (store.backups.length > max) {
    store.backups = store.backups.slice(0, max);
    await writeBackupStore(store);
  }
}

// ── Verify integrity ─────────────────────────────────────

export function verifyIntegrity(backup) {
  if (!backup?.data || !backup?.checksum) return true;
  return computeChecksum(backup.data) === backup.checksum;
}

// ── Export to file ───────────────────────────────────────

export function exportBackupToFile(backup) {
  const exportData = {
    version: 1,
    appVersion: '1.3.0',
    exportedAt: new Date().toISOString(),
    backupId: backup.id,
    backupTimestamp: backup.timestamp,
    backupType: backup.type,
    data: backup.data,
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date(backup.timestamp).toISOString().slice(0, 10);
  a.download = `link-dashboard-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Import from file ─────────────────────────────────────

export async function importBackupFromFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);

  const data = parsed.data;
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid backup file: missing data');
  }

  const backup = {
    id: `bk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: parsed.backupTimestamp || parsed.exportedAt || new Date().toISOString(),
    type: 'import',
    data: {
      shortcuts: Array.isArray(data.shortcuts) ? data.shortcuts : [],
      archived: Array.isArray(data.archived) ? data.archived : [],
      settings: data.settings || {},
      notes: typeof data.notes === 'string' ? data.notes : '',
      recent: Array.isArray(data.recent) ? data.recent : [],
    },
    checksum: computeChecksum(data),
  };

  const store = await readBackupStore();
  store.backups.unshift(backup);

  const max = store.config?.maxBackups || MAX_BACKUPS_DEFAULT;
  if (store.backups.length > max) {
    store.backups = store.backups.slice(0, max);
  }

  await writeBackupStore(store);
  return backup;
}

// ── Export all backups to file ────────────────────────────

export function exportAllBackupsToFile(backups) {
  const exportData = {
    version: 1,
    appVersion: '1.3.0',
    exportedAt: new Date().toISOString(),
    exportType: 'all-backups',
    backups: backups.map((b) => ({
      id: b.id,
      timestamp: b.timestamp,
      type: b.type,
      data: b.data,
      checksum: b.checksum,
    })),
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `link-dashboard-all-backups-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Alarm interval helpers ───────────────────────────────

export function getAlarmIntervalMinutes(interval) {
  switch (interval) {
    case 'hourly': return 60;
    case 'daily': return 60 * 24;
    case 'weekly': return 60 * 24 * 7;
    case 'monthly': return 60 * 24 * 30;
    default: return 60 * 24;
  }
}
