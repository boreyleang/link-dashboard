/**
 * Archive modal + archive/restore/delete-permanent, plus "archive single"
 * invoked from the shortcut edit form.
 */
import { removeShortcut } from '../../lib/shortcuts.js';

export function createArchiveModel(ctx) {
  const { els, state, grid, toast } = ctx;

  function open() {
    render();
    els.archiveModal.showModal();
  }

  function render() {
    const archived = state.getArchived() || [];
    els.archiveEmpty.hidden = archived.length > 0;
    els.archiveSelectAll.checked = false;
    els.archiveCount.textContent = '0 selected';
    els.archiveList.innerHTML = '';

    for (const item of archived) {
      const li = document.createElement('li');
      li.className = 'archive-item';
      li.dataset.id = item.id;

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'archive-item-check';
      cb.setAttribute('aria-label', `Select ${item.title}`);
      cb.addEventListener('change', updateCount);

      const iconDiv = document.createElement('div');
      iconDiv.className = 'archive-item-icon';
      const img = document.createElement('img');
      img.alt = '';
      img.referrerPolicy = 'no-referrer';
      try {
        const host = new URL(item.url).hostname;
        img.src = item.icon || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`;
      } catch { img.hidden = true; }
      img.decode().catch(() => {});
      iconDiv.appendChild(img);

      const info = document.createElement('div');
      info.className = 'archive-item-info';
      const title = document.createElement('div');
      title.className = 'archive-item-title';
      title.textContent = item.title || item.url;
      const url = document.createElement('div');
      url.className = 'archive-item-url';
      try { url.textContent = new URL(item.url).hostname; } catch { url.textContent = item.url; }
      info.append(title, url);

      const date = document.createElement('div');
      date.className = 'archive-item-date';
      if (item.archivedAt) {
        date.textContent = new Date(item.archivedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }

      li.append(cb, iconDiv, info, date);
      els.archiveList.appendChild(li);
    }
  }

  function updateCount() {
    const checked = els.archiveList.querySelectorAll('.archive-item-check:checked').length;
    const total = els.archiveList.querySelectorAll('.archive-item-check').length;
    els.archiveCount.textContent = `${checked} selected`;
    els.archiveSelectAll.indeterminate = checked > 0 && checked < total;
    els.archiveSelectAll.checked = checked > 0 && checked === total;
  }

  function onSelectAll() {
    const checked = els.archiveSelectAll.checked;
    for (const cb of els.archiveList.querySelectorAll('.archive-item-check')) cb.checked = checked;
    updateCount();
  }

  function selectedIds() {
    return [...els.archiveList.querySelectorAll('.archive-item-check:checked')]
      .map((cb) => cb.closest('.archive-item')?.dataset.id)
      .filter(Boolean);
  }

  async function onRestore() {
    const ids = selectedIds();
    if (!ids.length) { toast.show('Select items to restore'); return; }
    const set = new Set(ids);
    const items = state.getArchived().filter((s) => set.has(s.id));
    const restored = items.map(({ archivedAt: _, ...rest }) => rest);
    state.setShortcuts([...state.getShortcuts(), ...restored]);
    state.setArchived(state.getArchived().filter((s) => !set.has(s.id)));
    await state.persist();
    grid.render();
    render();
    toast.show(`${ids.length} link${ids.length !== 1 ? 's' : ''} restored`);
  }

  async function onDeletePermanent() {
    const ids = selectedIds();
    if (!ids.length) { toast.show('Select items to delete'); return; }
    const ok = window.confirm(`Permanently delete ${ids.length} archived link${ids.length !== 1 ? 's' : ''}? This cannot be undone.`);
    if (!ok) return;
    const set = new Set(ids);
    state.setArchived(state.getArchived().filter((s) => !set.has(s.id)));
    await state.persist();
    render();
    toast.show(`${ids.length} link${ids.length !== 1 ? 's' : ''} permanently deleted`);
  }

  /** Archive the shortcut currently open in the edit form (by field-id). */
  async function archiveSingle() {
    const id = els.fieldId.value;
    if (!id) return;
    const item = state.getShortcuts().find((s) => s.id === id);
    if (!item) return;
    ctx.selection.delete(id);
    state.setArchived([{ ...item, archivedAt: new Date().toISOString() }, ...(state.getArchived() || [])]);
    state.setShortcuts(removeShortcut(state.getShortcuts(), id));
    await state.persist();
    grid.render();
    els.shortcutModal.close();
    toast.showUndo(`"${item.title}" archived`, async () => {
      state.setArchived((state.getArchived() || []).filter((a) => a.id !== id));
      state.setShortcuts([...state.getShortcuts(), { ...item }]);
      await state.persist();
      grid.render();
      toast.show('Restored');
    });
  }

  function init() {
    els.btnArchiveView.addEventListener('click', open);
    els.archiveModalClose.addEventListener('click', () => els.archiveModal.close());
    els.btnArchiveClose.addEventListener('click', () => els.archiveModal.close());
    els.archiveSelectAll.addEventListener('change', onSelectAll);
    els.archiveRestoreBtn.addEventListener('click', onRestore);
    els.archiveDeleteBtn.addEventListener('click', onDeletePermanent);
  }

  return { init, open, render, archiveSingle };
}