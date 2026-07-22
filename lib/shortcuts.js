/**
 * Pure helpers for shortcut list operations.
 */

import { createId, faviconFromUrl, normalizeUrl } from './storage.js';

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

function hostnameLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Link';
  }
}
