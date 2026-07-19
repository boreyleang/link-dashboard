import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createShortcut,
  updateShortcut,
  removeShortcut,
  reorderShortcuts,
} from '../lib/shortcuts.js';
import { normalizeUrl, faviconFromUrl } from '../lib/storage.js';

describe('normalizeUrl', () => {
  it('adds https when protocol is missing', () => {
    assert.equal(normalizeUrl('example.com'), 'https://example.com');
  });

  it('keeps existing https', () => {
    assert.equal(normalizeUrl('https://example.com/path'), 'https://example.com/path');
  });
});

describe('faviconFromUrl', () => {
  it('builds a favicon helper URL', () => {
    const icon = faviconFromUrl('https://github.com');
    assert.match(icon, /github\.com/);
  });
});

describe('createShortcut', () => {
  it('creates a shortcut with normalized url and defaults', () => {
    const item = createShortcut({
      title: 'GitHub',
      url: 'github.com',
      color: '#111111',
    });

    assert.equal(item.title, 'GitHub');
    assert.equal(item.url, 'https://github.com');
    assert.equal(item.color, '#111111');
    assert.equal(item.openIn, 'new-tab');
    assert.ok(item.id.startsWith('sc_'));
    assert.ok(item.icon.includes('github.com'));
  });

  it('uses hostname as title when title is empty', () => {
    const item = createShortcut({ title: '  ', url: 'https://www.youtube.com' });
    assert.equal(item.title, 'youtube.com');
  });

  it('stores same-tab open mode when selected', () => {
    const item = createShortcut({
      title: 'Docs',
      url: 'https://example.com',
      openIn: 'same-tab',
    });
    assert.equal(item.openIn, 'same-tab');
  });

  it('preserves embedded search/upload data URL icons', () => {
    const dataUrl =
      'data:image/svg+xml;base64,' +
      Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1"/></svg>',
      ).toString('base64');

    const item = createShortcut({
      title: 'Search icon link',
      url: 'https://example.com',
      icon: dataUrl,
    });

    assert.equal(item.icon, dataUrl);
  });
});

describe('updateShortcut icon persistence', () => {
  it('keeps data URL icons across updates', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    const base = [
      createShortcut({
        title: 'A',
        url: 'https://a.test',
        icon: dataUrl,
      }),
    ];

    const next = updateShortcut(base, base[0].id, {
      title: 'Alpha',
      icon: dataUrl,
    });

    assert.equal(next[0].title, 'Alpha');
    assert.equal(next[0].icon, dataUrl);
  });
});

describe('updateShortcut / removeShortcut / reorderShortcuts', () => {
  const base = [
    createShortcut({ title: 'A', url: 'https://a.test', color: '#111111' }),
    createShortcut({ title: 'B', url: 'https://b.test', color: '#222222' }),
    createShortcut({ title: 'C', url: 'https://c.test', color: '#333333' }),
  ];

  it('updates a shortcut by id', () => {
    const next = updateShortcut(base, base[0].id, { title: 'Alpha' });
    assert.equal(next[0].title, 'Alpha');
    assert.equal(next[1].title, 'B');
  });

  it('updates openIn mode', () => {
    const next = updateShortcut(base, base[0].id, { openIn: 'same-tab' });
    assert.equal(next[0].openIn, 'same-tab');
  });

  it('removes a shortcut by id', () => {
    const next = removeShortcut(base, base[1].id);
    assert.equal(next.length, 2);
    assert.equal(next[0].id, base[0].id);
    assert.equal(next[1].id, base[2].id);
  });

  it('reorders shortcuts by drag drop ids', () => {
    const next = reorderShortcuts(base, base[0].id, base[2].id);
    assert.deepEqual(
      next.map((s) => s.title),
      ['B', 'C', 'A'],
    );
  });
});
