import { loadState, saveState, resetState, faviconFromUrl, STORE_CATALOG } from '../lib/storage.js';
import {
  createShortcut,
  updateShortcut,
  removeShortcut,
  reorderShortcuts,
  normalizeOpenIn,
} from '../lib/shortcuts.js';
import {
  FREE_ICON_STORES,
  ICON_SEARCH_SUGGESTIONS,
  searchIcons,
  resolveIconifyToDataUrl,
  ensureDurableIcon,
  fileToIconDataUrl,
  fileToBackgroundDataUrl,
  detectIconMode,
} from '../lib/icons.js';

const els = {
  app: document.getElementById('app'),
  clock: document.getElementById('clock'),
  grid: document.getElementById('shortcut-grid'),
  empty: document.getElementById('empty-state'),
  toast: document.getElementById('toast'),
  searchInput: document.getElementById('search-input'),
  searchClear: document.getElementById('search-clear'),
  rightPanel: document.getElementById('right-panel'),
  bookmarksWidget: document.getElementById('bookmarks-widget'),
  bookmarksToggle: document.getElementById('bookmarks-toggle'),
  bookmarksBody: document.getElementById('bookmarks-body'),
  bookmarksTree: document.getElementById('bookmarks-tree'),
  bookmarksSearch: document.getElementById('bookmarks-search'),
  devBadge: document.getElementById('dev-badge'),
  btnLock: document.getElementById('btn-lock'),
  lockIcon: document.getElementById('lock-icon'),
  lockLabel: document.getElementById('lock-label'),
  btnAdd: document.getElementById('btn-add'),
  btnArchiveView: document.getElementById('btn-archive-view'),
  btnSettings: document.getElementById('btn-settings'),
  shortcutModal: document.getElementById('shortcut-modal'),
  shortcutForm: document.getElementById('shortcut-form'),
  shortcutModalTitle: document.getElementById('shortcut-modal-title'),
  shortcutModalClose: document.getElementById('shortcut-modal-close'),
  fieldId: document.getElementById('field-id'),
  fieldTitle: document.getElementById('field-title'),
  fieldUrl: document.getElementById('field-url'),
  fieldIcon: document.getElementById('field-icon'),
  fieldIconUrl: document.getElementById('field-icon-url'),
  fieldIconFile: document.getElementById('field-icon-file'),
  fieldIconSearch: document.getElementById('field-icon-search'),
  fieldColor: document.getElementById('field-color'),
  fieldDescription: document.getElementById('field-description'),
  fieldShowDescription: document.getElementById('field-show-description'),
  fieldGroup: document.getElementById('field-group'),
  fieldOrder: document.getElementById('field-order'),
  groupSuggestions: document.getElementById('group-suggestions'),
  btnDelete: document.getElementById('btn-delete'),
  btnArchive: document.getElementById('btn-archive'),
  btnCancel: document.getElementById('btn-cancel'),
  btnIconSearch: document.getElementById('btn-icon-search'),
  btnClearUpload: document.getElementById('btn-clear-upload'),
  uploadDrop: document.getElementById('upload-drop'),
  uploadStatus: document.getElementById('upload-status'),
  iconSuggestions: document.getElementById('icon-suggestions'),
  iconResults: document.getElementById('icon-results'),
  iconSearchStatus: document.getElementById('icon-search-status'),
  freeStoresList: document.getElementById('free-stores-list'),
  previewTile: document.getElementById('form-preview'),
  previewIcon: document.getElementById('preview-icon'),
  previewFallback: document.getElementById('preview-fallback'),
  previewTitle: document.getElementById('preview-title'),
  settingsModal: document.getElementById('settings-modal'),
  settingsForm: document.getElementById('settings-form'),
  settingsModalClose: document.getElementById('settings-modal-close'),
  settingBgColor: document.getElementById('setting-bg-color'),
  settingBgImage: document.getElementById('setting-bg-image'),
  settingBgImageUrl: document.getElementById('setting-bg-image-url'),
  settingBgFile: document.getElementById('setting-bg-file'),
  bgUploadDrop: document.getElementById('bg-upload-drop'),
  bgUploadStatus: document.getElementById('bg-upload-status'),
  btnClearBg: document.getElementById('btn-clear-bg'),
  bgPreviewWrap: document.getElementById('bg-preview-wrap'),
  bgPreview: document.getElementById('bg-preview'),
  settingColumns: document.getElementById('setting-columns'),
  settingColumnsValue: document.getElementById('setting-columns-value'),
  settingShowLabels: document.getElementById('setting-show-labels'),
  settingShowDescription: document.getElementById('setting-show-description'),
  settingShowBookmarks: document.getElementById('setting-show-bookmarks'),
  settingShowNotes: document.getElementById('setting-show-notes'),
  settingShowRecent: document.getElementById('setting-show-recent'),
  btnExport: document.getElementById('btn-export'),
  btnImportFile: document.getElementById('btn-import-file'),
  notesWidget: document.getElementById('notes-widget'),
  notesToggle: document.getElementById('notes-toggle'),
  notesBody: document.getElementById('notes-body'),
  notesTextarea: document.getElementById('notes-textarea'),
  notesSavedHint: document.getElementById('notes-saved-hint'),
  recentBar: document.getElementById('recent-widget'),
  recentBody: document.getElementById('recent-body'),
  recentToggle: document.getElementById('recent-toggle'),
  recentList: document.getElementById('recent-list'),
  recentClearBtn: document.getElementById('recent-clear-btn'),
  btnReset: document.getElementById('btn-reset'),
  btnSettingsCancel: document.getElementById('btn-settings-cancel'),
  bulkToolbar: document.getElementById('bulk-toolbar'),
  bulkSelectAll: document.getElementById('bulk-select-all'),
  bulkCount: document.getElementById('bulk-count'),
  bulkMoveGroup: document.getElementById('bulk-move-group'),
  bulkArchiveBtn: document.getElementById('bulk-archive-btn'),
  bulkDeleteBtn: document.getElementById('bulk-delete-btn'),
  archiveModal: document.getElementById('archive-modal'),
  archiveModalClose: document.getElementById('archive-modal-close'),
  btnArchiveClose: document.getElementById('btn-archive-close'),
  archiveSelectAll: document.getElementById('archive-select-all'),
  archiveCount: document.getElementById('archive-count'),
  archiveRestoreBtn: document.getElementById('archive-restore-btn'),
  archiveDeleteBtn: document.getElementById('archive-delete-btn'),
  archiveList: document.getElementById('archive-list'),
  archiveEmpty: document.getElementById('archive-empty'),
  btnGroups: document.getElementById('btn-groups'),
  btnGroupFilter: document.getElementById('btn-group-filter'),
  btnStore: document.getElementById('btn-store'),
  groupsModal: document.getElementById('groups-modal'),
  groupsModalClose: document.getElementById('groups-modal-close'),
  btnGroupsClose: document.getElementById('btn-groups-close'),
  groupFilterModal: document.getElementById('group-filter-modal'),
  groupFilterModalClose: document.getElementById('group-filter-modal-close'),
  groupFilterAll: document.getElementById('filter-all'),
  groupFilterSocial: document.getElementById('filter-social'),
  groupFilterDesign: document.getElementById('filter-design'),
  groupFilterProductivity: document.getElementById('filter-productivity'),
  groupFilterDevelopment: document.getElementById('filter-development'),
  storeModal: document.getElementById('store-modal'),
  storeModalClose: document.getElementById('store-modal-close'),
  storeSearch: document.getElementById('store-search'),
  storeCategoryTabs: document.getElementById('store-category-tabs'),
  storeGrid: document.getElementById('store-grid'),
  storeEmpty: document.getElementById('store-empty'),
  storeSelectedCount: document.getElementById('store-selected-count'),
  btnStoreAdd: document.getElementById('btn-store-add'),
  groupManagerList: document.getElementById('group-manager-list'),
  groupsEmptyHint: document.getElementById('groups-empty-hint'),
  newGroupInput: document.getElementById('new-group-input'),
  btnAddGroup: document.getElementById('btn-add-group'),
  groupTabsBar: document.getElementById('group-tabs-bar'),
  groupTabs: document.getElementById('group-tabs'),
};

/** @type {{ shortcuts: Array, archived: Array, settings: object }} */
let state = {
  shortcuts: [],
  archived: [],
  settings: {},
};

let dragId = null;
let toastTimer = null;
/** @type {'url' | 'upload' | 'search'} */
let iconMode = 'url';
/** @type {'none' | 'url' | 'upload'} */
let bgMode = 'none';
let selectedSearchIconId = '';
let searchDebounceTimer = null;
/** Durable icon value for upload/search (not only the hidden input). */
let customIconValue = '';
/** @type {Promise<string> | null} */
let pendingIconResolve = null;
/** Whether the dashboard is locked (edit buttons hidden, drag disabled). */
let locked = true;
/** Set of shortcut IDs currently selected for bulk action. */
let selectedIds = new Set();
/** Currently active group tab (tabs display mode). */
let activeGroupTab = '';
/** Current search query string. */
let searchQuery = '';

