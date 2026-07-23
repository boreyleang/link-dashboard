/**
 * Bulk action toolbar: select-all, move to group, toggle favorite, archive,
 * and delete for the currently selected shortcuts.
 */
import { escHtml } from '../core/dom.js';
import { removeShortcut } from '../../lib/shortcuts.js';

export function createBulkModel(ctx) {
  const { els, state, selection, grid, toast } = ctx;

  function updateToolbar() {
    if (ctx.lock.locked) { els.bulkToolbar.hidden = true; return; }
    els.bulkToolbar.hidden = false;
    const n = selection.size();
    const total = state.getShortcuts().length;
    els.bulkCount.textContent = `${n} selected`;
    els.bulkSelectAll.indeterminate = n > 0 && n < total;
    els.bulkSelectAll.checked = n > 0 && n === total;

    const groups = [...new Set(state.getShortcuts().map((s) => s.group || '').filter(Boolean))].sort();
    els.bulkMoveGroup.innerHTML = '<option value="">Move to group…</option>'
      + groups.map((g) => `<option value="${escHtml(g)}">${escHtml(g)}</option>`).join('')
      + '<option value="__ungroup__">— Remove from group</option>';

    const selected = state.getShortcuts().filter((s) => selection.has(s.id));
    const allFav = selected.length > 0 && selected.every((s) => s.favorite);
    els.bulkFavoriteBtn.textContent = allFav ? '☆ Unfavorite' : '⭐ Favorite';
  }

  function onSelectAll() {
    if (els.bulkSelectAll.checked) selection.setAll(state.getShortcuts().map((s) => s.id));
    else selection.clear();
    grid.render();
    updateToolbar();
  }

  async function onMoveGroup() {
    const val = els.bulkMoveGroup.value;
    if (!val) return;
    const group = val === '__ungroup__' ? '' : val;
    const ids = selection.ids();
    const set = new Set(ids);
    state.setShortcuts(state.getShortcuts().map((s) => set.has(s.id) ? { ...s, group } : s));
    selection.clear();
    await state.persist();
    grid.render();
    updateToolbar();
    toast.show(group ? `Moved to "${group}"` : 'Removed from group');
    els.bulkMoveGroup.value = '';
  }

  async function onFavorite() {
    if (!selection.size()) { toast.show('Select links first'); return; }
    const set = new Set(selection.ids());
    const selected = state.getShortcuts().filter((s) => set.has(s.id));
    const allFav = selected.every((s) => s.favorite);
    const value = !allFav;
    state.setShortcuts(state.getShortcuts().map((s) => set.has(s.id) ? { ...s, favorite: value } : s));
    await state.persist();
    grid.render();
    updateToolbar();
    toast.show(value ? 'Added to favorites' : 'Removed from favorites');
  }

  async function onArchive() {
    if (!selection.size()) { toast.show('Select links first'); return; }
    const set = new Set(selection.ids());
    const toArchive = state.getShortcuts().filter((s) => set.has(s.id));
    const now = new Date().toISOString();
    const archivedEntries = toArchive.map((s) => ({ ...s, archivedAt: now }));
    state.setArchived([...archivedEntries, ...(state.getArchived() || [])]);
    state.setShortcuts(state.getShortcuts().filter((s) => !set.has(s.id)));
    const n = toArchive.length;
    selection.clear();
    await state.persist();
    grid.render();
    updateToolbar();
    toast.showUndo(`${n} link${n !== 1 ? 's' : ''} archived`, async () => {
      const ids = new Set(archivedEntries.map((a) => a.id));
      state.setArchived((state.getArchived() || []).filter((a) => !ids.has(a.id)));
      state.setShortcuts([...state.getShortcuts(), ...archivedEntries]);
      await state.persist();
      grid.render();
      updateToolbar();
      toast.show('Restored');
    });
  }

  async function onDelete() {
    if (!selection.size()) { toast.show('Select links first'); return; }
    const n = selection.size();
    const ok = window.confirm(`Permanently delete ${n} link${n !== 1 ? 's' : ''}?`);
    if (!ok) return;
    const set = new Set(selection.ids());
    const prev = state.getShortcuts();
    state.setShortcuts(state.getShortcuts().filter((s) => !set.has(s.id)));
    selection.clear();
    await state.persist();
    grid.render();
    updateToolbar();
    toast.showUndo(`${n} link${n !== 1 ? 's' : ''} deleted`, async () => {
      state.setShortcuts(prev);
      await state.persist();
      grid.render();
      updateToolbar();
      toast.show('Restored');
    });
  }

  function init() {
    els.bulkSelectAll.addEventListener('change', onSelectAll);
    els.bulkMoveGroup.addEventListener('change', onMoveGroup);
    els.bulkFavoriteBtn.addEventListener('click', onFavorite);
    els.bulkArchiveBtn.addEventListener('click', onArchive);
    els.bulkDeleteBtn.addEventListener('click', onDelete);
  }

  return { init, updateToolbar };
}