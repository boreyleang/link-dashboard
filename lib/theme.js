/**
 * Theme + background color helpers (pure).
 * Background picks drive text contrast so labels stay readable.
 */

/** Default backgrounds used by the theme system. */
export const BG_DARK = '#0f1221';
export const BG_LIGHT = '#f3f5fb';

/**
 * Popular recommended background colors (Customize swatches).
 * Grouped dark → light so users can pick a known-good palette quickly.
 */
export const BG_PRESETS = [
  // Popular dark
  { label: 'Dark navy', value: BG_DARK, group: 'dark' },
  { label: 'Black', value: '#000000', group: 'dark' },
  { label: 'Charcoal', value: '#1f2937', group: 'dark' },
  { label: 'Slate', value: '#1e293b', group: 'dark' },
  { label: 'Deep blue', value: '#0b1d36', group: 'dark' },
  { label: 'Forest', value: '#0f2419', group: 'dark' },
  { label: 'Plum', value: '#1a1228', group: 'dark' },
  { label: 'Espresso', value: '#1c1410', group: 'dark' },
  // Popular light
  { label: 'Soft light', value: BG_LIGHT, group: 'light' },
  { label: 'White', value: '#ffffff', group: 'light' },
  { label: 'Cloud gray', value: '#f3f4f6', group: 'light' },
  { label: 'Warm paper', value: '#faf7f2', group: 'light' },
  { label: 'Cool mist', value: '#e8eef8', group: 'light' },
  { label: 'Sky', value: '#e0f2fe', group: 'light' },
  { label: 'Mint', value: '#ecfdf5', group: 'light' },
  { label: 'Lavender', value: '#f5f3ff', group: 'light' },
];

/** Normalize a color string to lowercase #rrggbb, or null if invalid. */
export function normalizeHex(color) {
  if (typeof color !== 'string') return null;
  const value = color.trim();
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value.toLowerCase() : null;
}

/** Parse #rrggbb into 0–255 channels. */
export function parseHex(color) {
  const hex = normalizeHex(color);
  if (!hex) return null;
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function srgbChannel(value) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/**
 * Relative luminance (WCAG), 0 = black, 1 = white.
 * Used to decide light vs dark text on a given background.
 */
export function relativeLuminance(color) {
  const rgb = parseHex(color);
  if (!rgb) return 0;
  return (
    0.2126 * srgbChannel(rgb.r) +
    0.7152 * srgbChannel(rgb.g) +
    0.0722 * srgbChannel(rgb.b)
  );
}

/** True when background is light enough that dark text is clearer. */
export function isLightBackground(color, threshold = 0.45) {
  return relativeLuminance(color) > threshold;
}

/**
 * Opposite-contrast UI palette for a background color.
 * Light backgrounds get dark text; dark backgrounds get light text.
 */
export function contrastPaletteForBackground(color) {
  const bg = normalizeHex(color) || BG_DARK;
  const light = isLightBackground(bg);

  if (light) {
    return {
      bg,
      isLight: true,
      theme: 'light',
      text: '#1a1d2e',
      textMuted: 'rgba(26, 29, 46, 0.75)',
      bgElevated: 'rgba(20, 24, 48, 0.06)',
      bgElevatedHover: 'rgba(20, 24, 48, 0.1)',
      border: 'rgba(20, 24, 48, 0.15)',
      shadow: '0 18px 50px rgba(20, 24, 48, 0.18)',
      colorScheme: 'light',
    };
  }

  return {
    bg,
    isLight: false,
    theme: 'dark',
    text: '#f4f6ff',
    textMuted: 'rgba(244, 246, 255, 0.75)',
    bgElevated: 'rgba(255, 255, 255, 0.06)',
    bgElevatedHover: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: '0 18px 50px rgba(0, 0, 0, 0.35)',
    colorScheme: 'dark',
  };
}

/** Resolve stored theme preference to 'light' | 'dark'. */
export function resolveTheme(theme, prefersLight = false) {
  if (theme === 'light' || theme === 'dark') return theme;
  return prefersLight ? 'light' : 'dark';
}

/** Theme-matching default background. */
export function themeDefaultBackground(theme) {
  return theme === 'light' ? BG_LIGHT : BG_DARK;
}

/**
 * When the user is still on a stock theme background, swap it to match the
 * new theme so light text/dark text stay readable. Custom colors are kept.
 */
export function maybeSyncBackgroundForTheme(currentBg, theme) {
  const normalized = normalizeHex(currentBg);
  const nextDefault = themeDefaultBackground(theme);
  if (!normalized) return nextDefault;

  const stock = new Set(BG_PRESETS.map((p) => p.value.toLowerCase()));
  // Also treat the historical defaults as stock even if presets change.
  stock.add(BG_DARK.toLowerCase());
  stock.add(BG_LIGHT.toLowerCase());

  return stock.has(normalized) ? nextDefault : currentBg;
}
