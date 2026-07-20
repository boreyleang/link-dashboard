/**
 * Service worker for auto-backup alarms.
 * Manifest V3 background script — handles chrome.alarms for periodic backups.
 */

const BACKUP_ALARM = 'linkDashboard_autoBackup';
const BACKUP_STORAGE_KEY = 'linkDashboard_backups';
const STATE_KEY = 'linkDashboard';
const NOTES_KEY = 'linkDashboard_notes';
const RECENT_KEY = 'linkDashboard_recent';

// ── Storage helpers (no ES modules in service worker) ────

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

async function getBackupStore() {
  const result = await chrome.storage.local.get(BACKUP_STORAGE_KEY);
  return result[BACKUP_STORAGE_KEY] ?? { backups: [], config: { autoBackup: false, interval: 'daily', maxBackups: 10 } };
}

async function writeBackupStore(store) {
  await chrome.storage.local.set({ [BACKUP_STORAGE_KEY]: store });
}

async function readNotes() {
  try {
    const result = await chrome.storage.local.get(NOTES_KEY);
    return result[NOTES_KEY] ?? '';
  } catch {
    return '';
  }
}

async function readRecent() {
  try {
    const result = await chrome.storage.local.get(RECENT_KEY);
    return result[RECENT_KEY] ?? [];
  } catch {
    return [];
  }
}

// ── Alarm interval mapping ───────────────────────────────

function getAlarmIntervalMinutes(interval) {
  switch (interval) {
    case 'hourly': return 60;
    case 'daily': return 60 * 24;
    case 'weekly': return 60 * 24 * 7;
    case 'monthly': return 60 * 24 * 30;
    default: return 60 * 24;
  }
}

// ── Create auto backup ───────────────────────────────────

async function createAutoBackup() {
  const stateResult = await chrome.storage.local.get(STATE_KEY);
  const state = stateResult[STATE_KEY];
  if (!state) return null;

  const notes = await readNotes();
  const recent = await readRecent();

  const data = {
    shortcuts: state.shortcuts || [],
    archived: state.archived || [],
    settings: state.settings || {},
    notes,
    recent,
  };

  const backup = {
    id: `bk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    type: 'auto',
    data,
    checksum: computeChecksum(data),
  };

  const store = await getBackupStore();
  store.backups.unshift(backup);

  const max = store.config?.maxBackups || 10;
  if (store.backups.length > max) {
    store.backups = store.backups.slice(0, max);
  }

  await writeBackupStore(store);
  return backup;
}

// ── Schedule alarm ───────────────────────────────────────

async function scheduleAutoBackup() {
  const store = await getBackupStore();
  const config = store.config || {};

  if (!config.autoBackup) {
    await chrome.alarms.clear(BACKUP_ALARM);
    return;
  }

  const intervalMinutes = getAlarmIntervalMinutes(config.interval);
  await chrome.alarms.create(BACKUP_ALARM, {
    delayInMinutes: intervalMinutes,
    periodInMinutes: intervalMinutes,
  });
}

// ── Message handler (for communication with new-tab page) ─

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'scheduleAutoBackup') {
    scheduleAutoBackup().then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message.type === 'createBackup') {
    createAutoBackup().then((backup) => sendResponse({ ok: true, backup }));
    return true;
  }

  if (message.type === 'getBackupConfig') {
    getBackupStore().then((store) => sendResponse({ ok: true, config: store.config }));
    return true;
  }
});

// ── Lifecycle events ─────────────────────────────────────

chrome.runtime.onInstalled.addListener(async () => {
  await scheduleAutoBackup();
});

chrome.runtime.onStartup.addListener(async () => {
  await scheduleAutoBackup();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === BACKUP_ALARM) {
    await createAutoBackup();
  }
});
