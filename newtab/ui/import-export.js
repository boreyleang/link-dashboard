/**
 * Shortcuts Import / Export dialog. Export writes shortcuts to a JSON file;
 * import merges from a file (also accepts backup files via extractShortcuts).
 */
export function createImportExportModel(ctx) {
  const { els, state, toast, grid } = ctx;

  function onExport() {
    const shortcuts = Array.isArray(state.getShortcuts()) ? state.getShortcuts() : [];
    if (!shortcuts.length) { toast.show('No shortcuts to export'); return; }
    const data = { version: 1, exportedAt: new Date().toISOString(), shortcuts };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `link-dashboard-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.show('Shortcuts exported');
  }

  function extractShortcuts(data) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== 'object') return null;
    if (Array.isArray(data.shortcuts)) return data.shortcuts;
    if (Array.isArray(data.backups) && data.backups.length) {
      const latest = data.backups.reduce((a, b) =>
        new Date(b.timestamp || 0) >= new Date(a.timestamp || 0) ? b : a,
      );
      if (Array.isArray(latest?.data?.shortcuts)) return latest.data.shortcuts;
    }
    if (Array.isArray(data.data?.shortcuts)) return data.data.shortcuts;
    return null;
  }

  async function onImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const incoming = extractShortcuts(data);
      if (!Array.isArray(incoming)) throw new Error('Could not find any shortcuts in this file.');
      if (incoming.length === 0) throw new Error('The file contains an empty shortcuts list.');
      const valid = incoming.filter((s) => s && typeof s.url === 'string' && s.url.trim());
      if (!valid.length) throw new Error('No valid shortcuts found.');
      const ok = window.confirm(
        `Import ${valid.length} shortcut${valid.length !== 1 ? 's' : ''}?\n\nChoose OK to merge with existing shortcuts, or cancel to abort.`,
      );
      if (!ok) return;
      const existingUrls = new Set(state.getShortcuts().map((s) => s.url));
      let added = 0;
      for (const s of valid) {
        if (existingUrls.has(s.url)) continue;
        state.setShortcuts([...state.getShortcuts(), {
          id: `sc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}_imp`,
          title: String(s.title || '').trim() || s.url,
          url: s.url,
          icon: s.icon || '',
          iconColor: s.iconColor || '',
          color: s.color || '#4f6ef7',
          openIn: s.openIn || 'new-tab',
          description: s.description || '',
          group: s.group || '',
          order: s.order ?? 0,
          favorite: Boolean(s.favorite),
        }]);
        existingUrls.add(s.url);
        added++;
      }
      if (added === 0) { toast.show('All shortcuts already exist — nothing imported'); return; }
      await state.persist();
      grid.render();
      toast.show(`Imported ${added} shortcut${added !== 1 ? 's' : ''}`);
    } catch (err) {
      console.error('Import failed', err);
      toast.show(`Import failed: ${err.message}`);
    }
  }

  function open() {
    els.importExportModal.showModal();
  }

  function init() {
    els.btnImportExport.addEventListener('click', open);
    els.importExportModalClose.addEventListener('click', () => els.importExportModal.close());
    els.btnImportExportClose.addEventListener('click', () => els.importExportModal.close());
    els.btnExportStandalone.addEventListener('click', onExport);
    els.btnImportFileStandalone.addEventListener('change', onImport);
  }

  return { init, open };
}