/**
 * Pure grouping helpers: ordering, availability, counts, and reordering.
 * No DOM, no storage — fully unit-testable.
 */

/**
 * Unique group names present in a shortcut list (unsorted, includes '' for ungrouped).
 */
export function presentGroupNames(shortcuts) {
  return [...new Set((shortcuts || []).map((s) => s.group || ''))];
}

/**
 * Sorted group names respecting the user-defined groupOrder, then alpha,
 * with ungrouped ('') always last.
 * @param {Array} shortcuts
 * @param {string[]} [groupOrder]
 * @returns {string[]}
 */
export function sortedGroupNames(shortcuts, groupOrder = []) {
  const order = groupOrder || [];
  const allGroups = presentGroupNames(shortcuts);
  return allGroups.sort((a, b) => {
    if (a === '' && b !== '') return 1;
    if (a !== '' && b === '') return -1;
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.localeCompare(b);
  });
}

/**
 * Distinct group names that actually have shortcuts, sorted by groupOrder then alpha.
 * @param {Array} shortcuts
 * @param {string[]} [groupOrder]
 * @returns {string[]}
 */
export function availableGroups(shortcuts, groupOrder = []) {
  const names = (shortcuts || [])
    .map((s) => (s.group || '').trim())
    .filter(Boolean);
  const unique = [...new Set(names)];
  const order = groupOrder || [];
  return unique.sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
}

/** Count shortcuts per group name (ungrouped keyed by ''). */
export function groupCounts(shortcuts) {
  const counts = {};
  for (const s of shortcuts || []) {
    const g = s.group || '';
    counts[g] = (counts[g] || 0) + 1;
  }
  return counts;
}

/**
 * Produce a new groupOrder with `from` moved to just before `before`.
 * Returns the original array reference when nothing changes (no-op).
 */
export function reorderGroupOrder(order, from, before) {
  const withoutFrom = (order || []).filter((g) => g !== from);
  const insertIdx = withoutFrom.indexOf(before);
  if (insertIdx < 0) return order || [];
  withoutFrom.splice(insertIdx, 0, from);
  return withoutFrom;
}

/**
 * Merge groupOrder with any groups present in shortcuts that aren't listed,
 * keeping groupOrder first. Used by the group manager to show empty groups.
 */
export function mergedGroupOrder(shortcuts, groupOrder = []) {
  const order = groupOrder || [];
  const fromShortcuts = availableGroups(shortcuts, order);
  return [...new Set([...order, ...fromShortcuts])].filter((g) => g);
}