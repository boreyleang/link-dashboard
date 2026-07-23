/**
 * Shared DOM utilities and element refs. Pure-ish helpers that several
 * UI modules need (HTML escaping, tab/panel switching, color/open-in fields).
 * Keeping them here avoids duplication across feature modules (DRY).
 */
import { normalizeOpenIn } from '../../lib/shortcuts.js';

/** Escape a string for safe insertion into HTML text. */
export function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Wrap occurrences of `query` in `text` with a highlight span.
 * Safely escapes HTML so data can't inject markup.
 */
export function highlight(text, query) {
  if (!query || !text) return escHtml(text || '');
  const escaped = escHtml(text);
  const escapedQ = escHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped.replace(
    new RegExp(escapedQ, 'gi'),
    (m) => `<mark class="search-highlight">${m}</mark>`,
  );
}

/** Coerce a value into a valid #rrggbb hex string, falling back to `fallback`. */
export function toColorInput(value, fallback = '#4f6ef7') {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

/**
 * Toggle a tab/panel pair so only the chosen mode is active.
 * Shared by icon-source and background-source pickers.
 */
export function setActiveTab(tabSelector, panelSelector, dataKey, mode) {
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
    if (active) panel.removeAttribute('inert');
    else panel.setAttribute('inert', '');
  }
}

/** Read the selected open-in radio value from a form container. */
export function getOpenInField(form) {
  const selected = form.querySelector('input[name="open-in"]:checked');
  return normalizeOpenIn(selected?.value);
}

/** Set the open-in radio value in a form container. */
export function setOpenInField(form, openIn) {
  const value = normalizeOpenIn(openIn);
  for (const input of form.querySelectorAll('input[name="open-in"]')) {
    input.checked = input.value === value;
  }
}

/** Apply open-in behaviour to an anchor element. */
export function applyOpenIn(link, openIn) {
  if (normalizeOpenIn(openIn) === 'same-tab') {
    link.removeAttribute('target');
    link.removeAttribute('rel');
    return;
  }
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
}