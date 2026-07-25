/**
 * Browser Bookmarks widget: renders the chrome.bookmarks tree, with live
 * search and collapse/expand. Only functional in a real extension context.
 */
import { escHtml } from '../core/dom.js';

export function createBookmarksModel(ctx) {
  const { els } = ctx;

  function hasApi() {
    return typeof chrome !== 'undefined' && typeof chrome.bookmarks !== 'undefined';
  }

  function buildLinkNode(node) {
    const a = document.createElement('a');
    a.className = 'bm-link';
    a.href = node.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('role', 'treeitem');
    a.title = `${node.title}\n${node.url}`;

    const title = document.createElement('span');
    title.className = 'bm-link-title';
    title.textContent = node.title || node.url;

    const url = document.createElement('span');
    url.className = 'bm-link-url';
    try { url.textContent = new URL(node.url).hostname; } catch { url.textContent = ''; }

    a.append(title, url);
    return a;
  }

  function buildFolderNode(node, startOpen = false) {
    const folder = document.createElement('div');
    folder.className = 'bm-folder' + (startOpen ? ' is-open' : '');
    folder.dataset.id = node.id;

    const header = document.createElement('div');
    header.className = 'bm-folder-header';
    header.setAttribute('role', 'treeitem');
    header.setAttribute('aria-expanded', String(startOpen));
    header.setAttribute('tabindex', '0');

    const arrow = document.createElement('span');
    arrow.className = 'bm-folder-icon';
    arrow.textContent = '▶';
    arrow.setAttribute('aria-hidden', 'true');

    const name = document.createElement('span');
    name.className = 'bm-folder-name';
    name.textContent = node.title || 'Untitled folder';

    const linkCount = (node.children || []).filter((c) => c.url).length;
    const folderCount = (node.children || []).filter((c) => !c.url).length;
    const badge = document.createElement('span');
    badge.className = 'bm-folder-count';
    const parts = [];
    if (folderCount) parts.push(`${folderCount} folder${folderCount !== 1 ? 's' : ''}`);
    if (linkCount) parts.push(`${linkCount} link${linkCount !== 1 ? 's' : ''}`);
    badge.textContent = parts.join(', ') || 'empty';

    header.append(arrow, name, badge);

    const children = document.createElement('div');
    children.className = 'bm-folder-children';
    children.setAttribute('role', 'group');

    for (const child of (node.children || [])) {
      if (child.url) children.appendChild(buildLinkNode(child));
      else if (child.children !== undefined) children.appendChild(buildFolderNode(child, false));
    }

    const toggle = () => {
      const isOpen = folder.classList.toggle('is-open');
      header.setAttribute('aria-expanded', String(isOpen));
    };
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });

    folder.append(header, children);
    return folder;
  }

  async function load() {
    els.bookmarksTree.innerHTML = '';
    if (!hasApi()) {
      els.bookmarksTree.innerHTML = `
        <div class="bm-notice">
          <strong>Bookmarks unavailable</strong>
          This feature only works when installed as a Chrome extension.<br>
          In dev preview (localhost) the bookmarks API is not accessible.
        </div>`;
      return;
    }
    try {
      const tree = await chrome.bookmarks.getTree();
      const root = tree[0];
      for (const topFolder of (root.children || [])) {
        if (!topFolder.children || topFolder.children.length === 0) continue;
        els.bookmarksTree.appendChild(buildFolderNode(topFolder, true));
      }
    } catch (err) {
      console.error('Bookmarks load failed', err);
      els.bookmarksTree.innerHTML = `<div class="bm-notice"><strong>Could not load bookmarks.</strong><br>${err.message}</div>`;
    }
  }

  async function search(query) {
    els.bookmarksTree.innerHTML = '';
    if (!query) { await load(); return; }
    if (!hasApi()) return;
    try {
      const results = await chrome.bookmarks.search(query);
      if (!results.length) {
        els.bookmarksTree.innerHTML = `<div class="bm-notice">No bookmarks match "<strong>${escHtml(query)}</strong>"</div>`;
        return;
      }
      const list = document.createElement('div');
      list.className = 'bm-search-results';
      for (const node of results) if (node.url) list.appendChild(buildLinkNode(node));
      els.bookmarksTree.appendChild(list);
    } catch (err) {
      console.error(err);
    }
  }

  function init() {
    els.bookmarksToggle.addEventListener('click', () => {
      const expanded = els.bookmarksToggle.getAttribute('aria-expanded') === 'true';
      els.bookmarksToggle.setAttribute('aria-expanded', String(!expanded));
      els.bookmarksBody.hidden = expanded;
    });

    let bmSearchTimer = null;
    els.bookmarksSearch.addEventListener('input', () => {
      clearTimeout(bmSearchTimer);
      bmSearchTimer = setTimeout(() => search(els.bookmarksSearch.value.trim()), 200);
    });

    if (ctx.state.getSettings().showBookmarks) load();
  }

  return { init, load, search };
}