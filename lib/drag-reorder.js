/**
 * Pure drag-and-drop reorder logic, extracted from the grid drop handler.
 * Computes the new shortcuts array without touching the DOM.

 * @typedef {Object} DropIntent
 * @property {string} dragId      id of the dragged shortcut
 * @property {string|null} [anchorId]  id of the tile dropped onto (null = onto heading/end)
 * @property {boolean} [dropAfter]  insert after the anchor (true) or before (false)
 * @property {string} [toGroup]   group to move the dragged item into
 * @property {boolean} [flat]     flat display mode reorders the whole list
 */

/**
 * Apply a drop intent to a shortcuts list, returning a new array with
 * reassigned `group` and sequential `order` values for the affected group.
 *
 * @param {Array} shortcuts
 * @param {DropIntent} intent
 * @returns {Array}
 */
export function applyDrop(shortcuts, intent) {
  const { dragId, anchorId = null, dropAfter = false, toGroup, flat = false } = intent;
  const fromItem = (shortcuts || []).find((s) => s.id === dragId);
  if (!fromItem) return shortcuts || [];

  const group = flat ? (fromItem.group || '') : (toGroup ?? fromItem.group ?? '');

  const sequence = (flat ? shortcuts.slice() : shortcuts.filter((s) => (s.group || '') === group))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const without = sequence.filter((s) => s.id !== dragId);

  let insertIdx = without.length;
  if (anchorId && without.some((s) => s.id === anchorId)) {
    const idx = without.findIndex((s) => s.id === anchorId);
    insertIdx = dropAfter ? idx + 1 : idx;
  }
  without.splice(insertIdx, 0, fromItem);

  const newOrders = new Map(without.map((s, i) => [s.id, i]));

  return shortcuts.map((s) => {
    if (s.id === dragId) {
      return { ...s, group: group ?? s.group, order: newOrders.get(s.id) ?? s.order };
    }
    if (newOrders.has(s.id)) {
      return { ...s, order: newOrders.get(s.id) };
    }
    return s;
  });
}