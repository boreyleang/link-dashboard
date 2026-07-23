/**
 * Backup & Restore dialog (UI). Delegates actual backup logic to lib/backup.js
 * and keeps the auto-backup alarm in sync via the background service worker.
 */
import {
  getConfig, updateConfig, createBackup, getBackups, deleteBackup, restoreBackup,
  exportBackupToFile, importBackupFromFile, exportAllBackupsToFile,
} from '../../lib/backup.js';

export function createBackupModel(ctx) {
  const { els, state, toast } = ctx;

  async function loadConfig() {
    const config = await getConfig();
    els.settingAutoBackupStandalone.checked = config.autoBackup;
    els.settingBackupIntervalStandalone.value = config.interval;
    els.settingMaxBackupsStandalone.value = config.maxBackups;
  }

  async function onConfigChange() {
    const config = {
      autoBackup: els.settingAutoBackupStandalone.checked,
      interval: els.settingBackupIntervalStandalone.value,
      maxBackups: Math.max(1, Math.min(50, Number(els.settingMaxBackupsStandalone.value) || 10)),
    };
    await updateConfig(config);
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      try { chrome.runtime.sendMessage({ type: 'scheduleAutoBackup' }); } catch {}
    }
    toast.show(`Auto backup ${config.autoBackup ? 'enabled' : 'disabled'}`);
  }

  async function onCreate() {
    els.btnCreateBackupStandalone.disabled = true;
    els.btnCreateBackupStandalone.textContent = 'Backing up…';
    try {
      const backup = await createBackup('manual');
      toast.show(`Backup created: ${new Date(backup.timestamp).toLocaleString()}`);
      await renderList();
    } catch (err) {
      console.error('Backup failed', err);
      toast.show('Backup failed: ' + err.message);
    } finally {
      els.btnCreateBackupStandalone.disabled = false;
      els.btnCreateBackupStandalone.textContent = '💾 Create backup now';
    }
  }

  async function onImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    els.btnImportBackupStandalone.value = '';
    try {
      const backup = await importBackupFromFile(file);
      toast.show(`Backup imported: ${new Date(backup.timestamp).toLocaleString()}`);
      await renderList();
    } catch (err) {
      console.error('Import failed', err);
      toast.show('Import failed: ' + err.message);
    }
  }

  async function onExportAll() {
    const backups = await getBackups();
    if (!backups.length) { toast.show('No backups to export'); return; }
    exportAllBackupsToFile(backups);
    toast.show('All backups exported');
  }

  async function onRestore(backupId) {
    const ok = window.confirm(
      'Restore this backup? This will replace your current shortcuts, settings, notes, and recent history.',
    );
    if (!ok) return;
    try {
      await restoreBackup(backupId);
      window.location.reload();
    } catch (err) {
      console.error('Restore failed', err);
      toast.show('Restore failed: ' + err.message);
    }
  }

  async function onDelete(backupId) {
    const ok = window.confirm('Delete this backup?');
    if (!ok) return;
    try {
      await deleteBackup(backupId);
      toast.show('Backup deleted');
      await renderList();
    } catch (err) {
      console.error('Delete failed', err);
      toast.show('Delete failed: ' + err.message);
    }
  }

  async function onExportSingle(backupId) {
    const backups = await getBackups();
    const backup = backups.find((b) => b.id === backupId);
    if (!backup) { toast.show('Backup not found'); return; }
    exportBackupToFile(backup);
    toast.show('Backup exported');
  }

  async function renderList() {
    const backups = await getBackups();
    els.backupCountStandalone.textContent = `${backups.length} backup${backups.length !== 1 ? 's' : ''}`;
    if (!backups.length) {
      els.backupListStandalone.innerHTML = '';
      els.backupEmptyStandalone.hidden = false;
      els.backupListStandalone.appendChild(els.backupEmptyStandalone);
      return;
    }
    els.backupEmptyStandalone.hidden = true;
    els.backupListStandalone.innerHTML = '';

    for (const backup of backups) {
      const li = document.createElement('li');
      li.className = 'backup-item';

      const icon = document.createElement('span');
      icon.className = 'backup-item-icon';
      icon.textContent = backup.type === 'auto' ? '🔄' : backup.type === 'import' ? '📥' : '💾';

      const info = document.createElement('div');
      info.className = 'backup-item-info';
      const date = document.createElement('div');
      date.className = 'backup-item-date';
      date.textContent = new Date(backup.timestamp).toLocaleString();
      const meta = document.createElement('div');
      meta.className = 'backup-item-meta';
      const sc = backup.data?.shortcuts?.length || 0;
      const ar = backup.data?.archived?.length || 0;
      const parts = [];
      if (sc) parts.push(`${sc} link${sc !== 1 ? 's' : ''}`);
      if (ar) parts.push(`${ar} archived`);
      meta.textContent = `${backup.type} · ${parts.join(', ') || 'empty'}`;
      info.append(date, meta);

      const actions = document.createElement('div');
      actions.className = 'backup-item-actions';

      const restoreBtn = document.createElement('button');
      restoreBtn.type = 'button';
      restoreBtn.className = 'btn btn-ghost btn-sm';
      restoreBtn.textContent = '↩';
      restoreBtn.title = 'Restore this backup';
      restoreBtn.addEventListener('click', () => onRestore(backup.id));

      const exportBtn = document.createElement('button');
      exportBtn.type = 'button';
      exportBtn.className = 'btn btn-ghost btn-sm';
      exportBtn.textContent = '⬇';
      exportBtn.title = 'Download this backup';
      exportBtn.addEventListener('click', () => onExportSingle(backup.id));

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn btn-danger btn-sm';
      delBtn.textContent = '✕';
      delBtn.title = 'Delete this backup';
      delBtn.addEventListener('click', () => onDelete(backup.id));

      actions.append(restoreBtn, exportBtn, delBtn);
      li.append(icon, info, actions);
      els.backupListStandalone.appendChild(li);
    }
  }

  function open() {
    loadConfig();
    renderList();
    els.backupModal.showModal();
  }

  function init() {
    els.btnBackup.addEventListener('click', open);
    els.backupModalClose.addEventListener('click', () => els.backupModal.close());
    els.btnBackupClose.addEventListener('click', () => els.backupModal.close());
    els.btnCreateBackupStandalone.addEventListener('click', onCreate);
    els.btnImportBackupStandalone.addEventListener('change', onImport);
    els.btnExportAllBackupsStandalone.addEventListener('click', onExportAll);
    els.settingAutoBackupStandalone.addEventListener('change', onConfigChange);
    els.settingBackupIntervalStandalone.addEventListener('change', onConfigChange);
    els.settingMaxBackupsStandalone.addEventListener('change', onConfigChange);
  }

  return { init, open };
}