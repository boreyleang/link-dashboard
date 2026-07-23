/**
 * Pure shortcut filtering. Extracted from the grid renderer so the
 * "which links are visible" policy is testable without the DOM.
 *
 * @typedef {Object} FilterOptions
 * @property {string} [query]      search text (title/url/description/group/favorite)
 * @property {string[]} [groups]   restrict to these group names (empty = all)
 * @property {boolean} [favoritesOnly]  show only favorites
 */

/**
 * Filter a shortcut list by search query, selected groups, and favorites flag.
 * @param {Array} shortcuts
 * @param {FilterOptions} [options]
 * @returns {Array}
 */
export function filterShortcuts(shortcuts, options = {}) {
  const { query = '', groups = [], favoritesOnly = false } = options;
  let result = shortcuts;

  if (groups.length > 0) {
    const allowed = new Set(groups);
    result = result.filter((s) => allowed.has(s.group || ''));
  }

  if (favoritesOnly) {
    result = result.filter((s) => s.favorite);
  }

  const q = String(query || '').trim().toLowerCase();
  if (q) {
    result = result.filter((s) => {
      const hay = [
        s.title || '',
        s.url || '',
        s.description || '',
        s.group || '',
      ]
        .join('\n')
        .toLowerCase();
      if (hay.includes(q)) return true;
      return Boolean(s.favorite) && 'favorite favourite'.includes(q);
    });
  }

  return result;
}