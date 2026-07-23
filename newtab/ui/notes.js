/**
 * Quick Notes widget: auto-saved textarea (debounced) in localStorage.
 * Local-only convenience, not part of the synced dashboard state.
 */
const NOTES_KEY = 'linkDashboard_notes';

export function createNotesModel({ els }) {
  let saveTimer = null;

  function init() {
    els.notesToggle.addEventListener('click', () => {
      const expanded = els.notesToggle.getAttribute('aria-expanded') === 'true';
      els.notesToggle.setAttribute('aria-expanded', String(!expanded));
      els.notesBody.hidden = expanded;
    });

    const saved = localStorage.getItem(NOTES_KEY) || '';
    els.notesTextarea.value = saved;

    els.notesTextarea.addEventListener('input', () => {
      clearTimeout(saveTimer);
      els.notesSavedHint.classList.remove('is-visible');
      saveTimer = setTimeout(() => {
        localStorage.setItem(NOTES_KEY, els.notesTextarea.value);
        els.notesSavedHint.textContent = 'Saved';
        els.notesSavedHint.classList.add('is-visible');
        setTimeout(() => els.notesSavedHint.classList.remove('is-visible'), 2000);
      }, 600);
    });
  }

  return { init };
}