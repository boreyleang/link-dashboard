/**
 * Pure helpers for the "recently visited" list: add/rotate/dedupe.
 * The UI layer owns persistence; this module only computes the next list.
 */

/**
 * Prepend a visit, dedupe by id, and cap to `max` entries.
 * @param {Array} recent
 * @param {{ id: string, title: string, url: string, icon?: string }} item
 * @param {number} [max=20]
 * @returns {Array}
 */
export function addRecentEntry(recent, item, max = 20) {
  if (!item) return recent || [];
  const filtered = (recent || []).filter((r) => r.id !== item.id);
  const entry = {
    id: item.id,
    title: item.title,
    url: item.url,
    icon: item.icon,
    ts: Date.now(),
  };
  return [entry, ...filtered].slice(0, max);
}