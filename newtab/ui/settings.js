/**
 * Settings (Customize) modal + applying settings to the DOM, panel visibility,
 * background photo picker, and reset-to-defaults.
 */
import { fileToBackgroundDataUrl } from '../../lib/icons.js';
import { createBackup } from '../../lib/backup.js';
import {
  BG_DARK,
  BG_PRESETS,
  normalizeHex,
  contrastPaletteForBackground,
} from '../../lib/theme.js';
import { toColorInput, setActiveTab } from '../core/dom.js';

const BG_MODES = new Set(['none', 'url', 'upload']);

export function createSettingsModel(ctx) {
  const { els, state, grid, toast, bookmarks } = ctx;

  let bgMode = 'none';

  /** Apply background + opposite-contrast text/UI colors for readability. */
  function applyContrastFromBackground(bg) {
    const palette = contrastPaletteForBackground(bg);
    const root = document.documentElement;
    root.style.setProperty('--bg', palette.bg);
    root.style.setProperty('--text', palette.text);
    root.style.setProperty('--text-muted', palette.textMuted);
    root.style.setProperty('--bg-elevated', palette.bgElevated);
    root.style.setProperty('--bg-elevated-hover', palette.bgElevatedHover);
    root.style.setProperty('--border', palette.border);
    root.style.setProperty('--shadow', palette.shadow);
    root.style.colorScheme = palette.colorScheme;
    document.body.style.backgroundColor = palette.bg;

    // Keep data-theme in sync so light-only CSS rules (modals, tiles) match text.
    if (palette.isLight) {
      root.setAttribute('data-theme', 'light');
      if (els.themeIcon) {
        els.themeIcon.textContent = '☀️';
        els.btnTheme.title = 'Switch to dark theme';
      }
    } else {
      root.removeAttribute('data-theme');
      if (els.themeIcon) {
        els.themeIcon.textContent = '🌙';
        els.btnTheme.title = 'Switch to light theme';
      }
    }
    return palette;
  }

  function apply(settings) {
    const bg = normalizeHex(settings.backgroundColor) || BG_DARK;
    applyContrastFromBackground(bg);
    if (settings.backgroundImage) {
      document.body.style.backgroundImage = `url(${JSON.stringify(settings.backgroundImage)})`;
    } else {
      document.body.style.backgroundImage = '';
    }
    els.app.dataset.tileSize = settings.tileSize || 'medium';
    els.app.dataset.showLabels = String(settings.showLabels !== false);
    els.app.dataset.groupDisplay = settings.groupDisplay || 'grid';
    els.app.dataset.showBookmarks = String(Boolean(settings.showBookmarks));

    const columns = Number(settings.columns) || 0;
    els.grid.dataset.columns = String(columns);
    if (columns > 0) els.grid.style.setProperty('--columns', String(columns));
    else els.grid.style.removeProperty('--columns');
  }

  function applyPanelVisibility() {
    const settings = state.getSettings();
    const showBookmarks = Boolean(settings.showBookmarks);
    const showNotes = Boolean(settings.showNotes);
    const showRecent = settings.showRecent !== false;
    const showPanel = showBookmarks || showNotes || showRecent;
    els.rightPanel.hidden = !showPanel;
    els.app.dataset.showBookmarks = String(showPanel);
    els.recentBar.hidden = !showRecent;
    els.notesWidget.hidden = !showNotes;
    els.bookmarksWidget.hidden = !showBookmarks;
    const divRN = document.getElementById('panel-divider-rn');
    const divNB = document.getElementById('panel-divider');
    if (divRN) divRN.hidden = !(showRecent && showNotes);
    if (divNB) divNB.hidden = !(showNotes && showBookmarks) && !(showRecent && !showNotes && showBookmarks);
  }

  function setBgMode(mode) {
    bgMode = BG_MODES.has(mode) ? mode : 'none';
    setActiveTab('[data-bg-mode]', '.bg-picker [data-bg-panel]', 'bgPanel', bgMode);
    if (bgMode === 'none') {
      els.settingBgImage.value = '';
      els.settingBgImageUrl.value = '';
      els.settingBgFile.value = '';
      els.bgUploadStatus.hidden = true;
      els.btnClearBg.hidden = true;
    } else if (bgMode === 'url') {
      els.settingBgImage.value = els.settingBgImageUrl.value.trim();
    }
    updateBgPreview();
  }

  async function applyBackgroundFile(file) {
    try {
      const dataUrl = await fileToBackgroundDataUrl(file);
      els.settingBgImage.value = dataUrl;
      els.bgUploadStatus.hidden = false;
      els.bgUploadStatus.textContent = `Ready: ${file.name}`;
      els.btnClearBg.hidden = false;
      if (bgMode !== 'upload') setBgMode('upload');
      updateBgPreview();
      toast.show('Photo ready');
    } catch (error) {
      els.bgUploadStatus.hidden = false;
      els.bgUploadStatus.textContent = error.message || 'Upload failed';
      toast.show(error.message || 'Upload failed');
    }
  }

  function clearBackgroundPhoto() {
    els.settingBgImage.value = '';
    els.settingBgImageUrl.value = '';
    els.settingBgFile.value = '';
    els.bgUploadStatus.hidden = true;
    els.btnClearBg.hidden = true;
    setBgMode('none');
    updateBgPreview();
  }

  function updateBgPreview() {
    const image = els.settingBgImage.value.trim();
    const color = normalizeHex(els.settingBgColor.value) || BG_DARK;
    els.bgPreview.style.backgroundColor = color;
    if (image) {
      els.bgPreviewWrap.hidden = false;
      const safe = image.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      els.bgPreview.style.backgroundImage = `url("${safe}")`;
    } else {
      els.bgPreview.style.backgroundImage = 'none';
      els.bgPreviewWrap.hidden = bgMode === 'none';
    }
    syncBgPresetSelection(color);
  }

  function syncBgPresetSelection(color) {
    if (!els.bgPresets) return;
    const selected = (normalizeHex(color) || BG_DARK).toLowerCase();
    for (const btn of els.bgPresets.querySelectorAll('[data-bg-preset]')) {
      const active = (btn.dataset.bgPreset || '').toLowerCase() === selected;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-checked', String(active));
    }
  }

  function setBackgroundColor(color, { live = false } = {}) {
    const next = normalizeHex(color) || BG_DARK;
    els.settingBgColor.value = toColorInput(next, BG_DARK);
    updateBgPreview();
    if (live) {
      // Live-preview background + opposite font color so contrast is obvious.
      applyContrastFromBackground(next);
    }
  }

  function renderBgPresets() {
    if (!els.bgPresets) return;
    const dark = BG_PRESETS.filter((p) => p.group === 'dark');
    const light = BG_PRESETS.filter((p) => p.group === 'light');
    const swatch = (preset) =>
      `<button type="button" class="bg-preset" role="radio" data-bg-preset="${preset.value}" ` +
      `style="background-color: ${preset.value}" title="${preset.label}" ` +
      `aria-label="${preset.label}" aria-checked="false"></button>`;

    els.bgPresets.innerHTML =
      `<div class="bg-preset-group">` +
      `<span class="bg-preset-group-label">Popular dark</span>` +
      `<div class="bg-preset-swatches" role="presentation">${dark.map(swatch).join('')}</div>` +
      `</div>` +
      `<div class="bg-preset-group">` +
      `<span class="bg-preset-group-label">Popular light</span>` +
      `<div class="bg-preset-swatches" role="presentation">${light.map(swatch).join('')}</div>` +
      `</div>`;
  }

  function syncColumnsLabel() {
    const value = Number(els.settingColumns.value);
    els.settingColumnsValue.textContent = value === 0 ? 'Auto' : String(value);
  }

  function open() {
    const settings = state.getSettings();
    const bgImage = settings.backgroundImage || '';
    els.settingBgColor.value = toColorInput(settings.backgroundColor || BG_DARK, BG_DARK);
    els.settingBgImage.value = bgImage;
    els.settingBgImageUrl.value = bgImage.startsWith('http') ? bgImage : '';
    els.settingBgFile.value = '';
    els.bgUploadStatus.hidden = true;
    els.btnClearBg.hidden = !bgImage;
    els.settingColumns.value = String(settings.columns || 0);
    els.settingShowLabels.checked = settings.showLabels !== false;
    els.settingShowDescription.checked = settings.showDescription !== false;
    els.settingShowBookmarks.checked = Boolean(settings.showBookmarks);
    els.settingShowNotes.checked = Boolean(settings.showNotes);
    els.settingShowRecent.checked = settings.showRecent !== false;
    els.settingRecentCount.value = String(settings.recentCount || 5);
    els.settingShowFavorites.checked = settings.showFavorites !== false;
    syncColumnsLabel();
    for (const input of els.settingsForm.querySelectorAll('input[name="tile-size"]')) {
      input.checked = input.value === (settings.tileSize || 'medium');
    }
    if (!bgImage) setBgMode('none');
    else if (bgImage.startsWith('data:')) {
      setBgMode('upload');
      els.bgUploadStatus.hidden = false;
      els.bgUploadStatus.textContent = 'Using uploaded photo.';
      els.btnClearBg.hidden = false;
    } else setBgMode('url');
    updateBgPreview();
    els.settingsModal.showModal();
  }

  async function save(event) {
    event.preventDefault();
    const tileSize = els.settingsForm.querySelector('input[name="tile-size"]:checked')?.value || 'medium';
    let backgroundImage = '';
    if (bgMode === 'url') backgroundImage = els.settingBgImageUrl.value.trim();
    else if (bgMode === 'upload') backgroundImage = els.settingBgImage.value.trim();

    const backgroundColor = normalizeHex(els.settingBgColor.value) || BG_DARK;
    const palette = contrastPaletteForBackground(backgroundColor);

    state.patchSettings({
      backgroundColor,
      // Keep theme toggle aligned with the contrast that the background requires.
      theme: palette.theme,
      backgroundImage,
      tileSize,
      columns: Number(els.settingColumns.value) || 0,
      showLabels: els.settingShowLabels.checked,
      showDescription: els.settingShowDescription.checked,
      showBookmarks: els.settingShowBookmarks.checked,
      showNotes: els.settingShowNotes.checked,
      showRecent: els.settingShowRecent.checked,
      showFavorites: els.settingShowFavorites.checked,
      recentCount: Math.max(1, Math.min(20, Number(els.settingRecentCount.value) || 5)),
    });

    apply(state.getSettings());
    applyPanelVisibility();
    if (els.settingShowBookmarks.checked) bookmarks.load();
    ctx.recent?.render();
    await state.persist();
    els.settingsModal.close();
    toast.show('Dashboard updated');
  }

  async function reset() {
    const ok = window.confirm(
      'Reset shortcuts and settings to defaults?\n\n' +
      'A backup of your current data will be created automatically so you can restore it later.',
    );
    if (!ok) return;
    try {
      await createBackup('auto-reset');
    } catch (err) {
      console.warn('Failed to create backup before reset:', err);
    }
    await state.reset();
    apply(state.getSettings());
    grid.render();
    els.settingsModal.close();
    toast.show('Defaults restored (backup created)');
  }

  function resetTheme() {
    state.patchSettings({ theme: 'dark', backgroundColor: BG_DARK });
    apply(state.getSettings());
    applyPanelVisibility();
    state.persist();
    toast.show('Theme reset to dark mode');
  }

  function init() {
    renderBgPresets();
    els.btnSettings.addEventListener('click', () => open());
    els.settingsModalClose.addEventListener('click', () => els.settingsModal.close());
    els.btnSettingsCancel.addEventListener('click', () => els.settingsModal.close());
    // Restore committed background if the user only live-previewed (Esc / cancel / X).
    els.settingsModal.addEventListener('close', () => {
      apply(state.getSettings());
    });
    els.settingsForm.addEventListener('submit', save);
    els.btnReset.addEventListener('click', reset);
    els.btnResetTheme.addEventListener('click', resetTheme);
    els.settingColumns.addEventListener('input', syncColumnsLabel);

    for (const tab of document.querySelectorAll('[data-bg-mode]')) {
      tab.addEventListener('click', () => setBgMode(tab.dataset.bgMode));
    }
    els.settingBgImageUrl.addEventListener('input', () => {
      if (bgMode !== 'url') return;
      els.settingBgImage.value = els.settingBgImageUrl.value.trim();
      updateBgPreview();
    });
    els.settingBgColor.addEventListener('input', () => {
      setBackgroundColor(els.settingBgColor.value, { live: true });
    });
    if (els.bgPresets) {
      els.bgPresets.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-bg-preset]');
        if (!btn) return;
        setBackgroundColor(btn.dataset.bgPreset, { live: true });
      });
    }
    els.settingBgFile.addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (file) await applyBackgroundFile(file);
    });
    els.btnClearBg.addEventListener('click', clearBackgroundPhoto);
    els.bgUploadDrop.addEventListener('dragover', (event) => {
      event.preventDefault();
      els.bgUploadDrop.classList.add('is-dragover');
    });
    els.bgUploadDrop.addEventListener('dragleave', () => els.bgUploadDrop.classList.remove('is-dragover'));
    els.bgUploadDrop.addEventListener('drop', async (event) => {
      event.preventDefault();
      els.bgUploadDrop.classList.remove('is-dragover');
      const file = event.dataTransfer?.files?.[0];
      if (file) await applyBackgroundFile(file);
    });
  }

  return { init, open, apply, applyPanelVisibility };
}