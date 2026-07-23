/**
 * StateService — the single source of truth for persisted dashboard state
 * (shortcuts, archived, settings). Owns persistence + change notification.
 *
 * High-level UI modules depend on this service (an abstraction) rather than
 * reaching directly into chrome.storage / localStorage (Dependency Inversion).
 */
import { loadState, saveState, resetState } from '../../lib/storage.js';
import { ensureDurableIcon } from '../../lib/icons.js';

export class StateService {
  constructor() {
    /** @type {{ shortcuts: Array, archived: Array, settings: object }} */
    this.state = { shortcuts: [], archived: [], settings: {} };
  }

  // ── Lifecycle ────────────────────────────────────────────

  async load() {
    let loaded = await loadState();
    loaded = await this._hydrateDurableIcons(loaded);
    if (!loaded.archived) loaded.archived = [];
    if (!loaded.settings.theme) loaded.settings.theme = 'auto';
    this.state = loaded;
    return this.state;
  }

  async reset() {
    this.state = await resetState();
    return this.state;
  }

  // ── Reads ────────────────────────────────────────────────

  getState() { return this.state; }
  getShortcuts() { return this.state.shortcuts; }
  getArchived() { return this.state.archived || []; }
  getSettings() { return this.state.settings; }

  // ── Writes (return new state; caller is responsible for notify/persist) ──

  setShortcuts(next) {
    this.state = { ...this.state, shortcuts: next };
  }
  setArchived(next) {
    this.state = { ...this.state, archived: next };
  }
  patchSettings(patch) {
    this.state = { ...this.state, settings: { ...this.state.settings, ...patch } };
  }

  // ── Persistence ──────────────────────────────────────────

  async persist() {
    await saveState(this.state);

    // Confirm the write landed (catches quota / serialization issues early)
    const verify = await loadState();
    if (!Array.isArray(verify.shortcuts)) {
      throw new Error('Storage verification failed');
    }
    for (const item of this.state.shortcuts) {
      const saved = verify.shortcuts.find((entry) => entry.id === item.id);
      if (!saved) throw new Error(`Storage missing shortcut ${item.id}`);
      if (String(item.icon || '') !== String(saved.icon || '')) {
        throw new Error(`Icon was not persisted for ${item.title || item.id}`);
      }
    }
  }

  // ── Legacy icon hydration ────────────────────────────────

  async _hydrateDurableIcons(current) {
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
}