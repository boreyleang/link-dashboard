import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterShortcuts } from '../lib/filtering.js';
import { createShortcut } from '../lib/shortcuts.js';

const list = [
  createShortcut({ title: 'GitHub', url: 'https://github.com', group: 'Code', description: 'repos' }),
  createShortcut({ title: 'YouTube', url: 'https://youtube.com', group: 'Fun', favorite: true }),
  createShortcut({ title: 'Gmail', url: 'https://mail.google.com', group: 'Code' }),
  createShortcut({ title: 'Bare', url: 'https://example.com' }),
];

describe('filterShortcuts', () => {
  it('returns all when no options given', () => {
    assert.equal(filterShortcuts(list).length, list.length);
  });

  it('filters by query across title/url/description/group', () => {
    assert.equal(filterShortcuts(list, { query: 'git' }).length, 1);
    assert.equal(filterShortcuts(list, { query: 'mail' }).length, 1);
    assert.equal(filterShortcuts(list, { query: 'fun' }).length, 1);
    assert.equal(filterShortcuts(list, { query: 'repos' }).length, 1);
  });

  it('matches "favorite" keyword against favorited items', () => {
    const favs = filterShortcuts(list, { query: 'favorite' });
    assert.equal(favs.length, 1);
    assert.equal(favs[0].title, 'YouTube');
  });

  it('restricts to selected groups', () => {
    const code = filterShortcuts(list, { groups: ['Code'] });
    assert.equal(code.length, 2);
    assert.ok(code.every((s) => s.group === 'Code'));
  });

  it('restricts to favorites only', () => {
    const favs = filterShortcuts(list, { favoritesOnly: true });
    assert.equal(favs.length, 1);
    assert.equal(favs[0].title, 'YouTube');
  });

  it('combines groups + favorites + query', () => {
    const r = filterShortcuts(list, { groups: ['Fun'], favoritesOnly: true, query: 'tube' });
    assert.equal(r.length, 1);
    assert.equal(r[0].title, 'YouTube');
  });

  it('is case-insensitive and trims the query', () => {
    assert.equal(filterShortcuts(list, { query: '  GITHUB  ' }).length, 1);
  });
});