/**
 * Link Store modal: pick recommended links from a curated catalog and add
 * them to the dashboard.
 */
import { STORE_CATALOG } from '../../lib/storage.js';
import { createShortcut } from '../../lib/shortcuts.js';
import { faviconFromUrl } from '../../lib/url.js';

const STORE_CATEGORIES = [
  'All', 'AI & Productivity', 'Email & Office', 'Communication', 'Source Code',
  'Developer Tools', 'Search', 'Social Media', 'Video & Streaming', 'Shopping',
  'Finance', 'News', 'Maps & Travel', 'Learning', 'Design', 'Password Managers',
  'Cloud Platforms', 'DevOps', 'Entertainment',
];

export function createStoreModel(ctx) {
  const { els, state, toast, grid } = ctx;
  let activeCategory = 'All';
  const selected = new Set();

  function renderTabs() {
    els.storeCategoryTabs.innerHTML = '';
    for (const cat of STORE_CATEGORIES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'store-cat-tab' + (cat === activeCategory ? ' is-active' : '');
      btn.textContent = cat;
      btn.addEventListener('click', () => {
        activeCategory = cat;
        renderTabs();
        renderGrid(cat);
      });
      els.storeCategoryTabs.appendChild(btn);
    }
  }

  function renderGrid(category) {
    const q = els.storeSearch.value.trim().toLowerCase();
    const existingUrls = new Set(state.getShortcuts().map((s) => s.url));
    let items = STORE_CATALOG;
    if (category && category !== 'All') items = items.filter((i) => i.group === category);
    if (q) {
      items = items.filter((i) =>
        (i.title || '').toLowerCase().includes(q) ||
        (i.url || '').toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q) ||
        (i.group || '').toLowerCase().includes(q),
      );
    }
    els.storeGrid.innerHTML = '';
    els.storeEmpty.hidden = items.length > 0;

    for (const item of items) {
      const card = document.createElement('div');
      card.className = 'store-card';
      const alreadyAdded = existingUrls.has(item.url);
      const checked = selected.has(item.url);

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'store-card-check';
      cb.checked = checked;
      cb.disabled = alreadyAdded;
      cb.addEventListener('change', () => {
        if (cb.checked) selected.add(item.url);
        else selected.delete(item.url);
        updateCount();
      });

      const icon = document.createElement('img');
      icon.className = 'store-card-icon';
      icon.alt = '';
      icon.src = item.icon || faviconFromUrl(item.url);
      icon.onerror = () => { icon.hidden = true; };

      const title = document.createElement('span');
      title.className = 'store-card-title';
      title.textContent = item.title;

      const desc = document.createElement('span');
      desc.className = 'store-card-desc';
      desc.textContent = item.description || '';

      const group = document.createElement('span');
      group.className = 'store-card-group';
      group.textContent = item.group;

      if (alreadyAdded) {
        card.classList.add('is-added');
        const badge = document.createElement('span');
        badge.className = 'store-card-added';
        badge.textContent = 'Added';
        card.append(cb, icon, title, desc, group, badge);
      } else {
        card.append(cb, icon, title, desc, group);
      }
      els.storeGrid.appendChild(card);
    }
  }

  function updateCount() {
    const n = selected.size;
    els.storeSelectedCount.textContent = `${n} selected`;
    els.btnStoreAdd.disabled = n === 0;
  }

  async function onAddSelected() {
    if (selected.size === 0) return;
    const toAdd = STORE_CATALOG.filter((i) => selected.has(i.url));
    let added = 0;
    for (const item of toAdd) {
      const exists = state.getShortcuts().some((s) => s.url === item.url);
      if (exists) continue;
      state.setShortcuts([...state.getShortcuts(), createShortcut({
        title: item.title,
        url: item.url,
        icon: item.icon || '',
        color: item.color || '#4f6ef7',
        group: item.group || '',
        description: item.description || '',
      })]);
      added++;
    }
    if (added > 0) {
      await state.persist();
      grid.render();
    }
    els.storeModal.close();
    toast.show(`Added ${added} link${added !== 1 ? 's' : ''}`);
  }

  function open() {
    selected.clear();
    activeCategory = 'All';
    els.storeSearch.value = '';
    renderTabs();
    renderGrid('All');
    updateCount();
    els.storeModal.showModal();
  }

  function init() {
    els.btnStore.addEventListener('click', open);
    els.storeModalClose.addEventListener('click', () => els.storeModal.close());
    document.getElementById('btn-store-cancel').addEventListener('click', () => els.storeModal.close());
    els.btnStoreAdd.addEventListener('click', onAddSelected);
    els.storeSearch.addEventListener('input', () => renderGrid(activeCategory));
  }

  return { init, open };
}