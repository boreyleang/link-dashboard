/**
 * Composition root. Builds element refs, the StateService, and wires every
 * UI feature module. No feature logic lives here — each module owns a single
 * responsibility and receives its dependencies via `ctx` (Dependency Inversion).
 *
 * Architecture:
 *   lib/            pure domain logic (unit-tested)
 *   newtab/core/    state service + shared DOM helpers
 *   newtab/ui/      feature modules (one responsibility each)
 *   newtab/app.js   composition root (this file)
 */
import { StateService } from './core/state.js';
import { createToastModel } from './ui/toast.js';
import { createClockModel } from './ui/clock.js';
import { createThemeModel } from './ui/theme.js';
import { createLockModel } from './ui/lock.js';
import { createSelectionModel } from './ui/selection.js';
import { createFiltersModel } from './ui/filters.js';
import { createGridModel } from './ui/grid/grid.js';
import { createShortcutFormModel } from './ui/shortcut-form.js';
import { createBulkModel } from './ui/bulk.js';
import { createArchiveModel } from './ui/archive.js';
import { createSettingsModel } from './ui/settings.js';
import { createGroupsModel } from './ui/groups.js';
import { createGroupFilterModel } from './ui/group-filter.js';
import { createDragDropModel } from './ui/drag-drop.js';
import { createPaletteModel } from './ui/command-palette.js';
import { createRecentModel } from './ui/recent.js';
import { createNotesModel } from './ui/notes.js';
import { createStoreModel } from './ui/store.js';
import { createImportExportModel } from './ui/import-export.js';
import { createBackupModel } from './ui/backup.js';
import { createBookmarksModel } from './ui/bookmarks.js';
import { createKeyboardModel } from './ui/keyboard.js';

const els = {
  app: document.getElementById('app'),
  clock: document.getElementById('clock'),
  grid: document.getElementById('shortcut-grid'),
  empty: document.getElementById('empty-state'),
  toast: document.getElementById('toast'),
  searchInput: document.getElementById('search-input'),
  searchClear: document.getElementById('search-clear'),
  searchPaletteHint: document.getElementById('search-palette-hint'),
  rightPanel: document.getElementById('right-panel'),
  bookmarksWidget: document.getElementById('bookmarks-widget'),
  bookmarksToggle: document.getElementById('bookmarks-toggle'),
  bookmarksBody: document.getElementById('bookmarks-body'),
  bookmarksTree: document.getElementById('bookmarks-tree'),
  bookmarksSearch: document.getElementById('bookmarks-search'),
  devBadge: document.getElementById('dev-badge'),
  btnTheme: document.getElementById('btn-theme'),
  themeIcon: document.getElementById('theme-icon'),
  commandPalette: document.getElementById('command-palette'),
  paletteInput: document.getElementById('palette-input'),
  paletteList: document.getElementById('palette-list'),
  paletteEmpty: document.getElementById('palette-empty'),
  btnLock: document.getElementById('btn-lock'),
  lockIcon: document.getElementById('lock-icon'),
  lockLabel: document.getElementById('lock-label'),
  btnAdd: document.getElementById('btn-add'),
  btnArchiveView: document.getElementById('btn-archive-view'),
  btnSettings: document.getElementById('btn-settings'),
  btnImportExport: document.getElementById('btn-import-export'),
  btnBackup: document.getElementById('btn-backup'),
  importExportModal: document.getElementById('import-export-modal'),
  importExportModalClose: document.getElementById('import-export-modal-close'),
  btnImportExportClose: document.getElementById('btn-import-export-close'),
  btnExportStandalone: document.getElementById('btn-export-standalone'),
  btnImportFileStandalone: document.getElementById('btn-import-file-standalone'),
  backupModal: document.getElementById('backup-modal'),
  backupModalClose: document.getElementById('backup-modal-close'),
  btnBackupClose: document.getElementById('btn-backup-close'),
  settingAutoBackupStandalone: document.getElementById('setting-auto-backup-standalone'),
  settingBackupIntervalStandalone: document.getElementById('setting-backup-interval-standalone'),
  settingMaxBackupsStandalone: document.getElementById('setting-max-backups-standalone'),
  btnCreateBackupStandalone: document.getElementById('btn-create-backup-standalone'),
  btnImportBackupStandalone: document.getElementById('btn-import-backup-standalone'),
  btnExportAllBackupsStandalone: document.getElementById('btn-export-all-backups-standalone'),
  backupListStandalone: document.getElementById('backup-list-standalone'),
  backupEmptyStandalone: document.getElementById('backup-empty-standalone'),
  backupCountStandalone: document.getElementById('backup-count-standalone'),
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
  fieldIconColor: document.getElementById('field-icon-color'),
  fieldColor: document.getElementById('field-color'),
  fieldDescription: document.getElementById('field-description'),
  fieldGroup: document.getElementById('field-group'),
  fieldOrder: document.getElementById('field-order'),
  fieldFavorite: document.getElementById('field-favorite'),
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
  bgPresets: document.getElementById('bg-presets'),
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
  settingRecentCount: document.getElementById('setting-recent-count'),
  settingShowFavorites: document.getElementById('setting-show-favorites'),
  btnReset: document.getElementById('btn-reset'),
  btnResetTheme: document.getElementById('btn-reset-theme'),
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
  btnSettingsCancel: document.getElementById('btn-settings-cancel'),
  bulkToolbar: document.getElementById('bulk-toolbar'),
  bulkSelectAll: document.getElementById('bulk-select-all'),
  bulkCount: document.getElementById('bulk-count'),
  bulkMoveGroup: document.getElementById('bulk-move-group'),
  bulkFavoriteBtn: document.getElementById('bulk-favorite-btn'),
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
  btnFavoritesFilter: document.getElementById('btn-favorites-filter'),
  btnStore: document.getElementById('btn-store'),
  groupsModal: document.getElementById('groups-modal'),
  groupsModalClose: document.getElementById('groups-modal-close'),
  btnGroupsClose: document.getElementById('btn-groups-close'),
  groupFilterModal: document.getElementById('group-filter-modal'),
  groupFilterModalClose: document.getElementById('group-filter-modal-close'),
  groupFilterList: document.getElementById('filter-group-list'),
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

function isExtensionContext() {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);
}

