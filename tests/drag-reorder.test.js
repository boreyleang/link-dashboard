import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyDrop } from '../lib/drag-reorder.js';
import { createShortcut } from '../lib/shortcuts.js';

const list = [
  { ...createShortcut({ title: 'A', url: 'https://a.com', group: 'G' }), order: 0 },
  { ...createShortcut({ title: 'B', url: 'https://b.com', group: 'G' }), order: 1 },
  { ...createShortcut({ title: 'C', url: 'https://c.com', group: 'G' }), order: 2 },
];

describe('applyDrop', () => {
  it('moves an item before the anchor within a group', () => {
    const next = applyDrop(list, { dragId: list[2].id, anchorId: list[0].id, dropAfter: false, toGroup: 'G' });
    const order = next.filter((s) => s.group === 'G').sort((a, b) => a.order - b.order).map((s) => s.title);
    assert.deepEqual(order, ['C', 'A', 'B']);
    assert.equal(next.find((s) => s.title === 'C').group, 'G');
  });

  it('moves an item after the anchor', () => {
    const next = applyDrop(list, { dragId: list[0].id, anchorId: list[1].id, dropAfter: true, toGroup: 'G' });
    const order = next.filter((s) => s.group === 'G').sort((a, b) => a.order - b.order).map((s) => s.title);
    assert.deepEqual(order, ['B', 'A', 'C']);
  });

  it('moves to end when no anchor', () => {
    const next = applyDrop(list, { dragId: list[0].id, anchorId: null, toGroup: 'G' });
    const order = next.filter((s) => s.group === 'G').sort((a, b) => a.order - b.order).map((s) => s.title);
    assert.deepEqual(order, ['B', 'C', 'A']);
  });

  it('reassigns sequential order values 0..n', () => {
    const next = applyDrop(list, { dragId: list[2].id, anchorId: list[0].id, dropAfter: false, toGroup: 'G' });
    const orders = next.filter((s) => s.group === 'G').map((s) => s.order).sort((a, b) => a - b);
    assert.deepEqual(orders, [0, 1, 2]);
  });

  it('changes the dragged item group when dropping onto another group heading', () => {
    const next = applyDrop(list, { dragId: list[0].id, toGroup: 'Other' });
    assert.equal(next.find((s) => s.title === 'A').group, 'Other');
    assert.equal(next.find((s) => s.title === 'A').order, 0);
  });

  it('returns the same list when dragId is unknown', () => {
    assert.equal(applyDrop(list, { dragId: 'nope', toGroup: 'G' }), list);
  });
});