/**
 * Pure URL helpers for shortcuts. No DOM, no storage — fully unit-testable.
 */

/** Ensure a user-entered URL has an http(s) scheme. */
export function normalizeUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Build a Google favicon service URL for the host of the given URL. */
export function faviconFromUrl(url) {
  try {
    const host = new URL(normalizeUrl(url)).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  } catch {
    return '';
  }
}

/** Derive a human label from a URL's hostname (strips leading www.). */
export function hostnameLabel(url) {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, '');
  } catch {
    return 'Link';
  }
}