/**
 * Pure helpers for shortcut list operations.
 */

import { createId } from './storage.js';
import { faviconFromUrl, normalizeUrl, hostnameLabel } from './url.js';

/** @typedef {'new-tab' | 'same-tab'} OpenIn */

export function normalizeOpenIn(value) {
  return value === 'same-tab' ? 'same-tab' : 'new-tab';
}

export function createShortcut({ title, url, icon, iconColor, color, openIn, description, showDescription, group, order, favorite }) {
  const normalized = normalizeUrl(url);
  return {
    id: createId(),
    title: String(title || '').trim() || hostnameLabel(normalized),
    url: normalized,
    icon: String(icon || '').trim() || faviconFromUrl(normalized),
    iconColor: String(iconColor || '').trim(),
    color: String(color || '#4f6ef7').trim() || '#4f6ef7',
    openIn: normalizeOpenIn(openIn),
    description: String(description || '').trim(),
    showDescription: showDescription !== false,
    group: String(group || '').trim(),
    order: Number.isFinite(Number(order)) ? Number(order) : 0,
    favorite: Boolean(favorite),
  };
}

export function updateShortcut(list, id, patch) {
  return list.map((item) => {
    if (item.id !== id) return item;

    const next = { ...item, ...patch };
    if (patch.url !== undefined) {
      next.url = normalizeUrl(patch.url);
      if (!String(patch.icon || item.icon || '').trim()) {
        next.icon = faviconFromUrl(next.url);
      }
    }
    if (patch.icon !== undefined) {
      next.icon = String(patch.icon || '').trim() || faviconFromUrl(next.url);
    }
    if (patch.iconColor !== undefined) {
      next.iconColor = String(patch.iconColor || '').trim();
    }
    if (patch.title !== undefined) {
      next.title = String(patch.title || '').trim() || hostnameLabel(next.url);
    }
    if (patch.color !== undefined) {
      next.color = String(patch.color || '#4f6ef7').trim() || '#4f6ef7';
    }
    if (patch.openIn !== undefined) {
      next.openIn = normalizeOpenIn(patch.openIn);
    }
    if (patch.description !== undefined) {
      next.description = String(patch.description || '').trim();
    }
    if (patch.showDescription !== undefined) {
      next.showDescription = Boolean(patch.showDescription);
    }
    if (patch.group !== undefined) {
      next.group = String(patch.group || '').trim();
    }
    if (patch.order !== undefined) {
      next.order = Number.isFinite(Number(patch.order)) ? Number(patch.order) : 0;
    }
    if (patch.favorite !== undefined) {
      next.favorite = Boolean(patch.favorite);
    }
    return next;
  });
}

export function toggleFavorite(list, id) {
  return list.map((item) =>
    item.id === id ? { ...item, favorite: !item.favorite } : item
  );
}

export function setFavorite(list, id, value) {
  return list.map((item) =>
    item.id === id ? { ...item, favorite: Boolean(value) } : item
  );
}

export function getFavorites(list) {
  return list.filter((item) => item.favorite === true);
}

export function removeShortcut(list, id) {
  return list.filter((item) => item.id !== id);
}

export function reorderShortcuts(list, fromId, toId) {
  if (fromId === toId) return list;

  const fromIndex = list.findIndex((item) => item.id === fromId);
  const toIndex = list.findIndex((item) => item.id === toId);
  if (fromIndex < 0 || toIndex < 0) return list;

  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

// ── Per-group metadata (accent color + optional emoji/icon) ───────────────

const GROUP_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const MAX_GROUP_ICON_LEN = 4;

/** Sanitize a user-entered hex color; returns '' when invalid. */
function sanitizeGroupColor(value) {
  const v = String(value || '').trim();
  return GROUP_COLOR_RE.test(v) ? v.toLowerCase() : '';
}

/** Sanitize a group emoji/icon (a few characters); returns '' when empty. */
function sanitizeGroupIcon(value) {
  const v = String(value || '').trim();
  return v.slice(0, MAX_GROUP_ICON_LEN);
}

/** Read a group's metadata object from settings (always returns an object). */
export function getGroupMeta(settings, name) {
  const meta = (settings && settings.groupMeta) || {};
  return meta[name] ? { ...meta[name] } : {};
}

/**
 * Return a new settings object with the given patch applied to a group's
 * metadata. Empty/invalid values are dropped, and empty entries are removed
 * entirely to keep storage lean.
 */
export function setGroupMeta(settings, name, patch) {
  const meta = { ...((settings && settings.groupMeta) || {}) };
  const prev = meta[name] ? { ...meta[name] } : {};
  const next = { ...prev };

  if (patch && Object.prototype.hasOwnProperty.call(patch, 'color')) {
    const c = sanitizeGroupColor(patch.color);
    if (c) next.color = c;
    else delete next.color;
  }
  if (patch && Object.prototype.hasOwnProperty.call(patch, 'icon')) {
    const ic = sanitizeGroupIcon(patch.icon);
    if (ic) next.icon = ic;
    else delete next.icon;
  }

  if (!next.color && !next.icon) delete meta[name];
  else meta[name] = next;

  return { ...settings, groupMeta: meta };
}

/** Move a group's metadata when the group is renamed. No-op if absent. */
export function renameGroupMeta(settings, oldName, newName) {
  const meta = { ...((settings && settings.groupMeta) || {}) };
  if (meta[oldName]) {
    meta[newName] = meta[oldName];
    delete meta[oldName];
    return { ...settings, groupMeta: meta };
  }
  return settings;
}

/** Remove a group's metadata (e.g. when the group is deleted). */
export function deleteGroupMeta(settings, name) {
  const meta = { ...((settings && settings.groupMeta) || {}) };
  if (!(name in meta)) return settings;
  delete meta[name];
  return { ...settings, groupMeta: meta };
}