// Shared service locator assembled before any module is constructed.
const ctx = {
  els,
  state: null,
  toast: null,
};

async function init() {
  if (els.devBadge) {
    els.devBadge.hidden = isExtensionContext();
  }

  const state = new StateService();
  await state.load();
  ctx.state = state;

  // Leaf / shared services (no sibling dependencies)
  ctx.toast = createToastModel(ctx);
  ctx.selection = createSelectionModel();
  ctx.clock = createClockModel(ctx);
  ctx.theme = createThemeModel(ctx);
  ctx.lock = createLockModel(ctx);
  ctx.lock.initFromSettings(state.getSettings());

  // View filters (uses ctx.grid lazily — created below)
  ctx.filters = createFiltersModel(ctx);

  // Grid (depends on filters, selection, lock — all created above)
  ctx.grid = createGridModel(ctx);

  // Feature modules (depend on grid; access siblings via ctx)
  ctx.shortcutForm = createShortcutFormModel(ctx);
  ctx.bulk = createBulkModel(ctx);
  ctx.archive = createArchiveModel(ctx);
  ctx.bookmarks = createBookmarksModel(ctx);
  ctx.settings = createSettingsModel(ctx);
  ctx.groups = createGroupsModel(ctx);
  ctx.groupFilter = createGroupFilterModel(ctx);
  ctx.dragDrop = createDragDropModel(ctx);
  ctx.recent = createRecentModel(ctx);
  ctx.notes = createNotesModel(ctx);
  ctx.store = createStoreModel(ctx);
  ctx.importExport = createImportExportModel(ctx);
  ctx.backup = createBackupModel(ctx);
  ctx.palette = createPaletteModel(ctx);
  ctx.keyboard = createKeyboardModel(ctx);

  // Wire navigation: grid clicks + palette opens record a recent visit.
  ctx.onNavigate = (item) => ctx.recent.recordVisit(item);
  els.grid.addEventListener('click', (event) => ctx.grid.onNavigate(event));

  // Apply persisted state to the UI (sync stock bg with theme so light text
  // never sits on the dark default background after a theme switch).
  const themeApply = ctx.theme.applyWithBackground(state.getSettings().theme);
  if (themeApply.changed) await state.persist();
  ctx.lock.apply();
  ctx.settings.applyPanelVisibility();

  // Wire all module events (order is not significant)
  ctx.theme.init();
  ctx.lock.init();
  ctx.filters.init();
  ctx.shortcutForm.init();
  ctx.bulk.init();
  ctx.archive.init();
  ctx.bookmarks.init();
  ctx.settings.init();
  ctx.groups.init();
  ctx.groupFilter.init();
  ctx.dragDrop.init();
  ctx.recent.init();
  ctx.notes.init();
  ctx.store.init();
  ctx.importExport.init();
  ctx.backup.init();
  ctx.palette.init();
  ctx.keyboard.init();

  // First paint + clock
  ctx.grid.render();
  ctx.clock.start();
}

init().catch((error) => {
  console.error(error);
  ctx.toast?.show('Failed to load dashboard');
});