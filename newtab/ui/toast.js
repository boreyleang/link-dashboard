/**
 * Toast notification service. Owns the toast element + timers.
 */
export function createToastModel({ els }) {
  let timer = null;

  function clear() {
    clearTimeout(timer);
  }

  function hide() {
    els.toast.hidden = true;
  }

  function show(message) {
    els.toast.hidden = false;
    els.toast.textContent = message;
    clear();
    timer = setTimeout(hide, 2200);
  }

  function showUndo(message, onUndo) {
    els.toast.hidden = false;
    els.toast.replaceChildren();

    const text = document.createElement('span');
    text.textContent = message;
    els.toast.appendChild(text);

    const undoBtn = document.createElement('button');
    undoBtn.type = 'button';
    undoBtn.className = 'toast-undo';
    undoBtn.textContent = 'Undo';
    undoBtn.addEventListener('click', async () => {
      clear();
      hide();
      await onUndo();
    });
    els.toast.appendChild(undoBtn);

    clear();
    timer = setTimeout(hide, 6000);
  }

  return { show, showUndo };
}