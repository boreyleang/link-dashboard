import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BG_DARK,
  BG_LIGHT,
  BG_PRESETS,
  normalizeHex,
  parseHex,
  relativeLuminance,
  isLightBackground,
  contrastPaletteForBackground,
  resolveTheme,
  themeDefaultBackground,
  maybeSyncBackgroundForTheme,
} from '../lib/theme.js';

describe('normalizeHex', () => {
  it('accepts #rrggbb and lowercases', () => {
    assert.equal(normalizeHex('#0F1221'), '#0f1221');
  });

  it('rejects invalid values', () => {
    assert.equal(normalizeHex('blue'), null);
    assert.equal(normalizeHex('#fff'), null);
    assert.equal(normalizeHex(null), null);
  });
});

describe('parseHex / luminance', () => {
  it('parses channels', () => {
    assert.deepEqual(parseHex('#ff8000'), { r: 255, g: 128, b: 0 });
  });

  it('ranks white brighter than black', () => {
    assert.ok(relativeLuminance('#ffffff') > relativeLuminance('#000000'));
    assert.ok(relativeLuminance('#ffffff') > 0.9);
    assert.ok(relativeLuminance('#000000') < 0.01);
  });

  it('classifies light vs dark backgrounds', () => {
    assert.equal(isLightBackground('#ffffff'), true);
    assert.equal(isLightBackground(BG_LIGHT), true);
    assert.equal(isLightBackground('#000000'), false);
    assert.equal(isLightBackground(BG_DARK), false);
  });
});

describe('contrastPaletteForBackground', () => {
  it('uses dark text on light backgrounds', () => {
    const palette = contrastPaletteForBackground('#ffffff');
    assert.equal(palette.isLight, true);
    assert.equal(palette.theme, 'light');
    assert.equal(palette.text, '#1a1d2e');
    assert.equal(palette.colorScheme, 'light');
  });

  it('uses light text on dark backgrounds', () => {
    const palette = contrastPaletteForBackground(BG_DARK);
    assert.equal(palette.isLight, false);
    assert.equal(palette.theme, 'dark');
    assert.equal(palette.text, '#f4f6ff');
    assert.equal(palette.colorScheme, 'dark');
  });

  it('keeps the chosen background color', () => {
    assert.equal(contrastPaletteForBackground('#e0f2fe').bg, '#e0f2fe');
    assert.equal(contrastPaletteForBackground('#0b1d36').bg, '#0b1d36');
  });
});

describe('resolveTheme', () => {
  it('returns explicit themes', () => {
    assert.equal(resolveTheme('light'), 'light');
    assert.equal(resolveTheme('dark'), 'dark');
  });

  it('auto follows prefers-color-scheme', () => {
    assert.equal(resolveTheme('auto', true), 'light');
    assert.equal(resolveTheme('auto', false), 'dark');
    assert.equal(resolveTheme(undefined, true), 'light');
  });
});

describe('themeDefaultBackground', () => {
  it('pairs light theme with light bg and dark with dark', () => {
    assert.equal(themeDefaultBackground('light'), BG_LIGHT);
    assert.equal(themeDefaultBackground('dark'), BG_DARK);
  });
});

describe('maybeSyncBackgroundForTheme', () => {
  it('switches stock dark bg to light default in light theme', () => {
    assert.equal(maybeSyncBackgroundForTheme(BG_DARK, 'light'), BG_LIGHT);
    assert.equal(maybeSyncBackgroundForTheme('#0F1221', 'light'), BG_LIGHT);
  });

  it('switches stock light bg to dark default in dark theme', () => {
    assert.equal(maybeSyncBackgroundForTheme(BG_LIGHT, 'dark'), BG_DARK);
  });

  it('keeps non-preset custom colors when theme changes', () => {
    assert.equal(maybeSyncBackgroundForTheme('#112233', 'light'), '#112233');
  });

  it('falls back to theme default for missing/invalid bg', () => {
    assert.equal(maybeSyncBackgroundForTheme('', 'light'), BG_LIGHT);
    assert.equal(maybeSyncBackgroundForTheme(undefined, 'dark'), BG_DARK);
  });
});

describe('BG_PRESETS', () => {
  it('includes popular dark and light recommendations', () => {
    const dark = BG_PRESETS.filter((p) => p.group === 'dark');
    const light = BG_PRESETS.filter((p) => p.group === 'light');
    assert.ok(dark.length >= 6);
    assert.ok(light.length >= 6);
    const values = BG_PRESETS.map((p) => p.value.toLowerCase());
    assert.ok(values.includes(BG_DARK.toLowerCase()));
    assert.ok(values.includes(BG_LIGHT.toLowerCase()));
    assert.ok(values.includes('#ffffff'));
    assert.ok(values.includes('#000000'));
  });

  it('every preset has a valid hex and label', () => {
    for (const preset of BG_PRESETS) {
      assert.ok(preset.label);
      assert.ok(normalizeHex(preset.value));
      assert.ok(preset.group === 'dark' || preset.group === 'light');
    }
  });
});
