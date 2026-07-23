/**
 * Groups manager modal: add/rename/delete/reorder groups, per-group accent
 * color & emoji, and the group display mode (grid/tabs/list/flat).
 */
import { sortedGroupNames, mergedGroupOrder, groupCounts } from '../../lib/grouping.js';
import {
  getGroupMeta, setGroupMeta, renameGroupMeta, deleteGroupMeta,
} from '../../lib/shortcuts.js';

export function createGroupsModel(ctx) {
  const { els, state, toast, grid } = ctx;
  let groupDragName = null;

  function open() {
    render();
    const display = state.getSettings().groupDisplay || 'grid';
    for (const input of els.groupsModal.querySelectorAll('input[name="group-display"]')) {
      input.checked = input.value === display;
      input.onchange = onGroupDisplayChange;
    }
    els.btnAddGroup.onclick = onAddGroup;
    els.newGroupInput.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); onAddGroup(); } };
    els.newGroupInput.value = '';
    els.groupsModal.showModal();
  }

  async function onAddGroup() {
    const name = els.newGroupInput.value.trim();
    if (!name) { els.newGroupInput.focus(); return; }
    const fromShortcuts = sortedGroupNames(state.getShortcuts(), state.getSettings().groupOrder || []).filter((g) => g !== '');
    const orderList = state.getSettings().groupOrder || [];
    if (fromShortcuts.includes(name) || orderList.includes(name)) {
      toast.show(`Group "${name}" already exists`);
      els.newGroupInput.select();
      return;
    }
    state.patchSettings({ groupOrder: [...orderList, name] });
    els.newGroupInput.value = '';
    await state.persist();
    grid.render();
    render();
    toast.show(`Group "${name}" added`);
  }

  function render() {
    const shortcuts = state.getShortcuts();
    const groupNames = mergedGroupOrder(shortcuts, state.getSettings().groupOrder || []);
    const counts = groupCounts(shortcuts);

    els.groupsEmptyHint.hidden = groupNames.length > 0;
    els.groupManagerList.innerHTML = '';

    for (const name of groupNames) {
      const li = document.createElement('li');
      li.className = 'group-manager-row';
      li.draggable = true;
      li.dataset.group = name;

      const handle = document.createElement('span');
      handle.className = 'group-drag-handle';
      handle.textContent = '⠿';
      handle.title = 'Drag to reorder';

      const meta = getGroupMeta(state.getSettings(), name);
      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.className = 'group-color-input';
      colorInput.value = meta.color || '#6d8cff';
      colorInput.title = 'Group accent color';
      colorInput.setAttribute('aria-label', `Accent color for ${name}`);
      colorInput.addEventListener('change', () => onGroupMetaChange(name, { color: colorInput.value }));
      colorInput.addEventListener('mousedown', (e) => e.stopPropagation());
      colorInput.addEventListener('pointerdown', (e) => e.stopPropagation());

      const colorClear = document.createElement('button');
      colorClear.type = 'button';
      colorClear.className = 'group-color-clear';
      colorClear.title = 'Clear accent color';
      colorClear.textContent = '⤬';
      colorClear.hidden = !meta.color;
      colorClear.setAttribute('aria-label', `Clear accent color for ${name}`);
      colorClear.addEventListener('click', () => onGroupMetaChange(name, { color: '' }));
      colorClear.addEventListener('mousedown', (e) => e.stopPropagation());
      colorClear.addEventListener('pointerdown', (e) => e.stopPropagation());

      const iconInput = document.createElement('input');
      iconInput.type = 'text';
      iconInput.className = 'group-icon-input';
      iconInput.value = meta.icon || '';
      iconInput.maxLength = 4;
      iconInput.placeholder = '🙂';
      iconInput.title = 'Click & type an emoji, e.g. 🔥 🎬 🛒';
      iconInput.setAttribute('aria-label', `Emoji for ${name}`);
      iconInput.addEventListener('change', () => onGroupMetaChange(name, { icon: iconInput.value }));
      iconInput.addEventListener('mousedown', (e) => e.stopPropagation());
      iconInput.addEventListener('pointerdown', (e) => e.stopPropagation());

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'group-name-input';
      nameInput.value = name;
      nameInput.setAttribute('aria-label', `Rename group ${name}`);
      nameInput.addEventListener('change', () => onRenameGroup(name, nameInput.value.trim()));
      nameInput.addEventListener('mousedown', (e) => e.stopPropagation());
      nameInput.addEventListener('pointerdown', (e) => e.stopPropagation());

      const badge = document.createElement('span');
      badge.className = 'group-count';
      const c = counts[name] || 0;
      badge.textContent = `${c} link${c !== 1 ? 's' : ''}`;

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'group-delete-btn';
      delBtn.title = 'Remove group (links become ungrouped)';
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', () => onDeleteGroup(name));

      li.append(handle, colorInput, colorClear, iconInput, nameInput, badge, delBtn);

      li.addEventListener('dragstart', (e) => {
        groupDragName = name;
        li.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      li.addEventListener('dragend', () => {
        groupDragName = null;
        li.classList.remove('is-dragging');
        for (const el of els.groupManagerList.querySelectorAll('.drag-over-row')) el.classList.remove('drag-over-row');
      });
      li.addEventListener('dragover', (e) => {
        if (!groupDragName || groupDragName === name) return;
        e.preventDefault();
        for (const el of els.groupManagerList.querySelectorAll('.drag-over-row')) el.classList.remove('drag-over-row');
        li.classList.add('drag-over-row');
      });
      li.addEventListener('drop', async (e) => {
        e.preventDefault();
        li.classList.remove('drag-over-row');
        if (!groupDragName || groupDragName === name) return;
        await onReorderGroup(groupDragName, name);
      });

      els.groupManagerList.appendChild(li);
    }

    els.groupsModalClose.onclick = () => els.groupsModal.close();
    els.btnGroupsClose.onclick = () => els.groupsModal.close();
  }

  async function onRenameGroup(oldName, newName) {
    if (!newName || newName === oldName) { render(); return; }
    state.setShortcuts(state.getShortcuts().map((s) => (s.group || '') === oldName ? { ...s, group: newName } : s));
    const order = [...(state.getSettings().groupOrder || [])];
    const idx = order.indexOf(oldName);
    if (idx >= 0) order[idx] = newName;
    state.patchSettings({ groupOrder: order });
    state.patchSettings(renameGroupMeta(state.getSettings(), oldName, newName));
    if (grid.getActiveGroupTab() === oldName) grid.setActiveGroupTab(newName);
    await state.persist();
    grid.render();
    render();
    toast.show(`Renamed to "${newName}"`);
  }

  async function onDeleteGroup(name) {
    const count = state.getShortcuts().filter((s) => (s.group || '') === name).length;
    const msg = count > 0
      ? `Remove group "${name}"? ${count} link${count !== 1 ? 's' : ''} will become ungrouped.`
      : `Remove group "${name}"?`;
    if (!window.confirm(msg)) return;
    state.setShortcuts(state.getShortcuts().map((s) => (s.group || '') === name ? { ...s, group: '' } : s));
    state.patchSettings({ groupOrder: (state.getSettings().groupOrder || []).filter((g) => g !== name) });
    state.patchSettings(deleteGroupMeta(state.getSettings(), name));
    if (grid.getActiveGroupTab() === name) grid.setActiveGroupTab('');
    await state.persist();
    grid.render();
    render();
    toast.show(`Group "${name}" removed`);
  }

  async function onReorderGroup(fromName, beforeName) {
    const order = sortedGroupNames(state.getShortcuts(), state.getSettings().groupOrder || []).filter((g) => g !== '');
    const withoutFrom = order.filter((g) => g !== fromName);
    const insertIdx = withoutFrom.indexOf(beforeName);
    if (insertIdx < 0) return;
    withoutFrom.splice(insertIdx, 0, fromName);
    state.patchSettings({ groupOrder: withoutFrom });
    await state.persist();
    grid.render();
    render();
  }

  async function onGroupMetaChange(name, patch) {
    state.patchSettings(setGroupMeta(state.getSettings(), name, patch));
    await state.persist();
    grid.render();
    render();
  }

  async function onGroupDisplayChange(event) {
    const display = event.target.value;
    state.patchSettings({ groupDisplay: display });
    els.app.dataset.groupDisplay = display;
    await state.persist();
    grid.render();
  }

  function init() {
    els.btnGroups.addEventListener('click', open);
    els.groupsModalClose.addEventListener('click', () => els.groupsModal.close());
    els.btnGroupsClose.addEventListener('click', () => els.groupsModal.close());
  }

  return { init, open, render };
}