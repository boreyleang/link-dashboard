/**
 * Lock service: owns the locked/unlocked flag (persisted in settings).
 * When locked, edit affordances are hidden and drag/bulk are disabled.
 */
export function createLockModel({ els, state, selection, toast }) {
  let locked = true;

  function apply() {
    els.app.dataset.locked = String(locked);
    for (const tile of els.grid.querySelectorAll('.tile')) {
      tile.draggable = !locked;
    }
    els.btnAdd.hidden = locked;
    els.btnArchiveView.hidden = locked;
    els.btnGroups.hidden = locked;
    els.btnStore.hidden = locked;
    els.btnImportExport.hidden = locked;
    els.btnBackup.hidden = locked;
    els.btnSettings.hidden = locked;
    if (locked) selection.clear();
    els.bulkToolbar.hidden = locked;
    if (locked) {
      els.lockIcon.textContent = '🔒';
      els.lockLabel.textContent = 'Locked';
      els.btnLock.classList.remove('is-unlocked');
      els.btnLock.title = 'Unlock to edit shortcuts';
    } else {
      els.lockIcon.textContent = '🔓';
      els.lockLabel.textContent = 'Unlocked';
      els.btnLock.classList.add('is-unlocked');
      els.btnLock.title = 'Lock dashboard';
    }
  }

  function isLocked() { return locked; }

  async function toggle() {
    locked = !locked;
    apply();
    state.patchSettings({ locked });
    try {
      await state.persist();
    } catch (error) {
      console.error('Failed to save lock state', error);
    }
    toast.show(locked ? 'Dashboard locked' : 'Dashboard unlocked — you can now edit');
  }

  function initFromSettings(settings) {
    locked = 'locked' in settings ? Boolean(settings.locked) : true;
  }

  function init() {
    els.btnLock.addEventListener('click', toggle);
  }

  return { init, apply, toggle, isLocked, initFromSettings, get locked() { return locked; } };
}