const ICON_MODES = new Set(['url', 'upload', 'search']);
const BG_MODES = new Set(['none', 'url', 'upload']);

function isExtensionContext() {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);
}

async function init() {
  if (els.devBadge) {
    els.devBadge.hidden = isExtensionContext();
  }

  renderFreeStores();
  renderIconSuggestions();

  state = await loadState();
  state = await hydrateDurableIcons(state);
  if (!state.archived) state.archived = [];
  // Treat missing locked key as true (locked by default).
  // Use explicit key check so existing unlocked sessions are preserved.
  locked = 'locked' in state.settings ? Boolean(state.settings.locked) : true;
  applySettings(state.settings);
  applyLock();
  applyPanelVisibility();
  initBookmarksWidget();
  initNotesWidget();
  initRecentBar();
  renderGrid();
  startClock();
  bindEvents();
}

/**
 * Apply the current lock state to the UI.
 * Locked: edit buttons hidden, drag disabled, Add link hidden.
 * Unlocked: editing fully enabled.
 */
function applyLock() {
  els.app.dataset.locked = String(locked);
  els.btnAdd.hidden = locked;
  els.btnArchiveView.hidden = locked;
  els.btnGroups.hidden = locked;
  els.btnStore.hidden = locked;
  els.btnSettings.hidden = locked;
  // Clear selection when locking
  if (locked) {
    selectedIds.clear();
    updateBulkToolbar();
  }
  els.bulkToolbar.hidden = locked;
  if (locked) {
    els.lockIcon.textContent = '🔒';
    els.lockLabel.textContent = 'Locked';
    els.btnLock.classList.remove('is-unlocked');
    els.btnLock.title = 'Unlock to edit shortcuts';
  } else {
    els.lockIcon.textContent = '🔓';
    els.lockLabel.textContent = 'Unlocked';
    els.btnLock.classList.add('is-unlocked');
    els.btnLock.title = 'Lock dashboard';
  }
}

/**
 * Convert any legacy remote Iconify icon URLs into embedded data URLs and re-save.
 * Fixes icons that worked until restart because they depended on the live CDN.
 * @param {{ shortcuts: Array, settings: object }} current
 */
async function hydrateDurableIcons(current) {
  let changed = false;
  const shortcuts = [];

  for (const item of current.shortcuts || []) {
    const original = String(item.icon || '');
    try {
      const durable = await ensureDurableIcon(original);
      if (durable && durable !== original) {
        changed = true;
        shortcuts.push({ ...item, icon: durable });
      } else {
        shortcuts.push(item);
      }
    } catch (error) {
      console.warn('Could not embed icon for', item.title, error);
      shortcuts.push(item);
    }
  }

  if (!changed) return current;

  const next = { ...current, shortcuts };
  try {
    await saveState(next);
  } catch (error) {
    console.error('Failed to persist embedded icons', error);
  }
  return next;
}

function tickClock() {
  const now = new Date();
  els.clock.textContent = now.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Render the clock now, then schedule the next tick to align with the next
 * minute boundary so the displayed time never drifts behind the wall clock.
 */
function startClock() {
  tickClock();
  const msUntilNextMinute = 60_000 - (Date.now() % 60_000);
  setTimeout(function scheduleAlignedTick() {
    tickClock();
    setInterval(tickClock, 60_000);
  }, msUntilNextMinute);
}

function bindEvents() {
  els.btnLock.addEventListener('click', onToggleLock);
  els.btnAdd.addEventListener('click', () => openShortcutModal());
  els.btnArchiveView.addEventListener('click', openArchiveModal);
  els.btnGroups.addEventListener('click', openGroupsModal);
  els.btnGroupFilter.addEventListener('click', openGroupFilterModal);
  els.btnStore.addEventListener('click', openStoreModal);
  els.btnSettings.addEventListener('click', openSettingsModal);

  // Bulk toolbar
  els.bulkSelectAll.addEventListener('change', onBulkSelectAll);
  els.bulkMoveGroup.addEventListener('change', onBulkMoveGroup);
  els.bulkArchiveBtn.addEventListener('click', onBulkArchive);
  els.bulkDeleteBtn.addEventListener('click', onBulkDelete);

  // Archive modal
  els.archiveModalClose.addEventListener('click', () => els.archiveModal.close());
  els.btnArchiveClose.addEventListener('click', () => els.archiveModal.close());
  els.archiveSelectAll.addEventListener('change', onArchiveSelectAll);
  els.archiveRestoreBtn.addEventListener('click', onArchiveRestore);
  els.archiveDeleteBtn.addEventListener('click', onArchiveDeletePermanent);

  // Archive button in shortcut modal
  els.btnArchive.addEventListener('click', onArchiveSingleShortcut);
  els.btnExport.addEventListener('click', onExportShortcuts);
  els.btnImportFile.addEventListener('change', onImportShortcuts);

  els.searchInput.addEventListener('input', () => {
    searchQuery = els.searchInput.value;
    els.searchClear.hidden = !searchQuery;
    renderGrid();
  });
  els.searchClear.addEventListener('click', () => {
    searchQuery = '';
    els.searchInput.value = '';
    els.searchClear.hidden = true;
    els.searchInput.focus();
    renderGrid();
  });
  // Keyboard shortcut: / or Ctrl+F focuses search
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchQuery) {
      searchQuery = '';
      els.searchInput.value = '';
      els.searchClear.hidden = true;
      renderGrid();
      return;
    }
    const tag = document.activeElement?.tagName;
    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      els.searchInput.focus();
    }
  });

  els.shortcutModalClose.addEventListener('click', () => els.shortcutModal.close());
  els.btnCancel.addEventListener('click', () => els.shortcutModal.close());
  els.btnDelete.addEventListener('click', onDeleteShortcut);
  els.shortcutForm.addEventListener('submit', onSaveShortcut);

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

  // Only icon-source buttons (not background-mode tabs that share the same CSS class)
  for (const tab of document.querySelectorAll('[data-icon-mode]')) {
    tab.addEventListener('click', () => setIconMode(tab.dataset.iconMode));
  }

  els.fieldIconFile.addEventListener('change', onIconFileSelected);
  els.btnClearUpload.addEventListener('click', clearUpload);

  els.uploadDrop.addEventListener('dragover', (event) => {
    event.preventDefault();
    els.uploadDrop.classList.add('is-dragover');
  });
  els.uploadDrop.addEventListener('dragleave', () => {
    els.uploadDrop.classList.remove('is-dragover');
  });
  els.uploadDrop.addEventListener('drop', async (event) => {
    event.preventDefault();
    els.uploadDrop.classList.remove('is-dragover');
    const file = event.dataTransfer?.files?.[0];
    if (file) await applyUploadedFile(file);
  });

  els.btnIconSearch.addEventListener('click', () => runIconSearch());
  els.fieldIconSearch.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      runIconSearch();
    }
  });
  els.fieldIconSearch.addEventListener('input', () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      if (els.fieldIconSearch.value.trim().length >= 2) {
        runIconSearch();
      }
    }, 400);
  });

  els.iconResults.addEventListener('click', onIconResultClick);
  els.iconSuggestions.addEventListener('click', onSuggestionClick);

  els.settingsModalClose.addEventListener('click', () => els.settingsModal.close());
  els.btnSettingsCancel.addEventListener('click', () => els.settingsModal.close());
  els.settingsForm.addEventListener('submit', onSaveSettings);
  els.btnReset.addEventListener('click', onResetDefaults);
  els.settingColumns.addEventListener('input', syncColumnsLabel);

  // Group filter modal
  els.groupFilterModalClose.addEventListener('click', () => els.groupFilterModal.close());
  document.getElementById('btn-group-filter-clear').addEventListener('click', onGroupFilterClear);
  document.getElementById('btn-group-filter-apply').addEventListener('click', onGroupFilterApply);
  for (const cb of els.groupFilterModal.querySelectorAll('input[name="filter-group"]')) {
    cb.addEventListener('change', onGroupFilterCheck);
  }

  // Store modal
  els.storeModalClose.addEventListener('click', () => els.storeModal.close());
  document.getElementById('btn-store-cancel').addEventListener('click', () => els.storeModal.close());
  els.btnStoreAdd.addEventListener('click', onStoreAddSelected);
  els.storeSearch.addEventListener('input', () => renderStoreGrid(storeActiveCategory));

  for (const tab of document.querySelectorAll('[data-bg-mode]')) {
    tab.addEventListener('click', () => setBgMode(tab.dataset.bgMode));
  }

  els.settingBgImageUrl.addEventListener('input', () => {
    if (bgMode !== 'url') return;
    els.settingBgImage.value = els.settingBgImageUrl.value.trim();
    updateBgPreview();
  });

  els.settingBgColor.addEventListener('input', updateBgPreview);

  els.settingBgFile.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (file) await applyBackgroundFile(file);
  });

  els.btnClearBg.addEventListener('click', clearBackgroundPhoto);

  els.bgUploadDrop.addEventListener('dragover', (event) => {
    event.preventDefault();
    els.bgUploadDrop.classList.add('is-dragover');
  });
  els.bgUploadDrop.addEventListener('dragleave', () => {
    els.bgUploadDrop.classList.remove('is-dragover');
  });
  els.bgUploadDrop.addEventListener('drop', async (event) => {
    event.preventDefault();
    els.bgUploadDrop.classList.remove('is-dragover');
    const file = event.dataTransfer?.files?.[0];
    if (file) await applyBackgroundFile(file);
  });

  els.grid.addEventListener('click', onGridClick);
  els.grid.addEventListener('click', onGridTileNavigate);
  els.grid.addEventListener('dragstart', onDragStart);
  els.grid.addEventListener('dragover', onDragOver);
  els.grid.addEventListener('drop', onDrop);
  els.grid.addEventListener('dragend', onDragEnd);
}

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

