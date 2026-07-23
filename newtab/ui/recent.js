/**
 * Recently-visited widget: records shortcut clicks and renders the list.
 * Visit list math is delegated to the pure addRecentEntry helper.
 * Persisted via localStorage (matches original behaviour; the recent bar is
 * a local-only convenience, not part of the synced dashboard state).
 */
import { addRecentEntry } from '../../lib/recent.js';

const RECENT_KEY = 'linkDashboard_recent';

function readRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}

function writeRecent(recent) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent || []));
}

export function createRecentModel(ctx) {
  const { els, state } = ctx;

  /** Record a visit (called by grid navigation + palette). */
  function recordVisit(item) {
    const next = addRecentEntry(readRecent(), item, 20);
    writeRecent(next);
    render();
  }

  function clear() {
    localStorage.removeItem(RECENT_KEY);
    render();
  }

  function render() {
    if (!state.getSettings().showRecent) { els.recentBar.hidden = true; return; }
    let recent = readRecent();
    const ids = new Set(state.getShortcuts().map((s) => s.id));
    recent = recent.filter((r) => ids.has(r.id));
    const count = state.getSettings().recentCount || 5;
    recent = recent.slice(0, count);
    els.recentBar.hidden = recent.length === 0 || !state.getSettings().showRecent;
    els.recentList.innerHTML = '';

    for (const r of recent) {
      const a = document.createElement('a');
      a.className = 'recent-item';
      a.href = r.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.title = r.title;

      const iconWrap = document.createElement('div');
      iconWrap.className = 'recent-item-icon';
      const img = document.createElement('img');
      img.alt = '';
      img.referrerPolicy = 'no-referrer';
      try {
        const host = new URL(r.url).hostname;
        img.src = r.icon || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`;
      } catch { img.hidden = true; }
      img.decode().catch(() => {});
      iconWrap.appendChild(img);

      const label = document.createElement('span');
      label.className = 'recent-item-label';
      label.textContent = r.title || r.url;

      a.append(iconWrap, label);
      els.recentList.appendChild(a);
    }
  }

  function init() {
    els.recentToggle.addEventListener('click', () => {
      const expanded = els.recentToggle.getAttribute('aria-expanded') === 'true';
      els.recentToggle.setAttribute('aria-expanded', String(!expanded));
      els.recentBody.hidden = expanded;
    });
    els.recentClearBtn.addEventListener('click', clear);
    render();
  }

  return { init, render, recordVisit };
}