/**
 * Drag & drop tile reordering + cross-group moves (drop onto a group heading).
 * Reorder math is delegated to the pure applyDrop helper.
 */
import { applyDrop } from '../../lib/drag-reorder.js';

export function createDragDropModel(ctx) {
  const { els, state, grid, lock } = ctx;
  let dragId = null;

  function isAfterTarget(event, tile) {
    const rect = tile.getBoundingClientRect();
    const isList = els.app.dataset.groupDisplay === 'list';
    if (isList) return event.clientY > rect.top + rect.height / 2;
    return event.clientX > rect.left + rect.width / 2;
  }

  function clearIndicators() {
    for (const el of els.grid.querySelectorAll('.drag-over, .drop-before, .drop-after')) {
      el.classList.remove('drag-over', 'drop-before', 'drop-after');
    }
  }

  function onDragStart(event) {
    if (lock.locked) return;
    const tile = event.target.closest('.tile');
    if (!tile) return;
    dragId = tile.dataset.id;
    tile.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', dragId);
  }

  function onDragOver(event) {
    if (lock.locked) return;
    const target = event.target.closest('.tile, .group-heading');
    if (!target || (target.classList.contains('tile') && target.dataset.id === dragId)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    clearIndicators();
    if (target.classList.contains('group-heading')) {
      target.classList.add('drag-over');
      return;
    }
    target.classList.add(isAfterTarget(event, target) ? 'drop-after' : 'drop-before');
  }

  async function onDrop(event) {
    if (lock.locked) return;
    event.preventDefault();
    const target = event.target.closest('.tile, .group-heading');
    if (!target || !dragId) return;

    const fromItem = state.getShortcuts().find((s) => s.id === dragId);
    if (!fromItem) return;

    const flat = (state.getSettings().groupDisplay || 'grid') === 'flat';
    let toGroup = fromItem.group || '';
    let anchorId = null;
    let dropAfter = false;

    if (target.classList.contains('group-heading')) {
      toGroup = target.dataset.group || '';
    } else {
      const toItem = state.getShortcuts().find((s) => s.id === target.dataset.id);
      if (!toItem || toItem.id === dragId) return;
      toGroup = flat ? (fromItem.group || '') : (toItem.group || '');
      anchorId = toItem.id;
      dropAfter = isAfterTarget(event, target);
    }

    const next = applyDrop(state.getShortcuts(), { dragId, anchorId, dropAfter, toGroup, flat });
    state.setShortcuts(next);
    clearIndicators();
    await state.persist();
    grid.render();
  }

  function onDragEnd() {
    dragId = null;
    for (const el of els.grid.querySelectorAll('.dragging')) el.classList.remove('dragging');
    clearIndicators();
  }

  function init() {
    els.grid.addEventListener('dragstart', onDragStart);
    els.grid.addEventListener('dragover', onDragOver);
    els.grid.addEventListener('drop', onDrop);
    els.grid.addEventListener('dragend', onDragEnd);
  }

  return { init };
}