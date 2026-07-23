/**
 * Group filter modal: choose which groups are visible in the grid.
 * Selection is persisted in settings.filterGroups (empty = show all).
 */
import { availableGroups } from '../../lib/grouping.js';
import { getGroupMeta } from '../../lib/shortcuts.js';
import { escHtml } from '../core/dom.js';

export function createGroupFilterModel(ctx) {
  const { els, state, toast, grid } = ctx;
  let filterGroups = [];
  let available = [];

  function getAvailable() {
    return availableGroups(state.getShortcuts(), state.getSettings().groupOrder || []);
  }

  function renderCheckboxes() {
    available = getAvailable();
    const allChecked = filterGroups.length === 0;
    const escapeAttr = (v) => String(v).replace(/"/g, '&quot;');

    let html = `
      <div class="store-checkbox">
        <input type="checkbox" id="filter-all" name="filter-group" value="all" ${allChecked ? 'checked' : ''}>
        <label for="filter-all">All (all groups)</label>
      </div>`;

    if (available.length === 0) {
      html += `<p class="panel-help">No groups yet. Assign groups to your shortcuts to filter them here.</p>`;
    } else {
      for (const g of available) {
        const count = state.getShortcuts().filter((s) => (s.group || '') === g).length;
        const id = `filter-grp-${escapeAttr(g)}`;
        const checked = allChecked || filterGroups.includes(g);
        const meta = getGroupMeta(state.getSettings(), g);
        const iconHtml = meta.icon ? `<span class="group-filter-icon">${escHtml(meta.icon)}</span>` : '';
        const dotHtml = meta.color
          ? `<span class="group-filter-dot" style="background:${escapeAttr(meta.color)}"></span>`
          : '';
        const labelStyle = meta.color ? ` style="color:${escapeAttr(meta.color)}"` : '';
        html += `
          <div class="store-checkbox">
            <input type="checkbox" id="${escapeAttr(id)}" name="filter-group" value="${escapeAttr(g)}" ${checked ? 'checked' : ''}>
            <label for="${escapeAttr(id)}"${labelStyle}>${iconHtml}${dotHtml}${escHtml(g)} (${count})</label>
          </div>`;
      }
    }

    els.groupFilterList.innerHTML = html;
  }

  function updateSummary() {
    const summary = document.getElementById('filter-summary');
    if (!summary) return;
    const allCb = document.getElementById('filter-all');
    const allChecked = allCb && allCb.checked;
    if (filterGroups.length === 0) {
      summary.textContent = allChecked ? 'Showing all groups.' : 'No groups selected — nothing will be shown.';
    } else {
      summary.textContent = `Filtering: ${filterGroups.join(', ')}`;
    }
  }

  function onCheck(event) {
    const val = event.target.value;
    const groups = available;
    const allCb = document.getElementById('filter-all');

    if (val === 'all') {
      if (event.target.checked) {
        filterGroups = [];
        for (const cb of els.groupFilterList.querySelectorAll('input[value]')) {
          if (cb.value !== 'all') cb.checked = true;
        }
      } else {
        filterGroups = [];
        for (const cb of els.groupFilterList.querySelectorAll('input[value]')) {
          if (cb.value !== 'all') cb.checked = false;
        }
        updateSummary();
        return;
      }
    } else {
      if (!event.target.checked) {
        filterGroups = groups.filter((g) => {
          if (g === val) return false;
          const cb = els.groupFilterModal.querySelector(`input[value="${g}"]`);
          return cb && cb.checked;
        });
      } else {
        if (allCb) allCb.checked = false;
        filterGroups = groups.filter((g) => {
          if (g === val) return true;
          const cb = els.groupFilterModal.querySelector(`input[value="${g}"]`);
          return cb && cb.checked;
        });
      }
      if (filterGroups.length === 0 && allCb) allCb.checked = true;
    }
    updateSummary();
  }

  async function onApply() {
    state.patchSettings({ filterGroups: [...filterGroups] });
    await state.persist();
    grid.render();
    els.groupFilterModal.close();
    toast.show(filterGroups.length ? `Showing: ${filterGroups.join(', ')}` : 'Showing all groups');
  }

  function onClear() {
    filterGroups = [];
    for (const cb of els.groupFilterList.querySelectorAll('input[value]')) cb.checked = true;
    updateSummary();
  }

  function open() {
    const existing = new Set(getAvailable());
    filterGroups = [...(state.getSettings().filterGroups || [])].filter((g) => existing.has(g));
    renderCheckboxes();
    updateSummary();
    els.groupFilterModal.showModal();
  }

  function init() {
    els.btnGroupFilter.addEventListener('click', open);
    els.groupFilterModalClose.addEventListener('click', () => els.groupFilterModal.close());
    document.getElementById('btn-group-filter-clear').addEventListener('click', onClear);
    document.getElementById('btn-group-filter-apply').addEventListener('click', onApply);
    els.groupFilterList.addEventListener('change', (e) => {
      if (e.target.matches('input[name="filter-group"]')) onCheck(e);
    });
  }

  return { init, open };
}