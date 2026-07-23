import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildPaletteItems } from '../lib/palette-items.js';
import { createShortcut } from '../lib/shortcuts.js';

const shortcuts = [
  createShortcut({ title: 'GitHub', url: 'https://github.com', group: 'Code', description: 'repos' }),
  createShortcut({ title: 'YouTube', url: 'https://youtube.com', group: 'Fun' }),
];

const actions = [
  { label: 'Add link', icon: '➕', run: () => {} },
  { label: 'Customize dashboard', icon: '⚙', run: () => {} },
];

describe('buildPaletteItems', () => {
  it('returns actions + all shortcuts when query is empty', () => {
    const items = buildPaletteItems(shortcuts, '', actions);
    assert.equal(items.filter((i) => i.type === 'action').length, 2);
    assert.equal(items.filter((i) => i.type === 'shortcut').length, 2);
  });

  it('filters actions and shortcuts by query', () => {
    const items = buildPaletteItems(shortcuts, 'git', actions);
    assert.equal(items.length, 1);
    assert.equal(items[0].type, 'shortcut');
    assert.equal(items[0].label, 'GitHub');
  });

  it('matches action labels', () => {
    const items = buildPaletteItems(shortcuts, 'customize', actions);
    assert.equal(items.length, 1);
    assert.equal(items[0].label, 'Customize dashboard');
  });

  it('tags shortcuts with group Links and actions with Actions', () => {
    const items = buildPaletteItems(shortcuts, '', actions);
    assert.ok(items.filter((i) => i.type === 'action').every((i) => i.group === 'Actions'));
    assert.ok(items.filter((i) => i.type === 'shortcut').every((i) => i.group === 'Links'));
  });

  it('handles empty shortcuts and actions', () => {
    assert.deepEqual(buildPaletteItems([], '', []), []);
  });
});