/**
 * Pure builder for command-palette items. Actions are injected so this module
 * has no dependency on the UI or DOM.
 *
 * @typedef {Object} PaletteAction
 * @property {string} label
 * @property {string} [icon]
 * @property {() => void} run
 */

/**
 * Build the flat list of palette items (actions + matching shortcuts) for a query.
 * @param {Array} shortcuts
 * @param {string} query
 * @param {PaletteAction[]} [actions]
 * @returns {Array}
 */
export function buildPaletteItems(shortcuts, query = '', actions = []) {
  const q = String(query || '').trim().toLowerCase();
  const items = [];

  for (const a of actions) {
    if (!q || String(a.label).toLowerCase().includes(q)) {
      items.push({ ...a, type: 'action', group: 'Actions' });
    }
  }

  for (const s of shortcuts || []) {
    const hay = `${s.title || ''} ${s.url || ''} ${s.description || ''} ${s.group || ''}`.toLowerCase();
    if (!q || hay.includes(q)) {
      items.push({
        type: 'shortcut',
        id: s.id,
        label: s.title,
        sub: s.url,
        icon: s.icon,
        color: s.color,
        group: 'Links',
      });
    }
  }

  return items;
}