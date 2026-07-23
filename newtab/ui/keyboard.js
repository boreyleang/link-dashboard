/**
 * Global keyboard shortcuts: `/` focuses search, Ctrl/Cmd+K toggles the
 * command palette, Escape clears the active search.
 */
export function createKeyboardModel(ctx) {
  const { els, filters, palette } = ctx;

  function init() {
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (els.commandPalette.open) palette.close();
        else palette.open();
        return;
      }
      if (e.key === 'Escape' && filters.getQuery()) {
        filters.clearQuery();
        return;
      }
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        els.searchInput.focus();
      }
    });
  }

  return { init };
}