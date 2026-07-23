/**
 * View filters that narrow the grid: the search box query and the
 * "favorites only" toggle. Both trigger a grid re-render on change.
 */
export function createFiltersModel(ctx) {
  const { els, toast } = ctx;
  let query = '';
  let favoritesOnly = false;

  function getQuery() { return query; }

  function setQuery(next) {
    query = String(next ?? '');
    els.searchClear.hidden = !query;
    ctx.grid.render();
  }

  function clearQuery() {
    query = '';
    els.searchInput.value = '';
    els.searchClear.hidden = true;
    els.searchInput.focus();
    ctx.grid.render();
  }

  function isFavoritesOnly() { return favoritesOnly; }

  function toggleFavorites() {
    favoritesOnly = !favoritesOnly;
    els.btnFavoritesFilter.classList.toggle('is-active', favoritesOnly);
    els.btnFavoritesFilter.setAttribute('aria-pressed', favoritesOnly ? 'true' : 'false');
    ctx.grid.render();
    toast.show(favoritesOnly ? 'Showing favorites only' : 'Showing all links');
  }

  function init() {
    els.searchInput.addEventListener('input', () => setQuery(els.searchInput.value));
    els.searchClear.addEventListener('click', clearQuery);
    els.btnFavoritesFilter.addEventListener('click', toggleFavorites);
  }

  return { init, getQuery, setQuery, clearQuery, isFavoritesOnly, toggleFavorites };
}