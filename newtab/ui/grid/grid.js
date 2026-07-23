/**
 * Grid renderer: builds the shortcut grid (grouped / flat / tabs) and the
 * group tabs bar. Owns the active group tab. Filtering and ordering logic
 * is delegated to pure helpers (filtering.js, grouping.js).
 */
import { filterShortcuts } from '../../../lib/filtering.js';
import { sortedGroupNames } from '../../../lib/grouping.js';
import { getGroupMeta, toggleFavorite as toggleFavoriteFlag } from '../../../lib/shortcuts.js';
import { createTileElement } from './tile.js';

export function createGridModel(ctx) {
  const { els, state, filters, selection, lock } = ctx;
  let activeGroupTab = '';

  function tileOptions() {
    return {
      selected: false, // set per-tile below
      locked: lock.locked,
      query: filters.getQuery(),
      showDescription: state.getSettings().showDescription !== false,
      onEdit: (item) => ctx.shortcutForm.open(item),
      onFavorite: (id) => toggleFavorite(id),
      onSelect: (id, value) => {
        if (value) selection.add(id);
        else selection.delete(id);
        ctx.bulk.updateToolbar();
      },
    };
  }

  function makeTile(item) {
    const opts = tileOptions();
    opts.selected = selection.has(item.id);
    return createTileElement(item, opts);
  }

  async function toggleFavorite(id) {
    state.setShortcuts(toggleFavoriteFlag(state.getShortcuts(), id));
    const nowFav = state.getShortcuts().find((s) => s.id === id)?.favorite;
    await state.persist();
    render();
    ctx.toast.show(nowFav ? 'Added to favorites' : 'Removed from favorites');
  }

  function render() {
    const settings = state.getSettings();
    const display = settings.groupDisplay || 'grid';
    const allShortcuts = state.getShortcuts();

    const visible = filterShortcuts(allShortcuts, {
      query: filters.getQuery(),
      groups: settings.filterGroups || [],
      favoritesOnly: filters.isFavoritesOnly(),
    });

    els.grid.innerHTML = '';
    els.empty.hidden = allShortcuts.length > 0;
    if (!allShortcuts.length) {
      els.groupTabsBar.hidden = true;
      return;
    }

    if (!visible.length) {
      els.groupTabsBar.hidden = true;
      const msg = document.createElement('p');
      msg.className = 'search-empty';
      if (filters.getQuery()) {
        msg.textContent = `No links match "${filters.getQuery()}"`;
      } else if (filters.isFavoritesOnly()) {
        msg.textContent = 'No favorites yet — tap the ☆ on a link to add one';
      } else {
        msg.textContent = 'No links in selected groups';
      }
      els.grid.appendChild(msg);
      return;
    }

    if (display === 'flat') {
      els.groupTabsBar.hidden = true;
      const ordered = visible
        .map((item, idx) => ({ item, idx }))
        .sort((a, b) => (a.item.order ?? 0) - (b.item.order ?? 0) || a.idx - b.idx);

      const section = document.createElement('div');
      section.className = 'group-section is-active';
      section.dataset.group = '';
      const tileGrid = document.createElement('div');
      tileGrid.className = 'tile-grid';
      for (const { item } of ordered) tileGrid.appendChild(makeTile(item));
      section.appendChild(tileGrid);
      els.grid.appendChild(section);
      ctx.bulk.updateToolbar();
      return;
    }

    // Favorites section at the top (skip when already filtering to favorites only)
    if (!filters.isFavoritesOnly() && settings.showFavorites !== false) {
      const favs = visible
        .filter((s) => s.favorite)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.title || '').localeCompare(b.title || ''));
      if (favs.length) {
        const section = document.createElement('div');
        section.className = 'group-section favorites-section is-active';
        section.dataset.group = '__favorites__';

        const heading = document.createElement('div');
        heading.className = 'group-heading';
        const lab = document.createElement('span');
        lab.className = 'group-heading-label';
        lab.textContent = '⭐ Favorites';
        const line = document.createElement('span');
        line.className = 'group-heading-line';
        heading.append(lab, line);
        section.appendChild(heading);

        const tileGrid = document.createElement('div');
        tileGrid.className = 'tile-grid';
        for (const item of favs) tileGrid.appendChild(makeTile(item));
        section.appendChild(tileGrid);
        els.grid.appendChild(section);
      }
    }

    // Build grouped map
    const grouped = new Map();
    visible.forEach((item, idx) => {
      const g = item.group || '';
      if (!grouped.has(g)) grouped.set(g, []);
      grouped.get(g).push({ item, idx });
    });

    const groupNames = sortedGroupNames(visible, settings.groupOrder || []);
    const showGroups = groupNames.some((g) => g !== '');

    // Tabs bar
    if (display === 'tabs' && showGroups) {
      els.groupTabsBar.hidden = false;
      els.groupTabs.innerHTML = '';
      if (!groupNames.includes(activeGroupTab)) activeGroupTab = groupNames[0] || '';
      for (const g of groupNames) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'group-tab' + (g === activeGroupTab ? ' is-active' : '');
        btn.dataset.group = g;
        const meta = g ? getGroupMeta(settings, g) : {};
        if (meta.color) {
          btn.classList.add('has-accent');
          btn.style.setProperty('--group-accent', meta.color);
        }
        if (meta.icon) {
          const ic = document.createElement('span');
          ic.className = 'group-tab-icon';
          ic.textContent = meta.icon;
          btn.appendChild(ic);
        }
        const lb = document.createElement('span');
        lb.className = 'group-tab-label';
        lb.textContent = g || 'Other';
        btn.appendChild(lb);
        btn.addEventListener('click', () => {
          activeGroupTab = g;
          render();
        });
        els.groupTabs.appendChild(btn);
      }
    } else {
      els.groupTabsBar.hidden = true;
    }

    // Render groups
    for (const groupName of groupNames) {
      const entries = grouped.get(groupName) || [];
      entries.sort((a, b) => (a.item.order ?? 0) - (b.item.order ?? 0) || a.idx - b.idx);

      const section = document.createElement('div');
      section.className = 'group-section' + (groupName === activeGroupTab || display !== 'tabs' ? ' is-active' : '');
      section.dataset.group = groupName;

      if (showGroups) {
        const heading = document.createElement('div');
        heading.className = 'group-heading';
        heading.dataset.group = groupName;
        const meta = groupName ? getGroupMeta(settings, groupName) : {};
        if (meta.color) {
          heading.classList.add('has-accent');
          heading.style.setProperty('--group-accent', meta.color);
        }
        if (meta.icon) {
          const ic = document.createElement('span');
          ic.className = 'group-heading-icon';
          ic.textContent = meta.icon;
          heading.appendChild(ic);
        }
        const lab = document.createElement('span');
        lab.className = 'group-heading-label';
        lab.textContent = groupName || 'Other';
        const line = document.createElement('span');
        line.className = 'group-heading-line';
        heading.append(lab, line);
        section.appendChild(heading);
      }

      const tileGrid = document.createElement('div');
      tileGrid.className = 'tile-grid';
      for (const { item } of entries) tileGrid.appendChild(makeTile(item));
      section.appendChild(tileGrid);

      els.grid.appendChild(section);
    }
    ctx.bulk.updateToolbar();
  }

  /** setActiveGroupTab — called by the groups module when a group is renamed/deleted. */
  function setActiveGroupTab(name) { activeGroupTab = name; }
  function getActiveGroupTab() { return activeGroupTab; }

  function onNavigate(event) {
    const link = event.target.closest('.tile-link');
    if (!link) return;
    const tile = link.closest('.tile');
    if (!tile) return;
    const item = state.getShortcuts().find((s) => s.id === tile.dataset.id);
    if (!item) return;
    ctx.onNavigate(item);
  }

  return { render, toggleFavorite, setActiveGroupTab, getActiveGroupTab, onNavigate };
}