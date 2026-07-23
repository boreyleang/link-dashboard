import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { addRecentEntry } from '../lib/recent.js';

describe('addRecentEntry', () => {
  it('prepends a new visit', () => {
    const r = addRecentEntry([], { id: '1', title: 'A', url: 'https://a.com' });
    assert.equal(r.length, 1);
    assert.equal(r[0].id, '1');
    assert.ok(r[0].ts > 0);
  });

  it('dedupes by id moving the existing entry to the top', () => {
    const existing = [
      { id: '1', title: 'A', url: 'https://a.com', ts: 100 },
      { id: '2', title: 'B', url: 'https://b.com', ts: 200 },
    ];
    const r = addRecentEntry(existing, { id: '2', title: 'B', url: 'https://b.com' });
    assert.equal(r.length, 2);
    assert.equal(r[0].id, '2');
    assert.equal(r[1].id, '1');
  });

  it('caps to max entries', () => {
    let r = [];
    for (let i = 0; i < 25; i++) {
      r = addRecentEntry(r, { id: String(i), title: `x${i}`, url: `https://x${i}.com` }, 20);
    }
    assert.equal(r.length, 20);
    assert.equal(r[0].id, '24');
  });

  it('ignores empty item', () => {
    const r = addRecentEntry([{ id: '1' }], null);
    assert.equal(r.length, 1);
  });
});