/**
 * Toggle a tab/panel pair so only the chosen mode is active.
 * Shared by icon-source and background-source pickers.
 * @param {string} tabSelector   e.g. '[data-icon-mode]'
 * @param {string} panelSelector e.g. '.icon-picker [data-panel]'
 * @param {string} dataKey       dataset key on the tab/panel elements (e.g. 'iconMode')
 * @param {string} mode          the value to activate
 */
function setActiveTab(tabSelector, panelSelector, dataKey, mode) {
  for (const tab of document.querySelectorAll(tabSelector)) {
    const active = tab.dataset[dataKey] === mode;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.setAttribute('tabindex', active ? '0' : '-1');
  }

  for (const panel of document.querySelectorAll(panelSelector)) {
    const active = panel.dataset[dataKey] === mode;
    panel.classList.toggle('is-active', active);
    panel.hidden = !active;
    panel.setAttribute('aria-hidden', String(!active));
    if (active) {
      panel.removeAttribute('inert');
    } else {
      panel.setAttribute('inert', '');
    }
  }
}

/**
 * Enable one icon-source section and disable all others.
 * @param {'url' | 'upload' | 'search'} mode
 */
function setIconMode(mode) {
  iconMode = ICON_MODES.has(mode) ? mode : 'url';
  setActiveTab('[data-icon-mode]', '.icon-picker [data-panel]', 'panel', iconMode);

  if (iconMode === 'url') {
    const value = els.fieldIconUrl.value.trim();
    customIconValue = value;
    els.fieldIcon.value = value;
  } else {
    // Keep previously chosen upload/search image when switching back to those tabs
    els.fieldIcon.value = customIconValue;
  }

  updateFormPreview();
}

