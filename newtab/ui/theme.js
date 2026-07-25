/**
 * Theme service: 'auto' follows prefers-color-scheme, 'light'/'dark' explicit.
 * When switching themes, stock background colors follow so text stays readable.
 */
import {
  resolveTheme as resolveThemeValue,
  maybeSyncBackgroundForTheme,
} from '../../lib/theme.js';

function prefersLightScheme() {
  return Boolean(window.matchMedia?.('(prefers-color-scheme: light)').matches);
}

function resolveTheme(theme) {
  return resolveThemeValue(theme, prefersLightScheme());
}

export function createThemeModel(ctx) {
  const { els, state, toast } = ctx;

  function apply(theme) {
    const resolved = resolveTheme(theme);
    if (resolved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      els.themeIcon.textContent = '☀️';
      els.btnTheme.title = 'Switch to dark theme';
    } else {
      document.documentElement.removeAttribute('data-theme');
      els.themeIcon.textContent = '🌙';
      els.btnTheme.title = 'Switch to light theme';
    }
  }

  function isLight() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }

  /**
   * Apply theme + optionally sync a stock background color so light text
   * is not left on a dark page (or the reverse).
   * @returns {{ resolved: string, changed: boolean }}
   */
  function applyWithBackground(theme) {
    const resolved = resolveTheme(theme);
    const settings = state.getSettings();
    const nextBg = maybeSyncBackgroundForTheme(settings.backgroundColor, resolved);
    const patch = {};
    if (settings.theme !== theme) patch.theme = theme;
    // Compare normalized hex so #0F1221 and #0f1221 both count as stock.
    if (nextBg.toLowerCase() !== String(settings.backgroundColor || '').toLowerCase()) {
      patch.backgroundColor = nextBg;
    }
    const changed = Object.keys(patch).length > 0;
    if (changed) state.patchSettings(patch);
    apply(theme);
    ctx.settings?.apply(state.getSettings());
    return { resolved, changed };
  }

  async function toggle() {
    const current = isLight() ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyWithBackground(next);
    await state.persist();
    toast.show(next === 'light' ? 'Light theme' : 'Dark theme');
  }

  function init() {
    els.btnTheme.addEventListener('click', toggle);
    window.matchMedia?.('(prefers-color-scheme: light)').addEventListener('change', () => {
      if (state.getSettings().theme !== 'auto') return;
      const { changed } = applyWithBackground('auto');
      if (changed) state.persist();
    });
  }

  return { init, apply, applyWithBackground, toggle, isLight, resolveTheme };
}
