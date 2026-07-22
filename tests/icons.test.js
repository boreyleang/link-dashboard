import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FREE_ICON_STORES,
  ICON_SEARCH_SUGGESTIONS,
  detectIconMode,
  iconifySvgUrl,
  parseIconifyUrl,
  isRemoteIconifyUrl,
  svgToBase64DataUrl,
  fileToBackgroundDataUrl,
  fileToIconDataUrl,
} from '../lib/icons.js';

describe('FREE_ICON_STORES', () => {
  it('lists recommended free stores with urls', () => {
    assert.ok(FREE_ICON_STORES.length >= 5);
    for (const store of FREE_ICON_STORES) {
      assert.ok(store.name);
      assert.match(store.url, /^https:\/\//);
      assert.ok(store.note);
    }
  });
});

describe('ICON_SEARCH_SUGGESTIONS', () => {
  it('has quick search chips', () => {
    assert.ok(ICON_SEARCH_SUGGESTIONS.includes('github'));
  });
});

describe('detectIconMode', () => {
  it('detects auto when empty', () => {
    assert.equal(detectIconMode(''), 'auto');
  });

  it('detects upload for data urls', () => {
    assert.equal(detectIconMode('data:image/png;base64,abc'), 'upload');
  });

  it('detects search for iconify urls', () => {
    assert.equal(
      detectIconMode('https://api.iconify.design/mdi/home.svg'),
      'search',
    );
  });

  it('detects url for normal https images', () => {
    assert.equal(detectIconMode('https://example.com/icon.png'), 'url');
  });
});

describe('iconifySvgUrl', () => {
  it('builds svg url', () => {
    const url = iconifySvgUrl('mdi', 'github');
    assert.match(url, /api\.iconify\.design\/mdi\/github\.svg/);
  });

  it('defaults to white icons', () => {
    const url = iconifySvgUrl('mdi', 'github');
    assert.match(url, /color=%23ffffff/);
  });

  it('encodes a custom icon color', () => {
    const url = iconifySvgUrl('mdi', 'github', '#ff5500');
    assert.match(url, /color=%23ff5500/);
  });
});

describe('parseIconifyUrl / isRemoteIconifyUrl', () => {
  it('parses iconify CDN urls', () => {
    assert.deepEqual(
      parseIconifyUrl('https://api.iconify.design/mdi/github.svg?height=128&color=%23ffffff'),
      { prefix: 'mdi', name: 'github' },
    );
    assert.equal(
      isRemoteIconifyUrl('https://api.iconify.design/lucide/home.svg'),
      true,
    );
    assert.equal(isRemoteIconifyUrl('data:image/png;base64,abc'), false);
  });
});

describe('svgToBase64DataUrl', () => {
  it('embeds svg as a durable data url', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="1"/></svg>';
    const dataUrl = svgToBase64DataUrl(svg);
    assert.match(dataUrl, /^data:image\/svg\+xml;base64,/);
    const base64 = dataUrl.split(',')[1];
    const decoded = Buffer.from(base64, 'base64').toString('utf8');
    assert.match(decoded, /<svg/);
  });
});

describe('file upload helpers', () => {
  it('rejects non-image files for background photo', async () => {
    const file = new File(['hello'], 'note.txt', { type: 'text/plain' });
    await assert.rejects(() => fileToBackgroundDataUrl(file), /image file/i);
  });

  it('rejects non-image files for icon upload', async () => {
    const file = new File(['hello'], 'note.txt', { type: 'text/plain' });
    await assert.rejects(() => fileToIconDataUrl(file), /image file/i);
  });
});
