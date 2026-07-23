/**
 * Bulk-selection store: owns the set of shortcut ids selected for bulk action.
 * Pure-ish state container shared by the grid (tile checkboxes) and bulk toolbar.
 */
export function createSelectionModel() {
  const selected = new Set();

  return {
    has(id) { return selected.has(id); },
    size() { return selected.size; },
    add(id) { selected.add(id); },
    delete(id) { selected.delete(id); },
    clear() { selected.clear(); },
    ids() { return [...selected]; },
    hasAll(ids) { return ids.every((id) => selected.has(id)); },
    /** Replace the selection with exactly `ids`. */
    setAll(ids) {
      selected.clear();
      for (const id of ids) selected.add(id);
    },
    /** Select every id in the current shortcuts list (or none when false). */
    selectAll(ids, value) {
      if (value) for (const id of ids) selected.add(id);
      else selected.clear();
    },
  };
}