function applySettings(settings) {
  const bg = settings.backgroundColor || '#0f1221';
  document.documentElement.style.setProperty('--bg', bg);
  document.body.style.backgroundColor = bg;

  if (settings.backgroundImage) {
    // JSON.stringify safely quotes data URLs and remote URLs for CSS url()
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
  if (columns > 0) {
    els.grid.style.setProperty('--columns', String(columns));
  } else {
    els.grid.style.removeProperty('--columns');
  }
}

/** Apply right-panel + widget visibility from settings */
function applyPanelVisibility() {
  const showBookmarks = Boolean(state.settings.showBookmarks);
  const showNotes = Boolean(state.settings.showNotes);
  const showRecent = Boolean(state.settings.showRecent !== false);

  // Right panel visible if any widget is on
  const showPanel = showBookmarks || showNotes || showRecent;
  els.rightPanel.hidden = !showPanel;
  els.app.dataset.showBookmarks = String(showPanel);

  els.recentBar.hidden = !showRecent;
  els.notesWidget.hidden = !showNotes;
  els.bookmarksWidget.hidden = !showBookmarks;

  // Dividers — show only between two adjacent visible widgets
  const divRN = document.getElementById('panel-divider-rn');
  const divNB = document.getElementById('panel-divider');
  if (divRN) divRN.hidden = !(showRecent && showNotes);
  if (divNB) divNB.hidden = !(showNotes && showBookmarks) && !(showRecent && !showNotes && showBookmarks);
}

/**
 * Wrap occurrences of `query` in `text` with a highlight span.
 * Safely escapes HTML so data can't inject markup.
 */
function highlight(text, query) {
  if (!query || !text) return escHtml(text || '');
  const escaped = escHtml(text);
  const escapedQ = escHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped.replace(
    new RegExp(escapedQ, 'gi'),
    (m) => `<mark class="search-highlight">${m}</mark>`
  );
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Get sorted group names respecting user-defined groupOrder, then alpha, ungrouped last.
 */
function getSortedGroupNames(shortcuts) {
  const groupOrder = state.settings.groupOrder || [];
  const allGroups = [...new Set(shortcuts.map((s) => s.group || ''))];
  return allGroups.sort((a, b) => {
    if (a === '' && b !== '') return 1;
    if (a !== '' && b === '') return -1;
    const ai = groupOrder.indexOf(a);
    const bi = groupOrder.indexOf(b);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.localeCompare(b);
  });
}

function renderGrid() {
  const display = state.settings.groupDisplay || 'grid';
  const q = searchQuery.trim().toLowerCase();

  // Filter shortcuts by selected groups
  const activeGroups = state.settings.filterGroups || [];
  let shortcuts = state.shortcuts;
  if (activeGroups.length > 0) {
    shortcuts = shortcuts.filter((s) => activeGroups.includes(s.group || ''));
  }

  // Filter shortcuts by search query
  if (q) {
    shortcuts = shortcuts.filter((s) =>
      (s.title || '').toLowerCase().includes(q) ||
      (s.url || '').toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q) ||
      (s.group || '').toLowerCase().includes(q)
    );
  }

  els.grid.innerHTML = '';
  els.empty.hidden = state.shortcuts.length > 0;
  if (!state.shortcuts.length) {
    els.groupTabsBar.hidden = true;
    return;
  }

  // No results from search or filter
  if (!shortcuts.length) {
    els.groupTabsBar.hidden = true;
    const msg = document.createElement('p');
    msg.className = 'search-empty';
    if (q) {
      msg.textContent = `No links match "${searchQuery}"`;
    } else {
      msg.textContent = 'No links in selected groups';
    }
    els.grid.appendChild(msg);
    return;
  }

  // Build grouped map
  const grouped = new Map();
  shortcuts.forEach((item, idx) => {
    const g = item.group || '';
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g).push({ item, idx });
  });

  const groupNames = getSortedGroupNames(shortcuts);
  const showGroups = groupNames.some((g) => g !== '');

  // Tabs bar
  if (display === 'tabs' && showGroups) {
    els.groupTabsBar.hidden = false;
    els.groupTabs.innerHTML = '';
    // Ensure activeGroupTab is valid
    if (!groupNames.includes(activeGroupTab)) {
      activeGroupTab = groupNames[0] || '';
    }
    for (const g of groupNames) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'group-tab' + (g === activeGroupTab ? ' is-active' : '');
      btn.textContent = g || 'Other';
      btn.dataset.group = g;
      btn.addEventListener('click', () => {
        activeGroupTab = g;
        renderGrid();
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

    // Wrap in a section for tabs mode targeting
    const section = document.createElement('div');
    section.className = 'group-section' + (groupName === activeGroupTab || display !== 'tabs' ? ' is-active' : '');
    section.dataset.group = groupName;

    if (showGroups) {
      const heading = document.createElement('div');
      heading.className = 'group-heading';
      heading.dataset.group = groupName;
      const label = document.createElement('span');
      label.className = 'group-heading-label';
      label.textContent = groupName || 'Other';
      const line = document.createElement('span');
      line.className = 'group-heading-line';
      heading.append(label, line);
      section.appendChild(heading);
    }

    // Wrap tiles in a grid container for flex groups
    const tileGrid = document.createElement('div');
    tileGrid.className = 'tile-grid';
    for (const { item } of entries) {
      tileGrid.appendChild(createTileElement(item));
    }
    section.appendChild(tileGrid);

    els.grid.appendChild(section);
  }
  // Refresh bulk toolbar after re-render
  updateBulkToolbar();
}

function createTileElement(item) {
  const tile = document.createElement('div');
  tile.className = 'tile' + (selectedIds.has(item.id) ? ' is-selected' : '');
  tile.dataset.id = item.id;
  tile.draggable = !locked;
  tile.style.setProperty('--tile-color', item.color || '#4f6ef7');

  // Bulk checkbox (visible only when unlocked)
  const checkWrap = document.createElement('div');
  checkWrap.className = 'tile-checkbox-wrap';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'tile-checkbox';
  checkbox.checked = selectedIds.has(item.id);
  checkbox.setAttribute('aria-label', `Select ${item.title}`);
  checkbox.addEventListener('change', (e) => {
    e.stopPropagation();
    if (checkbox.checked) selectedIds.add(item.id);
    else selectedIds.delete(item.id);
    tile.classList.toggle('is-selected', checkbox.checked);
    updateBulkToolbar();
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
    openShortcutModal(item);
  });
  editBtn.addEventListener('mousedown', (event) => event.stopPropagation());
  editBtn.addEventListener('pointerdown', (event) => event.stopPropagation());

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
    img.onerror = () => {
      const host = (() => { try { return new URL(item.url).hostname; } catch { return null; } })();
      if (host && !img.src.includes('google.com/s2/favicons')) {
        img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
      }
    };
    img.decode()
      .then(() => img.classList.add('is-loaded'))
      .catch(() => {});
  }

  iconWrap.append(img, fallback);

  const label = document.createElement('span');
  label.className = 'tile-label';
  if (searchQuery) {
    label.innerHTML = highlight(item.title, searchQuery);
  } else {
    label.textContent = item.title;
  }

  link.append(iconWrap, label);

  if (item.description && state.settings.showDescription !== false) {
    const desc = document.createElement('span');
    desc.className = 'tile-description';
    if (searchQuery) {
      desc.innerHTML = highlight(item.description, searchQuery);
    } else {
      desc.textContent = item.description;
    }
    link.appendChild(desc);
  }

  tile.append(checkWrap, editBtn, link);
  return tile;
}

function onGridClick(event) {
  if (locked) return;
  const editBtn = event.target.closest('[data-action="edit"]');
  if (!editBtn) return;

  event.preventDefault();
  event.stopPropagation();
  const item = state.shortcuts.find((s) => s.id === editBtn.dataset.id);
  if (item) openShortcutModal(item);
}

function openShortcutModal(item = null) {
  const editing = Boolean(item);
  els.shortcutModalTitle.textContent = editing ? 'Edit shortcut' : 'Add shortcut';
  els.btnDelete.hidden = !editing;
  els.btnArchive.hidden = !editing;
  els.fieldId.value = item?.id || '';
  els.fieldTitle.value = item?.title || '';
  els.fieldUrl.value = item?.url || '';
  els.fieldColor.value = toColorInput(item?.color || '#4f6ef7');
  setOpenInField(item?.openIn || 'new-tab');
  els.fieldDescription.value = item?.description || '';
  els.fieldGroup.value = item?.group || '';
  els.fieldOrder.value = String(item?.order ?? 0);

  // Populate group autocomplete from all existing groups
  const existingGroups = [...new Set(
    state.shortcuts.map((s) => s.group || '').filter(Boolean)
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
  selectedSearchIconId = '';
  els.uploadStatus.hidden = true;
  els.btnClearUpload.hidden = !icon.startsWith('data:');
  els.iconSearchStatus.textContent = 'Powered by Iconify (free open icon sets).';

  // Map legacy "auto" (empty icon) to Image URL — favicon is used when URL is empty
  const detected = detectIconMode(icon);
  const mode = detected === 'auto' ? 'url' : detected === 'search' ? 'search' : detected;
  setIconMode(mode);

  updateFormPreview();
  els.shortcutModal.showModal();
  els.fieldTitle.focus();
}

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
    els.previewIcon.decode()
      .then(() => els.previewIcon.classList.add('is-loaded'))
      .catch(() => {});
  } else {
    els.previewIcon.removeAttribute('src');
  }
}

async function onIconFileSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  await applyUploadedFile(file);
}

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
    showToast('Image ready');
  } catch (error) {
    els.uploadStatus.hidden = false;
    els.uploadStatus.textContent = error.message || 'Upload failed';
    showToast(error.message || 'Upload failed');
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

function onSuggestionClick(event) {
  const chip = event.target.closest('.chip');
  if (!chip) return;
  els.fieldIconSearch.value = chip.dataset.query || '';
  runIconSearch();
}

async function runIconSearch() {
  const query = els.fieldIconSearch.value.trim();
  if (!query) {
    els.iconSearchStatus.textContent = 'Type a keyword to search free icons.';
    els.iconResults.innerHTML = '';
    return;
  }

  els.iconSearchStatus.textContent = `Searching “${query}”…`;
  els.iconResults.innerHTML = '';

  try {
    const { icons, total } = await searchIcons(query, { limit: 48 });
    if (!icons.length) {
      els.iconSearchStatus.textContent = 'No icons found. Try another word, or open free stores below.';
      return;
    }

    els.iconSearchStatus.textContent = `Found ${total.toLocaleString()} icons — showing ${icons.length}. Click one to use it.`;
    renderIconResults(icons);
  } catch (error) {
    console.error(error);
    els.iconSearchStatus.textContent =
      'Search failed. Check your network, or use Image URL / Upload instead.';
    showToast('Icon search failed');
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
    if (icon.id === selectedSearchIconId) {
      btn.classList.add('is-selected');
    }

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

  els.iconSearchStatus.textContent = `Selected ${iconId} — embedding icon for offline use…`;

  const resolvePromise = resolveIconifyToDataUrl(iconId);
  pendingIconResolve = resolvePromise;

  try {
    const dataUrl = await resolvePromise;
    // Ignore stale results if the user picked another icon meanwhile
    if (selectedSearchIconId !== iconId) {
      return;
    }
    // Sanity-check: must be a non-trivial data URL
    if (!dataUrl || !dataUrl.startsWith('data:') || dataUrl.length < 100) {
      throw new Error('Icon resolved to an empty or invalid data URL');
    }
    customIconValue = dataUrl;
    els.fieldIcon.value = dataUrl;
    updateFormPreview();
    els.iconSearchStatus.textContent = `Selected ${iconId} (saved with shortcut)`;
    showToast('Icon selected');
  } catch (error) {
    console.error(error);
    if (selectedSearchIconId === iconId) {
      els.iconSearchStatus.textContent =
        'Could not download that icon for offline use. Check network and try another.';
      showToast('Could not load icon');
    }
  } finally {
    if (pendingIconResolve === resolvePromise) {
      pendingIconResolve = null;
    }
  }
}

async function onSaveShortcut(event) {
  event.preventDefault();

  // Wait if a search-icon download is still embedding
  if (pendingIconResolve) {
    try {
      const dataUrl = await pendingIconResolve;
      if (dataUrl) {
        customIconValue = dataUrl;
        els.fieldIcon.value = dataUrl;
      }
    } catch {
      showToast('Still downloading icon — try Save again');
      return;
    }
  }

  const id = els.fieldId.value;
  let icon = '';

  if (iconMode === 'url') {
    icon = els.fieldIconUrl.value.trim();
  } else if (iconMode === 'upload' || iconMode === 'search') {
    icon = (customIconValue || els.fieldIcon.value || '').trim();
  }

  // Search icons must be embedded data URLs so they survive browser restarts
  if (iconMode === 'search' && icon && !icon.startsWith('data:')) {
    showToast('Wait for the icon to finish embedding, then Save');
    return;
  }

  const payload = {
    title: els.fieldTitle.value,
    url: els.fieldUrl.value,
    icon,
    color: els.fieldColor.value,
    openIn: getOpenInField(),
    description: els.fieldDescription.value.trim(),
    group: els.fieldGroup.value.trim(),
    order: Number(els.fieldOrder.value) || 0,
  };

  if (!payload.url.trim()) {
    showToast('URL is required');
    return;
  }

  if (id) {
    state.shortcuts = updateShortcut(state.shortcuts, id, payload);
    showToast('Shortcut updated');
  } else {
    state.shortcuts = [...state.shortcuts, createShortcut(payload)];
    showToast('Shortcut added');
  }

  try {
    await persist();
  } catch (error) {
    console.error(error);
    showToast('Could not save shortcut — storage failed');
    return;
  }

  renderGrid();
  els.shortcutModal.close();
}

async function onDeleteShortcut() {
  const id = els.fieldId.value;
  if (!id) return;

  const ok = window.confirm('Permanently delete this shortcut?');
  if (!ok) return;

  state.shortcuts = removeShortcut(state.shortcuts, id);
  await persist();
  renderGrid();
  els.shortcutModal.close();
  showToast('Shortcut deleted');
}

// ── Archive single shortcut (from edit modal) ─────────────
async function onArchiveSingleShortcut() {
  const id = els.fieldId.value;
  if (!id) return;
  const item = state.shortcuts.find((s) => s.id === id);
  if (!item) return;

  state.archived = [
    { ...item, archivedAt: new Date().toISOString() },
    ...(state.archived || []),
  ];
  state.shortcuts = removeShortcut(state.shortcuts, id);
  selectedIds.delete(id);
  await persist();
  renderGrid();
  els.shortcutModal.close();
  showToast(`"${item.title}" archived`);
}

// ── Bulk action helpers ────────────────────────────────────

/** Rebuild the bulk toolbar state after selection changes */
function updateBulkToolbar() {
  if (locked) { els.bulkToolbar.hidden = true; return; }
  els.bulkToolbar.hidden = false;
  const n = selectedIds.size;
  els.bulkCount.textContent = `${n} selected`;
  els.bulkSelectAll.indeterminate = n > 0 && n < state.shortcuts.length;
  els.bulkSelectAll.checked = n > 0 && n === state.shortcuts.length;

  // Populate group options
  const groups = [...new Set(state.shortcuts.map((s) => s.group || '').filter(Boolean))].sort();
  els.bulkMoveGroup.innerHTML = '<option value="">Move to group…</option>'
    + groups.map((g) => `<option value="${escHtml(g)}">${escHtml(g)}</option>`).join('')
    + '<option value="__ungroup__">— Remove from group</option>';
}

function onBulkSelectAll() {
  if (els.bulkSelectAll.checked) {
    state.shortcuts.forEach((s) => selectedIds.add(s.id));
  } else {
    selectedIds.clear();
  }
  renderGrid();
  updateBulkToolbar();
}

async function onBulkMoveGroup() {
  const val = els.bulkMoveGroup.value;
  if (!val) return;
  const group = val === '__ungroup__' ? '' : val;
  state.shortcuts = state.shortcuts.map((s) =>
    selectedIds.has(s.id) ? { ...s, group } : s
  );
  selectedIds.clear();
  await persist();
  renderGrid();
  updateBulkToolbar();
  showToast(group ? `Moved to "${group}"` : 'Removed from group');
  els.bulkMoveGroup.value = '';
}

async function onBulkArchive() {
  if (!selectedIds.size) { showToast('Select links first'); return; }
  const toArchive = state.shortcuts.filter((s) => selectedIds.has(s.id));
  const now = new Date().toISOString();
  state.archived = [
    ...toArchive.map((s) => ({ ...s, archivedAt: now })),
    ...(state.archived || []),
  ];
  state.shortcuts = state.shortcuts.filter((s) => !selectedIds.has(s.id));
  const n = toArchive.length;
  selectedIds.clear();
  await persist();
  renderGrid();
  updateBulkToolbar();
  showToast(`${n} link${n !== 1 ? 's' : ''} archived`);
}

async function onBulkDelete() {
  if (!selectedIds.size) { showToast('Select links first'); return; }
  const n = selectedIds.size;
  const ok = window.confirm(`Permanently delete ${n} link${n !== 1 ? 's' : ''}?`);
  if (!ok) return;
  state.shortcuts = state.shortcuts.filter((s) => !selectedIds.has(s.id));
  selectedIds.clear();
  await persist();
  renderGrid();
  updateBulkToolbar();
  showToast(`${n} link${n !== 1 ? 's' : ''} deleted`);
}

// ── Archive modal ──────────────────────────────────────────

function openArchiveModal() {
  renderArchiveList();
  els.archiveModal.showModal();
}

function renderArchiveList() {
  const archived = state.archived || [];
  els.archiveEmpty.hidden = archived.length > 0;
  els.archiveSelectAll.checked = false;
  els.archiveCount.textContent = '0 selected';
  els.archiveList.innerHTML = '';

  for (const item of archived) {
    const li = document.createElement('li');
    li.className = 'archive-item';
    li.dataset.id = item.id;

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'archive-item-check';
    cb.setAttribute('aria-label', `Select ${item.title}`);
    cb.addEventListener('change', updateArchiveCount);

    const iconDiv = document.createElement('div');
    iconDiv.className = 'archive-item-icon';
    const img = document.createElement('img');
    img.alt = '';
    img.referrerPolicy = 'no-referrer';
    try {
      const host = new URL(item.url).hostname;
      img.src = item.icon || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`;
    } catch { img.hidden = true; }
    img.decode().catch(() => {});
    iconDiv.appendChild(img);

    const info = document.createElement('div');
    info.className = 'archive-item-info';
    const title = document.createElement('div');
    title.className = 'archive-item-title';
    title.textContent = item.title || item.url;
    const url = document.createElement('div');
    url.className = 'archive-item-url';
    try { url.textContent = new URL(item.url).hostname; } catch { url.textContent = item.url; }
    info.append(title, url);

    const date = document.createElement('div');
    date.className = 'archive-item-date';
    if (item.archivedAt) {
      date.textContent = new Date(item.archivedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    li.append(cb, iconDiv, info, date);
    els.archiveList.appendChild(li);
  }
}

function updateArchiveCount() {
  const checked = els.archiveList.querySelectorAll('.archive-item-check:checked').length;
  const total = els.archiveList.querySelectorAll('.archive-item-check').length;
  els.archiveCount.textContent = `${checked} selected`;
  els.archiveSelectAll.indeterminate = checked > 0 && checked < total;
  els.archiveSelectAll.checked = checked > 0 && checked === total;
}

function onArchiveSelectAll() {
  const checked = els.archiveSelectAll.checked;
  for (const cb of els.archiveList.querySelectorAll('.archive-item-check')) {
    cb.checked = checked;
  }
  updateArchiveCount();
}

async function onArchiveRestore() {
  const toRestore = getSelectedArchiveIds();
  if (!toRestore.length) { showToast('Select items to restore'); return; }

  const items = state.archived.filter((s) => toRestore.includes(s.id));
  // Strip archivedAt before restoring
  const restored = items.map(({ archivedAt: _, ...rest }) => rest);
  state.shortcuts = [...state.shortcuts, ...restored];
  state.archived = state.archived.filter((s) => !toRestore.includes(s.id));

  await persist();
  renderGrid();
  renderArchiveList();
  showToast(`${toRestore.length} link${toRestore.length !== 1 ? 's' : ''} restored`);
}

async function onArchiveDeletePermanent() {
  const toDelete = getSelectedArchiveIds();
  if (!toDelete.length) { showToast('Select items to delete'); return; }
  const ok = window.confirm(`Permanently delete ${toDelete.length} archived link${toDelete.length !== 1 ? 's' : ''}? This cannot be undone.`);
  if (!ok) return;

  state.archived = state.archived.filter((s) => !toDelete.includes(s.id));
  await persist();
  renderArchiveList();
  showToast(`${toDelete.length} link${toDelete.length !== 1 ? 's' : ''} permanently deleted`);
}

function getSelectedArchiveIds() {
  return [...els.archiveList.querySelectorAll('.archive-item-check:checked')]
    .map((cb) => cb.closest('.archive-item')?.dataset.id)
    .filter(Boolean);
}

function openSettingsModal() {
  const { settings } = state;
  const bgImage = settings.backgroundImage || '';

  els.settingBgColor.value = toColorInput(settings.backgroundColor || '#0f1221');
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
  syncColumnsLabel();

  for (const input of els.settingsForm.querySelectorAll('input[name="tile-size"]')) {
    input.checked = input.value === (settings.tileSize || 'medium');
  }

  if (!bgImage) {
    setBgMode('none');
  } else if (bgImage.startsWith('data:')) {
    setBgMode('upload');
    els.bgUploadStatus.hidden = false;
    els.bgUploadStatus.textContent = 'Using uploaded photo.';
    els.btnClearBg.hidden = false;
  } else {
    setBgMode('url');
  }

  updateBgPreview();
  els.settingsModal.showModal();
}

/**
 * Enable one background-source section and disable all others.
 * @param {'none' | 'url' | 'upload'} mode
 */
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
    showToast('Photo ready');
  } catch (error) {
    els.bgUploadStatus.hidden = false;
    els.bgUploadStatus.textContent = error.message || 'Upload failed';
    showToast(error.message || 'Upload failed');
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
  const color = els.settingBgColor.value || '#0f1221';

  els.bgPreview.style.backgroundColor = color;

  if (image) {
    els.bgPreviewWrap.hidden = false;
    // Escape quotes in data URLs for CSS url()
    const safe = image.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    els.bgPreview.style.backgroundImage = `url("${safe}")`;
  } else {
    els.bgPreview.style.backgroundImage = 'none';
    els.bgPreviewWrap.hidden = bgMode === 'none';
  }
}

function syncColumnsLabel() {
  const value = Number(els.settingColumns.value);
  els.settingColumnsValue.textContent = value === 0 ? 'Auto' : String(value);
}

async function onSaveSettings(event) {
  event.preventDefault();

  const tileSize =
    els.settingsForm.querySelector('input[name="tile-size"]:checked')?.value || 'medium';

  let backgroundImage = '';
  if (bgMode === 'url') {
    backgroundImage = els.settingBgImageUrl.value.trim();
  } else if (bgMode === 'upload') {
    backgroundImage = els.settingBgImage.value.trim();
  }

  state.settings = {
    ...state.settings,
    backgroundColor: els.settingBgColor.value,
    backgroundImage,
    tileSize,
    columns: Number(els.settingColumns.value) || 0,
    showLabels: els.settingShowLabels.checked,
    showDescription: els.settingShowDescription.checked,
    showBookmarks: els.settingShowBookmarks.checked,
    showNotes: els.settingShowNotes.checked,
    showRecent: els.settingShowRecent.checked,
  };

  applySettings(state.settings);
  applyPanelVisibility();
  if (els.settingShowBookmarks.checked) loadBookmarks();
  await persist();
  els.settingsModal.close();
  showToast('Dashboard updated');
}

async function onResetDefaults() {
  const ok = window.confirm('Reset shortcuts and settings to defaults?');
  if (!ok) return;

  state = await resetState();
  applySettings(state.settings);
  renderGrid();
  els.settingsModal.close();
  showToast('Defaults restored');
}

// ── Groups modal ────────────────────────────────────────────

let groupDragName = null;

function openGroupsModal() {
  renderGroupManager();
  const display = state.settings.groupDisplay || 'grid';
  for (const input of els.groupsModal.querySelectorAll('input[name="group-display"]')) {
    input.checked = input.value === display;
    input.onchange = onGroupDisplayChange;
  }
  els.btnAddGroup.onclick = onAddGroup;
  els.newGroupInput.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); onAddGroup(); } };
  els.newGroupInput.value = '';
  els.groupsModal.showModal();
}

async function onAddGroup() {
  const name = els.newGroupInput.value.trim();
  if (!name) { els.newGroupInput.focus(); return; }

  // Check for duplicate
  const existing = getSortedGroupNames(state.shortcuts).filter((g) => g !== '');
  const orderList = state.settings.groupOrder || [];
  if (existing.includes(name) || orderList.includes(name)) {
    showToast(`Group "${name}" already exists`);
    els.newGroupInput.select();
    return;
  }

  // Add to groupOrder so it appears in the manager immediately
  state.settings = {
    ...state.settings,
    groupOrder: [...orderList, name],
  };
  els.newGroupInput.value = '';
  await persist();
  renderGrid();
  renderGroupManager();
  showToast(`Group "${name}" added`);
}

function renderGroupManager() {
  const shortcuts = state.shortcuts;
  // Include groups from groupOrder that may have no links yet
  const orderList = state.settings.groupOrder || [];
  const fromShortcuts = getSortedGroupNames(shortcuts).filter((g) => g !== '');
  const allGroups = [...new Set([...orderList, ...fromShortcuts])];
  const groupNames = allGroups.filter((g) => g); // remove empty

  els.groupsEmptyHint.hidden = groupNames.length > 0;
  els.groupManagerList.innerHTML = '';

  // Count links per group
  const counts = {};
  for (const s of shortcuts) {
    const g = s.group || '';
    if (g) counts[g] = (counts[g] || 0) + 1;
  }

  for (const name of groupNames) {
    const li = document.createElement('li');
    li.className = 'group-manager-row';
    li.draggable = true;
    li.dataset.group = name;

    // Drag handle
    const handle = document.createElement('span');
    handle.className = 'group-drag-handle';
    handle.textContent = '⠿';
    handle.title = 'Drag to reorder';

    // Name input (inline rename)
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'group-name-input';
    nameInput.value = name;
    nameInput.setAttribute('aria-label', `Rename group ${name}`);
    nameInput.addEventListener('change', () => onRenameGroup(name, nameInput.value.trim()));

    // Count badge
    const badge = document.createElement('span');
    badge.className = 'group-count';
    badge.textContent = `${counts[name] || 0} link${(counts[name] || 0) !== 1 ? 's' : ''}`;

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'group-delete-btn';
    delBtn.title = 'Remove group (links become ungrouped)';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', () => onDeleteGroup(name));

    li.append(handle, nameInput, badge, delBtn);

    // Drag-to-reorder within manager list
    li.addEventListener('dragstart', (e) => {
      groupDragName = name;
      li.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    li.addEventListener('dragend', () => {
      groupDragName = null;
      li.classList.remove('is-dragging');
      for (const el of els.groupManagerList.querySelectorAll('.drag-over-row')) {
        el.classList.remove('drag-over-row');
      }
    });
    li.addEventListener('dragover', (e) => {
      if (!groupDragName || groupDragName === name) return;
      e.preventDefault();
      for (const el of els.groupManagerList.querySelectorAll('.drag-over-row')) {
        el.classList.remove('drag-over-row');
      }
      li.classList.add('drag-over-row');
    });
    li.addEventListener('drop', async (e) => {
      e.preventDefault();
      li.classList.remove('drag-over-row');
      if (!groupDragName || groupDragName === name) return;
      await onReorderGroup(groupDragName, name);
    });

    els.groupManagerList.appendChild(li);
  }

  // Close buttons
  els.groupsModalClose.onclick = () => els.groupsModal.close();
  els.btnGroupsClose.onclick = () => els.groupsModal.close();
}

async function onRenameGroup(oldName, newName) {
  if (!newName || newName === oldName) {
    renderGroupManager();
    return;
  }
  // Update all shortcuts with this group
  state.shortcuts = state.shortcuts.map((s) =>
    (s.group || '') === oldName ? { ...s, group: newName } : s
  );
  // Update groupOrder
  const order = state.settings.groupOrder || [];
  const idx = order.indexOf(oldName);
  if (idx >= 0) order[idx] = newName;
  state.settings = { ...state.settings, groupOrder: order };

  if (activeGroupTab === oldName) activeGroupTab = newName;

  await persist();
  renderGrid();
  renderGroupManager();
  showToast(`Renamed to "${newName}"`);
}

async function onDeleteGroup(name) {
  const count = state.shortcuts.filter((s) => (s.group || '') === name).length;
  const msg = count > 0
    ? `Remove group "${name}"? ${count} link${count !== 1 ? 's' : ''} will become ungrouped.`
    : `Remove group "${name}"?`;
  if (!window.confirm(msg)) return;

  // Ungroup all shortcuts in this group
  state.shortcuts = state.shortcuts.map((s) =>
    (s.group || '') === name ? { ...s, group: '' } : s
  );
  // Remove from groupOrder
  state.settings = {
    ...state.settings,
    groupOrder: (state.settings.groupOrder || []).filter((g) => g !== name),
  };
  if (activeGroupTab === name) activeGroupTab = '';

  await persist();
  renderGrid();
  renderGroupManager();
  showToast(`Group "${name}" removed`);
}

async function onReorderGroup(fromName, beforeName) {
  const order = getSortedGroupNames(state.shortcuts).filter((g) => g !== '');
  const withoutFrom = order.filter((g) => g !== fromName);
  const insertIdx = withoutFrom.indexOf(beforeName);
  if (insertIdx < 0) return;
  withoutFrom.splice(insertIdx, 0, fromName);

  state.settings = { ...state.settings, groupOrder: withoutFrom };
  await persist();
  renderGrid();
  renderGroupManager();
}

async function onGroupDisplayChange(event) {
  const display = event.target.value;
  state.settings = { ...state.settings, groupDisplay: display };
  els.app.dataset.groupDisplay = display;
  await persist();
  renderGrid();
}

// ── Group Filter modal ─────────────────────────────────────

/** Currently selected groups for filtering. Empty = show all. */
let filterGroups = [];

function openGroupFilterModal() {
  // Load current filter from settings
  filterGroups = [...(state.settings.filterGroups || [])];
  const allChecked = filterGroups.length === 0;

  // Set checkbox states
  els.groupFilterAll.checked = allChecked;
  els.groupFilterSocial.checked = allChecked || filterGroups.includes('Social');
  els.groupFilterDesign.checked = allChecked || filterGroups.includes('Design');
  els.groupFilterProductivity.checked = allChecked || filterGroups.includes('Productivity');
  els.groupFilterDevelopment.checked = allChecked || filterGroups.includes('Development');

  updateFilterSummary();
  els.groupFilterModal.showModal();
}

function updateFilterSummary() {
  const summary = document.getElementById('filter-summary');
  if (!summary) return;
  if (filterGroups.length === 0) {
    summary.textContent = 'Showing all groups.';
  } else {
    summary.textContent = `Filtering: ${filterGroups.join(', ')}`;
  }
}

function onGroupFilterCheck(event) {
  const val = event.target.value;
  const groups = ['Social', 'Design', 'Productivity', 'Development'];

  if (val === 'all') {
    if (event.target.checked) {
      // "All" checked → check every group too
      filterGroups = [];
      els.groupFilterSocial.checked = true;
      els.groupFilterDesign.checked = true;
      els.groupFilterProductivity.checked = true;
      els.groupFilterDevelopment.checked = true;
    }
  } else {
    // Unchecking a specific group: collect all OTHER checked groups
    if (!event.target.checked) {
      filterGroups = groups.filter((g) => {
        if (g === val) return false;
        const cb = els.groupFilterModal.querySelector(`input[value="${g}"]`);
        return cb && cb.checked;
      });
    } else {
      // Checking a specific group: add it and uncheck "All"
      els.groupFilterAll.checked = false;
      filterGroups = groups.filter((g) => {
        if (g === val) return true;
        const cb = els.groupFilterModal.querySelector(`input[value="${g}"]`);
        return cb && cb.checked;
      });
    }
    // If nothing is checked, default back to "All"
    if (filterGroups.length === 0) {
      els.groupFilterAll.checked = true;
    }
  }
  updateFilterSummary();
}

async function onGroupFilterApply() {
  state.settings = { ...state.settings, filterGroups: [...filterGroups] };
  await persist();
  renderGrid();
  els.groupFilterModal.close();
  showToast(filterGroups.length ? `Showing: ${filterGroups.join(', ')}` : 'Showing all groups');
}

function onGroupFilterClear() {
  filterGroups = [];
  els.groupFilterAll.checked = true;
  els.groupFilterSocial.checked = true;
  els.groupFilterDesign.checked = true;
  els.groupFilterProductivity.checked = true;
  els.groupFilterDevelopment.checked = true;
  updateFilterSummary();
}

// ────────────────────────────────────────────────────────────

async function onToggleLock() {
  locked = !locked;
  applyLock();
  state.settings = { ...state.settings, locked };
  try {
    await persist();
  } catch (error) {
    console.error('Failed to save lock state', error);
  }
  showToast(locked ? 'Dashboard locked' : 'Dashboard unlocked — you can now edit');
}

function onDragStart(event) {
  if (locked) return;
  const tile = event.target.closest('.tile');
  if (!tile) return;
  dragId = tile.dataset.id;
  tile.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', dragId);
}

function onDragOver(event) {
  if (locked) return;
  // Accept drop on a tile OR on a group heading (to move to that group)
  const target = event.target.closest('.tile, .group-heading');
  if (!target || (target.classList.contains('tile') && target.dataset.id === dragId)) return;
  event.preventDefault();

  for (const el of els.grid.querySelectorAll('.drag-over')) {
    el.classList.remove('drag-over');
  }
  target.classList.add('drag-over');
  event.dataTransfer.dropEffect = 'move';
}

async function onDrop(event) {
  if (locked) return;
  event.preventDefault();

  const target = event.target.closest('.tile, .group-heading');
  if (!target || !dragId) return;

  const fromItem = state.shortcuts.find((s) => s.id === dragId);
  if (!fromItem) return;

  let toGroup = fromItem.group || '';
  let insertBeforeId = null;

  if (target.classList.contains('group-heading')) {
    // Dropped onto a group heading → move to that group, place at end
    toGroup = target.dataset.group || '';
  } else {
    // Dropped onto a tile → inherit that tile's group, insert before it
    const toItem = state.shortcuts.find((s) => s.id === target.dataset.id);
    if (!toItem || toItem.id === dragId) return;
    toGroup = toItem.group || '';
    insertBeforeId = toItem.id;
  }

  // Build the new ordered sequence for the target group
  const groupItems = state.shortcuts
    .filter((s) => (s.group || '') === toGroup)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Remove the dragged item from this sequence (may not be present if cross-group move)
  const without = groupItems.filter((s) => s.id !== dragId);

  // Insert at the right position
  let insertIdx = without.length; // default: end
  if (insertBeforeId) {
    const idx = without.findIndex((s) => s.id === insertBeforeId);
    if (idx >= 0) insertIdx = idx;
  }
  without.splice(insertIdx, 0, fromItem);

  // Assign clean sequential order values 0, 1, 2…
  const newOrders = new Map(without.map((s, i) => [s.id, i]));

  state.shortcuts = state.shortcuts.map((s) => {
    if (s.id === dragId) {
      return { ...s, group: toGroup, order: newOrders.get(s.id) ?? s.order };
    }
    if (newOrders.has(s.id)) {
      return { ...s, order: newOrders.get(s.id) };
    }
    return s;
  });

  await persist();
  renderGrid();
}

function onDragEnd() {
  dragId = null;
  for (const el of els.grid.querySelectorAll('.dragging, .drag-over')) {
    el.classList.remove('dragging', 'drag-over');
  }
}

async function persist() {
  await saveState(state);

  // Confirm the write landed (catches quota / serialization issues early)
  const verify = await loadState();
  if (!Array.isArray(verify.shortcuts)) {
    throw new Error('Storage verification failed');
  }

  for (const item of state.shortcuts) {
    const saved = verify.shortcuts.find((entry) => entry.id === item.id);
    if (!saved) {
      throw new Error(`Storage missing shortcut ${item.id}`);
    }
    if (String(item.icon || '') !== String(saved.icon || '')) {
      throw new Error(`Icon was not persisted for ${item.title || item.id}`);
    }
  }
}

function showToast(message) {
  els.toast.hidden = false;
  els.toast.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.hidden = true;
  }, 2200);
}

function toColorInput(value) {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return '#4f6ef7';
}

function getOpenInField() {
  const selected = els.shortcutForm.querySelector('input[name="open-in"]:checked');
  return normalizeOpenIn(selected?.value);
}

function setOpenInField(openIn) {
  const value = normalizeOpenIn(openIn);
  for (const input of els.shortcutForm.querySelectorAll('input[name="open-in"]')) {
    input.checked = input.value === value;
  }
}

/**
 * @param {HTMLAnchorElement} link
 * @param {string} [openIn]
 */
function applyOpenIn(link, openIn) {
  if (normalizeOpenIn(openIn) === 'same-tab') {
    link.removeAttribute('target');
    link.removeAttribute('rel');
    return;
  }

  // Default: open in a new tab
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
}

init().catch((error) => {
  console.error(error);
  showToast('Failed to load dashboard');
});

// ── Quick Notes ───────────────────────────────────────────

let notesSaveTimer = null;

function initNotesWidget() {
  // Collapse toggle
  els.notesToggle.addEventListener('click', () => {
    const expanded = els.notesToggle.getAttribute('aria-expanded') === 'true';
    els.notesToggle.setAttribute('aria-expanded', String(!expanded));
    els.notesBody.hidden = expanded;
  });

  // Load saved note
  const saved = localStorage.getItem('linkDashboard_notes') || '';
  els.notesTextarea.value = saved;

  // Auto-save with debounce
  els.notesTextarea.addEventListener('input', () => {
    clearTimeout(notesSaveTimer);
    els.notesSavedHint.classList.remove('is-visible');
    notesSaveTimer = setTimeout(() => {
      localStorage.setItem('linkDashboard_notes', els.notesTextarea.value);
      els.notesSavedHint.textContent = 'Saved';
      els.notesSavedHint.classList.add('is-visible');
      setTimeout(() => els.notesSavedHint.classList.remove('is-visible'), 2000);
    }, 600);
  });
}

// ── Recently Visited ──────────────────────────────────────

/** Track a shortcut click for "recently visited" */
function onGridTileNavigate(event) {
  const link = event.target.closest('.tile-link');
  if (!link) return;
  const tile = link.closest('.tile');
  if (!tile) return;
  const item = state.shortcuts.find((s) => s.id === tile.dataset.id);
  if (!item) return;

  // Record visit in localStorage (keep last 20, deduplicated by id)
  const key = 'linkDashboard_recent';
  let recent = [];
  try { recent = JSON.parse(localStorage.getItem(key) || '[]'); } catch { recent = []; }
  recent = recent.filter((r) => r.id !== item.id);
  recent.unshift({ id: item.id, title: item.title, url: item.url, icon: item.icon, ts: Date.now() });
  recent = recent.slice(0, 20);
  localStorage.setItem(key, JSON.stringify(recent));
  renderRecentBar();
}

function initRecentBar() {
  // Collapse toggle
  els.recentToggle.addEventListener('click', () => {
    const expanded = els.recentToggle.getAttribute('aria-expanded') === 'true';
    els.recentToggle.setAttribute('aria-expanded', String(!expanded));
    els.recentBody.hidden = expanded;
  });

  els.recentClearBtn.addEventListener('click', () => {
    localStorage.removeItem('linkDashboard_recent');
    renderRecentBar();
  });
  renderRecentBar();
}

function renderRecentBar() {
  if (!state.settings.showRecent) {
    els.recentBar.hidden = true;
    return;
  }

  const key = 'linkDashboard_recent';
  let recent = [];
  try { recent = JSON.parse(localStorage.getItem(key) || '[]'); } catch { recent = []; }

  // Only show items that still exist as shortcuts
  const ids = new Set(state.shortcuts.map((s) => s.id));
  recent = recent.filter((r) => ids.has(r.id));

  const count = state.settings.recentCount || 8;
  recent = recent.slice(0, count);

  els.recentBar.hidden = recent.length === 0 || !state.settings.showRecent;
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

// ── Link Store modal ──────────────────────────────────────

let storeActiveCategory = 'All';
let storeSelectedIds = new Set();

const STORE_CATEGORIES = ['All', 'Social', 'Design', 'Productivity', 'Development', 'News', 'Entertainment'];

function openStoreModal() {
  storeSelectedIds.clear();
  storeActiveCategory = 'All';
  els.storeSearch.value = '';
  renderStoreTabs();
  renderStoreGrid('All');
  updateStoreCount();
  els.storeModal.showModal();
}

function renderStoreTabs() {
  els.storeCategoryTabs.innerHTML = '';
  for (const cat of STORE_CATEGORIES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'store-cat-tab' + (cat === storeActiveCategory ? ' is-active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      storeActiveCategory = cat;
      renderStoreTabs();
      renderStoreGrid(cat);
    });
    els.storeCategoryTabs.appendChild(btn);
  }
}

function renderStoreGrid(category) {
  const q = els.storeSearch.value.trim().toLowerCase();
  const existingUrls = new Set(state.shortcuts.map((s) => s.url));

  let items = STORE_CATALOG;
  if (category && category !== 'All') {
    items = items.filter((i) => i.group === category);
  }
  if (q) {
    items = items.filter((i) =>
      (i.title || '').toLowerCase().includes(q) ||
      (i.url || '').toLowerCase().includes(q) ||
      (i.description || '').toLowerCase().includes(q) ||
      (i.group || '').toLowerCase().includes(q)
    );
  }

  els.storeGrid.innerHTML = '';
  els.storeEmpty.hidden = items.length > 0;

  for (const item of items) {
    const card = document.createElement('div');
    card.className = 'store-card';

    const alreadyAdded = existingUrls.has(item.url);
    const checked = storeSelectedIds.has(item.url);

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'store-card-check';
    cb.checked = checked;
    cb.disabled = alreadyAdded;
    cb.addEventListener('change', () => {
      if (cb.checked) {
        storeSelectedIds.add(item.url);
      } else {
        storeSelectedIds.delete(item.url);
      }
      updateStoreCount();
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

function updateStoreCount() {
  const n = storeSelectedIds.size;
  els.storeSelectedCount.textContent = `${n} selected`;
  els.btnStoreAdd.disabled = n === 0;
}

async function onStoreAddSelected() {
  if (storeSelectedIds.size === 0) return;

  const toAdd = STORE_CATALOG.filter((i) => storeSelectedIds.has(i.url));
  let added = 0;

  for (const item of toAdd) {
    const exists = state.shortcuts.some((s) => s.url === item.url);
    if (exists) continue;

    state.shortcuts = [...state.shortcuts, createShortcut({
      title: item.title,
      url: item.url,
      icon: item.icon || '',
      color: item.color || '#4f6ef7',
      group: item.group || '',
      description: item.description || '',
    })];
    added++;
  }

  if (added > 0) {
    await persist();
    renderGrid();
  }

  els.storeModal.close();
  showToast(`Added ${added} link${added !== 1 ? 's' : ''}`);
}

// ── Import / Export ───────────────────────────────────────

function onExportShortcuts() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    shortcuts: state.shortcuts,
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `link-dashboard-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Shortcuts exported');
}

async function onImportShortcuts(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  // Reset input so the same file can be re-selected later
  els.btnImportFile.value = '';

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Accept both { shortcuts: [...] } and a raw array
    const incoming = Array.isArray(data) ? data : data.shortcuts;
    if (!Array.isArray(incoming) || incoming.length === 0) {
      throw new Error('No shortcuts found in file.');
    }

    // Validate each entry has at minimum a url
    const valid = incoming.filter((s) => s && typeof s.url === 'string' && s.url.trim());
    if (!valid.length) throw new Error('No valid shortcuts found.');

    const ok = window.confirm(
      `Import ${valid.length} shortcut${valid.length !== 1 ? 's' : ''}?\n\nChoose OK to merge with existing shortcuts, or cancel to abort.`
    );
    if (!ok) return;

    // Merge: skip duplicates by URL, assign new ids to avoid collisions
    const existingUrls = new Set(state.shortcuts.map((s) => s.url));
    let added = 0;
    for (const s of valid) {
      if (existingUrls.has(s.url)) continue;
      state.shortcuts = [
        ...state.shortcuts,
        {
          id: `sc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}_imp`,
          title: String(s.title || '').trim() || s.url,
          url: s.url,
          icon: s.icon || '',
          color: s.color || '#4f6ef7',
          openIn: s.openIn || 'new-tab',
          description: s.description || '',
          group: s.group || '',
          order: s.order ?? 0,
        },
      ];
      existingUrls.add(s.url);
      added++;
    }

    if (added === 0) {
      showToast('All shortcuts already exist — nothing imported');
      return;
    }

    await persist();
    renderGrid();
    showToast(`Imported ${added} shortcut${added !== 1 ? 's' : ''}`);
  } catch (err) {
    console.error('Import failed', err);
    showToast(`Import failed: ${err.message}`);
  }
}

// ── Bookmarks Widget ─────────────────────────────────────

/** Whether bookmarks API is available */
function hasBookmarksApi() {
  return typeof chrome !== 'undefined' && typeof chrome.bookmarks !== 'undefined';
}

/** Apply right-panel visibility (delegates to applyPanelVisibility) */
function applyBookmarksVisibility() {
  applyPanelVisibility();
}

/** Wire up toggle-collapse and search, then load tree */
function initBookmarksWidget() {
  applyBookmarksVisibility();

  // Collapse/expand the body
  els.bookmarksToggle.addEventListener('click', () => {
    const expanded = els.bookmarksToggle.getAttribute('aria-expanded') === 'true';
    els.bookmarksToggle.setAttribute('aria-expanded', String(!expanded));
    els.bookmarksBody.hidden = expanded;
  });

  // Live search
  let bmSearchTimer = null;
  els.bookmarksSearch.addEventListener('input', () => {
    clearTimeout(bmSearchTimer);
    bmSearchTimer = setTimeout(() => renderBookmarksSearch(els.bookmarksSearch.value.trim()), 200);
  });

  if (state.settings.showBookmarks) loadBookmarks();
}

/** Load and render bookmark tree */
async function loadBookmarks() {
  els.bookmarksTree.innerHTML = '';

  if (!hasBookmarksApi()) {
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
    // tree[0] is the root — render its children (Bookmarks Bar, Other, Mobile)
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

/**
 * Build a folder DOM node (recursive).
 * @param {chrome.bookmarks.BookmarkTreeNode} node
 * @param {boolean} [startOpen]
 */
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

  // Count direct bookmark children
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
    if (child.url) {
      children.appendChild(buildLinkNode(child));
    } else if (child.children !== undefined) {
      children.appendChild(buildFolderNode(child, false));
    }
  }

  // Toggle open/close
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

/**
 * Build a bookmark link DOM node.
 * @param {chrome.bookmarks.BookmarkTreeNode} node
 */
function buildLinkNode(node) {
  const a = document.createElement('a');
  a.className = 'bm-link';
  a.href = node.url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.setAttribute('role', 'treeitem');
  a.title = `${node.title}\n${node.url}`;

  const img = document.createElement('img');
  img.className = 'bm-link-icon';
  img.alt = '';
  img.referrerPolicy = 'no-referrer';
  try {
    const host = new URL(node.url).hostname;
    img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`;
  } catch {
    img.hidden = true;
  }

  const title = document.createElement('span');
  title.className = 'bm-link-title';
  title.textContent = node.title || node.url;

  const url = document.createElement('span');
  url.className = 'bm-link-url';
  try { url.textContent = new URL(node.url).hostname; } catch { url.textContent = ''; }

  a.append(img, title, url);
  return a;
}

/** Flat search across all bookmarks */
async function renderBookmarksSearch(query) {
  els.bookmarksTree.innerHTML = '';

  if (!query) {
    await loadBookmarks();
    return;
  }

  if (!hasBookmarksApi()) return;

  try {
    const results = await chrome.bookmarks.search(query);
    if (!results.length) {
      els.bookmarksTree.innerHTML = `<div class="bm-notice">No bookmarks match "<strong>${escHtml(query)}</strong>"</div>`;
      return;
    }
    const list = document.createElement('div');
    list.className = 'bm-search-results';
    for (const node of results) {
      if (node.url) list.appendChild(buildLinkNode(node));
    }
    els.bookmarksTree.appendChild(list);
  } catch (err) {
    console.error(err);
  }
}
