/**
 * Theme service: 'auto' follows prefers-color-scheme, 'light'/'dark' explicit.
 */
function resolveTheme(theme) {
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  return theme === 'auto' ? (prefersLight ? 'light' : 'dark') : theme;
}

export function createThemeModel({ els, state, toast }) {
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

  async function toggle() {
    const current = isLight() ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    state.patchSettings({ theme: next });
    apply(next);
    await state.persist();
    toast.show(next === 'light' ? 'Light theme' : 'Dark theme');
  }

  function init() {
    els.btnTheme.addEventListener('click', toggle);
    window.matchMedia?.('(prefers-color-scheme: light)').addEventListener('change', () => {
      if (state.getSettings().theme === 'auto') apply('auto');
    });
  }

  return { init, apply, toggle, isLight };
}