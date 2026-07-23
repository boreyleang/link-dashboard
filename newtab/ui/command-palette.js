/**
 * Command palette (Ctrl/Cmd+K): quick search across links + static actions.
 * Item building is delegated to the pure buildPaletteItems helper.
 */
import { buildPaletteItems } from '../../lib/palette-items.js';
import { escHtml } from '../core/dom.js';

export function createPaletteModel(ctx) {
  const { els, state, shortcutForm, settings, groups, groupFilter, archive, backup, importExport, theme, filters } = ctx;
  let items = [];
  let active = -1;

  function actions() {
    const { lock } = ctx;
    return [
      { label: 'Add link', icon: '🔗', run: () => { if (lock.locked) ctx.els.btnLock.click(); shortcutForm.open(); } },
      { label: 'Customize dashboard', icon: '⚙', run: () => settings.open() },
      { label: 'Manage groups', icon: '👥', run: () => groups.open() },
      { label: 'Filter by group', icon: '🏷️', run: () => groupFilter.open() },
      { label: 'Toggle favorites filter', icon: '⭐', run: () => filters.toggleFavorites() },
      { label: 'View archive', icon: '🗄️', run: () => archive.open() },
      { label: 'Backup & Restore', icon: '💾', run: () => backup.open() },
      { label: 'Import / Export', icon: '⇅', run: () => importExport.open() },
      { label: 'Toggle theme', icon: '🌓', run: () => theme.toggle() },
    ];
  }

  function render(query) {
    items = buildPaletteItems(state.getShortcuts(), query, actions());
    active = items.length ? 0 : -1;
    els.paletteList.innerHTML = '';
    els.paletteEmpty.hidden = items.length > 0;

    items.forEach((item, i) => {
      const li = document.createElement('li');
      li.className = 'palette-item' + (i === active ? ' is-active' : '');
      li.dataset.index = String(i);
      li.setAttribute('role', 'option');

      let iconHtml;
      if (item.type === 'shortcut' && item.icon) {
        iconHtml = `<span class="palette-item-icon" style="background:${escHtml(item.color || 'var(--primary)')}33">
          <img src="${escHtml(item.icon)}" alt="" onerror="this.style.display='none'" /></span>`;
      } else if (item.type === 'shortcut') {
        iconHtml = `<span class="palette-item-icon" style="background:${escHtml(item.color || 'var(--primary)')}33">${escHtml((item.label || '?')[0])}</span>`;
      } else {
        iconHtml = `<span class="palette-item-icon palette-item-icon--action">${item.icon || '⚡'}</span>`;
      }

      li.innerHTML = `
        ${iconHtml}
        <span class="palette-item-text">
          <span class="palette-item-label">${escHtml(item.label)}</span>
          ${item.sub ? `<span class="palette-item-sub">${escHtml(item.sub)}</span>` : ''}
        </span>
        <span class="palette-item-group">${escHtml(item.group)}</span>`;

      li.addEventListener('click', () => run(i));
      li.addEventListener('mousemove', () => setActive(i));
      els.paletteList.appendChild(li);
    });
  }

  function setActive(i) {
    if (i < 0 || i >= items.length) return;
    active = i;
    for (const el of els.paletteList.children) {
      el.classList.toggle('is-active', Number(el.dataset.index) === i);
    }
    els.paletteList.children[i]?.scrollIntoView({ block: 'nearest' });
  }

  function run(i) {
    const item = items[i];
    if (!item) return;
    close();
    if (item.type === 'shortcut') {
      const s = state.getShortcuts().find((x) => x.id === item.id);
      if (!s) return;
      window.open(s.url, s.openIn === 'same-tab' ? '_self' : '_blank', 'noopener');
      ctx.onNavigate(s);
    } else if (item.type === 'action') {
      item.run();
    }
  }

  function open() {
    els.paletteInput.value = '';
    render('');
    els.commandPalette.showModal();
    setTimeout(() => els.paletteInput.focus(), 0);
  }

  function close() {
    els.commandPalette.close();
  }

  function init() {
    els.paletteInput.addEventListener('input', () => render(els.paletteInput.value));
    els.commandPalette.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(active + 1, items.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(active - 1, 0)); }
      else if (e.key === 'Enter') { e.preventDefault(); run(active); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
    els.commandPalette.addEventListener('click', (e) => {
      if (e.target === els.commandPalette) close();
    });
    els.searchPaletteHint.addEventListener('click', open);
  }

  return { init, open, close };
}