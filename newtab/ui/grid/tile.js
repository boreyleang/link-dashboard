/**
 * Tile element factory. Builds a single shortcut tile DOM node.
 * Receives callbacks for edit/favorite/select so it has no direct dependency
 * on the form, state, or selection services (Dependency Inversion).
 */
import { faviconFromUrl } from '../../../lib/url.js';
import { highlight, applyOpenIn } from '../../core/dom.js';

/**
 * @param {object} item        shortcut record
 * @param {object} opts
 * @param {boolean} opts.selected   currently selected for bulk action
 * @param {boolean} opts.locked     dashboard locked (disables edit/drag)
 * @param {string}  opts.query      active search query (for highlighting)
 * @param {boolean} opts.showDescription  render the description line
 * @param {(item: object) => void} opts.onEdit
 * @param {(id: string) => void}    opts.onFavorite
 * @param {(id: string, value: boolean) => void} opts.onSelect
 */
export function createTileElement(item, opts) {
  const {
    selected,
    locked,
    query,
    showDescription,
    onEdit,
    onFavorite,
    onSelect,
  } = opts;

  const tile = document.createElement('div');
  tile.className = 'tile'
    + (selected ? ' is-selected' : '')
    + (item.favorite ? ' is-favorite' : '');
  tile.dataset.id = item.id;
  tile.draggable = !locked;
  tile.style.setProperty('--tile-color', item.color || '#4f6ef7');

  // Bulk checkbox (visible only when unlocked)
  const checkWrap = document.createElement('div');
  checkWrap.className = 'tile-checkbox-wrap';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'tile-checkbox';
  checkbox.checked = selected;
  checkbox.setAttribute('aria-label', `Select ${item.title}`);
  checkbox.addEventListener('change', (e) => {
    e.stopPropagation();
    onSelect(item.id, checkbox.checked);
    tile.classList.toggle('is-selected', checkbox.checked);
  });
  checkbox.addEventListener('click', (e) => e.stopPropagation());
  checkWrap.appendChild(checkbox);

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'tile-edit';
  editBtn.dataset.action = 'edit';
  editBtn.dataset.id = item.id;
  editBtn.title = 'Edit shortcut';
  editBtn.setAttribute('aria-label', `Edit ${item.title}`);
  editBtn.textContent = '✎';
  editBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onEdit(item);
  });
  editBtn.addEventListener('mousedown', (event) => event.stopPropagation());
  editBtn.addEventListener('pointerdown', (event) => event.stopPropagation());

  const favBtn = document.createElement('button');
  favBtn.type = 'button';
  favBtn.className = 'tile-favorite' + (item.favorite ? ' is-active' : '');
  favBtn.dataset.id = item.id;
  favBtn.title = item.favorite ? 'Remove from favorites' : 'Add to favorites';
  favBtn.setAttribute('aria-pressed', item.favorite ? 'true' : 'false');
  favBtn.setAttribute('aria-label', `${item.favorite ? 'Unfavorite' : 'Favorite'} ${item.title}`);
  favBtn.textContent = item.favorite ? '★' : '☆';
  favBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onFavorite(item.id);
  });
  favBtn.addEventListener('mousedown', (event) => event.stopPropagation());
  favBtn.addEventListener('pointerdown', (event) => event.stopPropagation());

  const link = document.createElement('a');
  link.className = 'tile-link';
  link.href = item.url;
  link.title = item.title;
  link.draggable = false;
  applyOpenIn(link, item.openIn);

  const iconWrap = document.createElement('div');
  iconWrap.className = 'tile-icon-wrap';

  const img = document.createElement('img');
  img.className = 'tile-icon';
  img.alt = '';
  img.draggable = false;
  img.referrerPolicy = 'no-referrer';

  const fallback = document.createElement('span');
  fallback.className = 'tile-fallback';
  fallback.textContent = (item.title || '?').slice(0, 1);

  const iconSrc = item.icon || faviconFromUrl(item.url);
  if (iconSrc) {
    img.src = iconSrc;
    img.onload = () => img.classList.add('is-loaded');
    let retried = false;
    img.onerror = () => {
      if (retried) {
        img.hidden = true;
        fallback.classList.add('is-visible');
        return;
      }
      const host = (() => { try { return new URL(item.url).hostname; } catch { return null; } })();
      if (host) {
        retried = true;
        img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
      } else {
        img.hidden = true;
        fallback.classList.add('is-visible');
      }
    };
    img.decode().then(() => img.classList.add('is-loaded')).catch(() => {});
  } else {
    img.hidden = true;
    fallback.classList.add('is-visible');
  }

  iconWrap.append(img, fallback);

  const label = document.createElement('span');
  label.className = 'tile-label';
  if (query) label.innerHTML = highlight(item.title, query);
  else label.textContent = item.title;

  link.append(iconWrap, label);

  if (item.description && showDescription) {
    const desc = document.createElement('span');
    desc.className = 'tile-description';
    if (query) desc.innerHTML = highlight(item.description, query);
    else desc.textContent = item.description;
    link.appendChild(desc);
  }

  tile.append(checkWrap, favBtn, editBtn, link);
  return tile;
}