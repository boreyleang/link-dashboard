/**
 * Shortcut add/edit form, including the icon picker (Image URL / Upload / Search),
 * live preview, save/delete, and archive-single. Owns the transient form state
 * (icon mode, pending icon resolution, search results).
 */
import { createShortcut, updateShortcut, removeShortcut } from '../../lib/shortcuts.js';
import { faviconFromUrl, normalizeUrl } from '../../lib/url.js';
import {
  FREE_ICON_STORES,
  ICON_SEARCH_SUGGESTIONS,
  searchIcons,
  resolveIconifyToDataUrl,
  fileToIconDataUrl,
  detectIconMode,
  iconifySvgUrl,
} from '../../lib/icons.js';
import { toColorInput, getOpenInField, setOpenInField, setActiveTab, escHtml } from '../core/dom.js';

const ICON_MODES = new Set(['url', 'upload', 'search']);

export function createShortcutFormModel(ctx) {
  const { els, state, toast, grid } = ctx;

  let iconMode = 'url';
  let customIconValue = '';
  let pendingIconResolve = null;
  let iconColor = '#ffffff';
  let lastIconResults = [];
  let latestIconEmbedKey = '';
  let selectedSearchIconId = '';
  let searchDebounceTimer = null;
  let iconColorDebounceTimer = null;
  let fromTab = false;

  // ── Static picker chrome ──────────────────────────────────

  function renderFreeStores() {
    els.freeStoresList.innerHTML = '';
    for (const store of FREE_ICON_STORES) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = store.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = store.name;
      const note = document.createElement('span');
      note.textContent = store.note;
      li.append(link, note);
      els.freeStoresList.appendChild(li);
    }
  }

  function renderIconSuggestions() {
    els.iconSuggestions.innerHTML = '';
    for (const term of ICON_SEARCH_SUGGESTIONS) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.dataset.query = term;
      chip.textContent = term;
      els.iconSuggestions.appendChild(chip);
    }
  }

  // ── Icon mode tabs ───────────────────────────────────────

  function setIconMode(mode) {
    iconMode = ICON_MODES.has(mode) ? mode : 'url';
    setActiveTab('[data-icon-mode]', '.icon-picker [data-panel]', 'panel', iconMode);
    if (iconMode === 'url') {
      const value = els.fieldIconUrl.value.trim();
      customIconValue = value;
      els.fieldIcon.value = value;
    } else {
      els.fieldIcon.value = customIconValue;
    }
    updateFormPreview();
  }

  // ── Preview ──────────────────────────────────────────────

  function updateFormPreview() {
    const title = els.fieldTitle.value.trim() || 'Title';
    const url = els.fieldUrl.value.trim();
    const customIcon = els.fieldIcon.value.trim();
    const icon = customIcon || (url ? faviconFromUrl(url) : '');
    const color = els.fieldColor.value;

    els.previewTitle.textContent = title;
    els.previewFallback.textContent = title.slice(0, 1);
    els.previewTile.style.setProperty('--tile-color', color);
    els.previewIcon.classList.remove('is-loaded');

    if (icon) {
      els.previewIcon.src = icon;
      els.previewIcon.onload = () => els.previewIcon.classList.add('is-loaded');
      els.previewIcon.decode().then(() => els.previewIcon.classList.add('is-loaded')).catch(() => {});
    } else {
      els.previewIcon.removeAttribute('src');
    }
  }

  // ── Upload ───────────────────────────────────────────────

  async function applyUploadedFile(file) {
    try {
      const dataUrl = await fileToIconDataUrl(file);
      customIconValue = dataUrl;
      els.fieldIcon.value = dataUrl;
      selectedSearchIconId = '';
      els.uploadStatus.hidden = false;
      els.uploadStatus.textContent = `Ready: ${file.name}`;
      els.btnClearUpload.hidden = false;
      if (iconMode !== 'upload') setIconMode('upload');
      updateFormPreview();
      toast.show('Image ready');
    } catch (error) {
      els.uploadStatus.hidden = false;
      els.uploadStatus.textContent = error.message || 'Upload failed';
      toast.show(error.message || 'Upload failed');
    }
  }

  function clearUpload() {
    els.fieldIconFile.value = '';
    customIconValue = '';
    els.fieldIcon.value = '';
    els.uploadStatus.hidden = true;
    els.btnClearUpload.hidden = true;
    updateFormPreview();
  }

  // ── Search ───────────────────────────────────────────────

  async function runIconSearch() {
    const query = els.fieldIconSearch.value.trim();
    if (!query) {
      els.iconSearchStatus.textContent = 'Type a keyword to search free icons.';
      els.iconResults.innerHTML = '';
      lastIconResults = [];
      return;
    }
    els.iconSearchStatus.textContent = `Searching “${query}”…`;
    els.iconResults.innerHTML = '';
    lastIconResults = [];
    try {
      const { icons, total } = await searchIcons(query, { limit: 48, color: iconColor });
      if (!icons.length) {
        els.iconSearchStatus.textContent = 'No icons found. Try another word, or open free stores below.';
        return;
      }
      lastIconResults = icons;
      els.iconSearchStatus.textContent = `Found ${total.toLocaleString()} icons — showing ${icons.length}. Click one to use it.`;
      renderIconResults(icons);
    } catch (error) {
      console.error(error);
      els.iconSearchStatus.textContent = 'Search failed. Check your network, or use Image URL / Upload instead.';
      toast.show('Icon search failed');
    }
  }

  function renderIconResults(icons) {
    els.iconResults.innerHTML = '';
    for (const icon of icons) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'icon-result';
      btn.role = 'option';
      btn.dataset.iconId = icon.id;
      btn.title = icon.id;
      btn.setAttribute('aria-label', icon.id);
      if (icon.id === selectedSearchIconId) btn.classList.add('is-selected');
      const img = document.createElement('img');
      img.src = icon.svgUrl;
      img.alt = '';
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      btn.appendChild(img);
      els.iconResults.appendChild(btn);
    }
  }

  async function onIconResultClick(event) {
    const btn = event.target.closest('.icon-result');
    if (!btn) return;
    const iconId = btn.dataset.iconId;
    selectedSearchIconId = iconId;
    for (const el of els.iconResults.querySelectorAll('.icon-result')) {
      el.classList.toggle('is-selected', el.dataset.iconId === iconId);
    }
    await embedSearchIcon(iconId, 'Icon selected');
  }

  async function embedSearchIcon(iconId, toastMessage = '') {
    const key = `${iconId}|${iconColor}`;
    latestIconEmbedKey = key;
    els.iconSearchStatus.textContent = `Selected ${iconId} — embedding icon for offline use…`;
    const resolvePromise = resolveIconifyToDataUrl(iconId, iconColor);
    pendingIconResolve = resolvePromise;
    try {
      const dataUrl = await resolvePromise;
      if (latestIconEmbedKey !== key) return;
      if (!dataUrl || !dataUrl.startsWith('data:') || dataUrl.length < 100) {
        throw new Error('Icon resolved to an empty or invalid data URL');
      }
      customIconValue = dataUrl;
      els.fieldIcon.value = dataUrl;
      updateFormPreview();
      els.iconSearchStatus.textContent = `Selected ${iconId} (saved with shortcut)`;
      if (toastMessage) toast.show(toastMessage);
    } catch (error) {
      console.error(error);
      if (latestIconEmbedKey === key) {
        els.iconSearchStatus.textContent = 'Could not download that icon for offline use. Check network and try another.';
        toast.show('Could not load icon');
      }
    } finally {
      if (pendingIconResolve === resolvePromise) pendingIconResolve = null;
    }
  }

  function onIconColorChange() {
    iconColor = toColorInput(els.fieldIconColor.value, '#ffffff');
    clearTimeout(iconColorDebounceTimer);
    iconColorDebounceTimer = setTimeout(() => {
      for (const icon of lastIconResults) icon.svgUrl = iconifySvgUrl(icon.prefix, icon.name, iconColor);
      if (lastIconResults.length) renderIconResults(lastIconResults);
      if (iconMode === 'search' && selectedSearchIconId) embedSearchIcon(selectedSearchIconId);
    }, 200);
  }

  // ── Open / save / delete ─────────────────────────────────

  function open(item = null) {
    const editing = Boolean(item);
    fromTab = false;
    els.shortcutModalTitle.textContent = editing ? 'Edit shortcut' : 'Add shortcut';
    els.btnDelete.hidden = !editing;
    els.btnArchive.hidden = !editing;
    els.fieldId.value = item?.id || '';
    els.fieldTitle.value = item?.title || '';
    els.fieldUrl.value = item?.url || '';
    els.fieldColor.value = toColorInput(item?.color || '#4f6ef7');
    setOpenInField(els.shortcutForm, item?.openIn || 'new-tab');
    els.fieldDescription.value = item?.description || '';
    els.fieldGroup.value = item?.group || '';
    els.fieldOrder.value = String(item?.order ?? 0);
    els.fieldFavorite.checked = Boolean(item?.favorite);

    const existingGroups = [...new Set(
      state.getShortcuts().map((s) => s.group || '').filter(Boolean),
    )].sort();
    els.groupSuggestions.innerHTML = existingGroups
      .map((g) => `<option value="${g.replace(/"/g, '&quot;')}"></option>`)
      .join('');

    const icon = item?.icon || '';
    customIconValue = icon.startsWith('data:') ? icon : icon.startsWith('http') ? icon : '';
    pendingIconResolve = null;
    els.fieldIcon.value = customIconValue;
    els.fieldIconUrl.value = icon.startsWith('http') && !icon.includes('api.iconify.design') ? icon : '';
    els.fieldIconFile.value = '';
    els.fieldIconSearch.value = '';
    els.iconResults.innerHTML = '';
    lastIconResults = [];
    selectedSearchIconId = '';
    els.fieldIconColor.value = toColorInput(item?.iconColor || '', '#ffffff');
    iconColor = els.fieldIconColor.value;
    els.uploadStatus.hidden = true;
    els.btnClearUpload.hidden = !icon.startsWith('data:');
    els.iconSearchStatus.textContent = 'Powered by Iconify (free open icon sets).';

    const detected = detectIconMode(icon);
    const mode = detected === 'auto' ? 'url' : detected === 'search' ? 'search' : detected;
    setIconMode(mode);

    updateFormPreview();
    els.shortcutModal.showModal();
    els.fieldTitle.focus();
  }

  function openFromTab({ title, url }) {
    fromTab = true;
    open();
    els.shortcutModalTitle.textContent = 'Save current tab';
    els.fieldTitle.value = title || '';
    els.fieldUrl.value = url || '';
    els.fieldGroup.value = '';
    updateFormPreview();
  }

  async function save(event) {
    event.preventDefault();

    if (pendingIconResolve) {
      try {
        const dataUrl = await pendingIconResolve;
        if (dataUrl) {
          customIconValue = dataUrl;
          els.fieldIcon.value = dataUrl;
        }
      } catch {
        toast.show('Still downloading icon — try Save again');
        return;
      }
    }

    const id = els.fieldId.value;
    let icon = '';
    if (iconMode === 'url') icon = els.fieldIconUrl.value.trim();
    else if (iconMode === 'upload' || iconMode === 'search') icon = (customIconValue || els.fieldIcon.value || '').trim();

    if (iconMode === 'search' && icon && !icon.startsWith('data:')) {
      toast.show('Wait for the icon to finish embedding, then Save');
      return;
    }

    const payload = {
      title: els.fieldTitle.value,
      url: els.fieldUrl.value,
      icon,
      iconColor: els.fieldIconColor.value || '',
      color: els.fieldColor.value,
      openIn: getOpenInField(els.shortcutForm),
      description: els.fieldDescription.value.trim(),
      group: els.fieldGroup.value.trim(),
      order: Number(els.fieldOrder.value) || 0,
      favorite: els.fieldFavorite.checked,
    };

    if (!payload.url.trim()) {
      toast.show('URL is required');
      return;
    }

    if (fromTab && !id) {
      const normalizedUrl = normalizeUrl(payload.url);
      const exists = state.getShortcuts().some((s) => s.url === normalizedUrl);
      if (exists) {
        toast.show('This link is already saved');
        return;
      }
    }

    if (id) {
      state.setShortcuts(updateShortcut(state.getShortcuts(), id, payload));
      toast.show('Shortcut updated');
    } else {
      state.setShortcuts([...state.getShortcuts(), createShortcut(payload)]);
      toast.show('Shortcut added');
    }

    try {
      await state.persist();
    } catch (error) {
      console.error(error);
      toast.show('Could not save shortcut — storage failed');
      return;
    }

    grid.render();
    els.shortcutModal.close();
  }

  async function deleteShortcut() {
    const id = els.fieldId.value;
    if (!id) return;
    const item = state.getShortcuts().find((s) => s.id === id);
    if (!item) return;
    const prev = state.getShortcuts();
    state.setShortcuts(removeShortcut(state.getShortcuts(), id));
    await state.persist();
    grid.render();
    els.shortcutModal.close();
    toast.showUndo(`"${item.title}" deleted`, async () => {
      state.setShortcuts(prev);
      await state.persist();
      grid.render();
      toast.show('Restored');
    });
  }

  // ── Wiring ───────────────────────────────────────────────

  function init() {
    renderFreeStores();
    renderIconSuggestions();

    els.btnAdd.addEventListener('click', () => open());
    els.shortcutModalClose.addEventListener('click', () => els.shortcutModal.close());
    els.btnCancel.addEventListener('click', () => els.shortcutModal.close());
    els.btnDelete.addEventListener('click', deleteShortcut);
    els.shortcutForm.addEventListener('submit', save);

    for (const field of [els.fieldTitle, els.fieldUrl, els.fieldColor]) {
      field.addEventListener('input', updateFormPreview);
    }

    els.fieldIconUrl.addEventListener('input', () => {
      if (iconMode !== 'url') return;
      const value = els.fieldIconUrl.value.trim();
      customIconValue = value;
      els.fieldIcon.value = value;
      updateFormPreview();
    });

    for (const tab of document.querySelectorAll('[data-icon-mode]')) {
      tab.addEventListener('click', () => setIconMode(tab.dataset.iconMode));
    }

    els.fieldIconFile.addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (file) await applyUploadedFile(file);
    });
    els.btnClearUpload.addEventListener('click', clearUpload);

    els.uploadDrop.addEventListener('dragover', (event) => {
      event.preventDefault();
      els.uploadDrop.classList.add('is-dragover');
    });
    els.uploadDrop.addEventListener('dragleave', () => els.uploadDrop.classList.remove('is-dragover'));
    els.uploadDrop.addEventListener('drop', async (event) => {
      event.preventDefault();
      els.uploadDrop.classList.remove('is-dragover');
      const file = event.dataTransfer?.files?.[0];
      if (file) await applyUploadedFile(file);
    });

    els.btnIconSearch.addEventListener('click', () => runIconSearch());
    els.fieldIconSearch.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.preventDefault(); runIconSearch(); }
    });
    els.fieldIconSearch.addEventListener('input', () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        if (els.fieldIconSearch.value.trim().length >= 2) runIconSearch();
      }, 400);
    });

    els.iconResults.addEventListener('click', onIconResultClick);
    els.iconSuggestions.addEventListener('click', (event) => {
      const chip = event.target.closest('.chip');
      if (!chip) return;
      els.fieldIconSearch.value = chip.dataset.query || '';
      runIconSearch();
    });
    els.fieldIconColor.addEventListener('input', onIconColorChange);

    els.btnArchive.addEventListener('click', () => ctx.archive.archiveSingle());
  }

  return { init, open, openFromTab, save };
}