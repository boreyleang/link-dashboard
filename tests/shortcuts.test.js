import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createShortcut,
  updateShortcut,
  removeShortcut,
  reorderShortcuts,
  toggleFavorite,
  setFavorite,
  getFavorites,
  getGroupMeta,
  setGroupMeta,
  renameGroupMeta,
  deleteGroupMeta,
} from '../lib/shortcuts.js';
import { normalizeUrl, faviconFromUrl, DEFAULT_SHORTCUTS, DEFAULT_SETTINGS } from '../lib/storage.js';

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

  it('defaults iconColor to empty string', () => {
    const item = createShortcut({ url: 'example.com' });
    assert.equal(item.iconColor, '');
  });

  it('stores the search icon color', () => {
    const item = createShortcut({
      url: 'example.com',
      iconColor: '#ff5500',
    });
    assert.equal(item.iconColor, '#ff5500');
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

  it('updates iconColor when patched', () => {
    const base = [createShortcut({ url: 'a.com', iconColor: '#ffffff' })];
    const next = updateShortcut(base, base[0].id, { iconColor: '#00ff88' });
    assert.equal(next[0].iconColor, '#00ff88');
  });

  it('keeps iconColor when not patched', () => {
    const base = [createShortcut({ url: 'a.com', iconColor: '#ff5500' })];
    const next = updateShortcut(base, base[0].id, { title: 'Renamed' });
    assert.equal(next[0].iconColor, '#ff5500');
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

describe('DEFAULT_SHORTCUTS (reset to defaults)', () => {
  it('provides a recommended starter set of popular links', () => {
    assert.ok(DEFAULT_SHORTCUTS.length >= 10);
  });

  it('every default has unique id, title, https url, icon and hex color', () => {
    const ids = new Set();
    for (const item of DEFAULT_SHORTCUTS) {
      assert.ok(item.id, `missing id for ${item.title}`);
      assert.ok(!ids.has(item.id), `duplicate id ${item.id}`);
      ids.add(item.id);
      assert.ok(item.title, `missing title for ${item.id}`);
      assert.match(item.url, /^https:\/\//, `${item.title} url must be https`);
      assert.match(item.icon, /^https:\/\//, `${item.title} icon must be a url`);
      assert.match(item.color, /^#[0-9a-fA-F]{6}$/, `${item.title} color must be hex`);
      assert.equal(item.openIn, 'new-tab');
    }
  });

  it('every default group is listed in settings groupOrder', () => {
    const groupOrder = DEFAULT_SETTINGS.groupOrder || [];
    for (const item of DEFAULT_SHORTCUTS) {
      if (!item.group) continue;
      assert.ok(
        groupOrder.includes(item.group),
        `group "${item.group}" (${item.title}) missing from groupOrder`,
      );
    }
  });

  it('DEFAULT_SETTINGS ships well-formed groupMeta defaults', () => {
    const meta = DEFAULT_SETTINGS.groupMeta || {};
    assert.ok(typeof meta === 'object' && meta !== null, 'groupMeta must be an object');
    // Every default group should have a color and icon
    for (const g of DEFAULT_SETTINGS.groupOrder) {
      assert.ok(meta[g], `default group "${g}" missing from groupMeta`);
      assert.match(meta[g].color, /^#[0-9a-fA-F]{6}$/, `${g} color must be hex`);
      assert.ok(meta[g].icon, `${g} must have an icon`);
    }
  });
});

describe('group metadata', () => {
  const baseSettings = { groupOrder: ['Popular'], groupMeta: {} };

  it('getGroupMeta returns an empty object for unknown groups', () => {
    assert.deepEqual(getGroupMeta(baseSettings, 'Popular'), {});
    assert.deepEqual(getGroupMeta(baseSettings, 'Nope'), {});
    assert.deepEqual(getGroupMeta(null, 'x'), {});
  });

  it('setGroupMeta stores a sanitized color and icon', () => {
    const next = setGroupMeta(baseSettings, 'Popular', { color: '#4285F4', icon: '🔥' });
    assert.equal(next.groupMeta.Popular.color, '#4285f4');
    assert.equal(next.groupMeta.Popular.icon, '🔥');
    // original settings object is not mutated
    assert.deepEqual(baseSettings.groupMeta, {});
  });

  it('getGroupMeta reads back stored metadata', () => {
    const next = setGroupMeta(baseSettings, 'Popular', { color: '#10a37f', icon: '🤖' });
    assert.deepEqual(getGroupMeta(next, 'Popular'), { color: '#10a37f', icon: '🤖' });
  });

  it('setGroupMeta rejects invalid colors and trims icons', () => {
    const next = setGroupMeta(baseSettings, 'Popular', { color: 'not-a-color', icon: '  📦  ' });
    assert.equal(next.groupMeta.Popular.color, undefined);
    assert.equal(next.groupMeta.Popular.icon, '📦');
  });

  it('setGroupMeta caps icon length to 4 characters', () => {
    const next = setGroupMeta(baseSettings, 'Popular', { icon: 'abcdefgh' });
    assert.equal(next.groupMeta.Popular.icon, 'abcd');
  });

  it('setGroupMeta removes an entry when all fields are cleared', () => {
    const withMeta = setGroupMeta(baseSettings, 'Popular', { color: '#4285f4', icon: '🔥' });
    const cleared = setGroupMeta(withMeta, 'Popular', { color: '', icon: '' });
    assert.ok(!('Popular' in cleared.groupMeta));
  });

  it('renameGroupMeta carries metadata to the new name', () => {
    const withMeta = setGroupMeta(baseSettings, 'Popular', { color: '#4285f4', icon: '🔥' });
    const renamed = renameGroupMeta(withMeta, 'Popular', 'Trending');
    assert.ok(!('Popular' in renamed.groupMeta));
    assert.equal(renamed.groupMeta.Trending.color, '#4285f4');
    assert.equal(renamed.groupMeta.Trending.icon, '🔥');
  });

  it('renameGroupMeta is a no-op when the group has no metadata', () => {
    assert.equal(renameGroupMeta(baseSettings, 'Popular', 'Trending'), baseSettings);
  });

  it('deleteGroupMeta removes an entry and is a no-op when absent', () => {
    const withMeta = setGroupMeta(baseSettings, 'Popular', { color: '#4285f4' });
    const deleted = deleteGroupMeta(withMeta, 'Popular');
    assert.ok(!('Popular' in deleted.groupMeta));
    assert.equal(deleteGroupMeta(baseSettings, 'Popular'), baseSettings);
  });
});

describe('favorites', () => {
  it('createShortcut defaults favorite to false', () => {
    const item = createShortcut({ url: 'example.com' });
    assert.equal(item.favorite, false);
  });

  it('createShortcut accepts favorite true', () => {
    const item = createShortcut({ url: 'example.com', favorite: true });
    assert.equal(item.favorite, true);
  });

  it('updateShortcut sets favorite via patch', () => {
    const list = [createShortcut({ url: 'a.com' })];
    const next = updateShortcut(list, list[0].id, { favorite: true });
    assert.equal(next[0].favorite, true);
  });

  it('toggleFavorite flips only the target item', () => {
    const list = [
      createShortcut({ url: 'a.com' }),
      createShortcut({ url: 'b.com', favorite: true }),
    ];
    const next = toggleFavorite(list, list[0].id);
    assert.equal(next[0].favorite, true);
    assert.equal(next[1].favorite, true);
    const back = toggleFavorite(next, next[1].id);
    assert.equal(back[1].favorite, false);
  });

  it('setFavorite sets an explicit value', () => {
    const list = [createShortcut({ url: 'a.com', favorite: true })];
    const next = setFavorite(list, list[0].id, false);
    assert.equal(next[0].favorite, false);
  });

  it('getFavorites returns only favorited items', () => {
    const list = [
      createShortcut({ url: 'a.com', favorite: true }),
      createShortcut({ url: 'b.com' }),
      createShortcut({ url: 'c.com', favorite: true }),
    ];
    assert.equal(getFavorites(list).length, 2);
  });
});
