import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sortedGroupNames,
  availableGroups,
  groupCounts,
  reorderGroupOrder,
  mergedGroupOrder,
} from '../lib/grouping.js';
import { createShortcut } from '../lib/shortcuts.js';

const list = [
  createShortcut({ title: 'A', url: 'https://a.com', group: 'Popular' }),
  createShortcut({ title: 'B', url: 'https://b.com', group: 'Social' }),
  createShortcut({ title: 'C', url: 'https://c.com', group: 'Popular' }),
  createShortcut({ title: 'D', url: 'https://d.com' }),
];

describe('sortedGroupNames', () => {
  it('respects groupOrder, then alpha, ungrouped last', () => {
    const names = sortedGroupNames(list, ['Popular', 'Social']);
    assert.deepEqual(names, ['Popular', 'Social', '']);
  });

  it('places unknown groups after order ones, sorted alpha', () => {
    const names = sortedGroupNames(list, ['Social']);
    assert.deepEqual(names, ['Social', 'Popular', '']);
  });
});

describe('availableGroups', () => {
  it('lists only groups with shortcuts, no empty string', () => {
    assert.deepEqual(availableGroups(list, ['Popular', 'Social']), ['Popular', 'Social']);
  });
});

describe('groupCounts', () => {
  it('counts per group including ungrouped', () => {
    assert.deepEqual(groupCounts(list), { Popular: 2, Social: 1, '': 1 });
  });
});

describe('reorderGroupOrder', () => {
  it('moves from before the target', () => {
    assert.deepEqual(
      reorderGroupOrder(['Popular', 'Social', 'Fun'], 'Fun', 'Popular'),
      ['Fun', 'Popular', 'Social'],
    );
  });

  it('is a no-op when target absent', () => {
    const order = ['Popular', 'Social'];
    assert.equal(reorderGroupOrder(order, 'Fun', 'Missing'), order);
  });
});

describe('mergedGroupOrder', () => {
  it('keeps declared order first then adds present groups', () => {
    assert.deepEqual(mergedGroupOrder(list, ['Social']), ['Social', 'Popular']);
  });
});