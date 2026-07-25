const STORAGE_KEY = 'linkDashboard';

function createId() {
  return `sc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^localhost(:\d+)?(\/|$)/.test(trimmed)) return `http://${trimmed}`;
  if (/^[\w-]+(\.[\w-]+)+(:\d+)?(\/|$)/.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function hostnameLabel(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '') || 'Link';
  } catch {
    return 'Link';
  }
}

function faviconFromUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
  } catch {
    return '';
  }
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function getState() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || { shortcuts: [], archived: [], settings: {} };
}

async function setState(state) {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
}

function showStatus(message, type) {
  const el = document.getElementById('status');
  el.textContent = message;
  el.className = `status ${type}`;
  el.hidden = false;
}

async function loadGroups() {
  const state = await getState();
  const shortcuts = state.shortcuts || [];
  const settings = state.settings || {};

  // Start with default groups from settings
  const defaultGroups = settings.groupOrder || ['Popular', 'Social', 'Entertainment', 'Shopping'];

  // Add any additional groups from existing shortcuts
  const shortcutGroups = shortcuts.map(s => s.group).filter(Boolean);

  // Merge and deduplicate, preserving order
  const allGroups = [...new Set([...defaultGroups, ...shortcutGroups])].sort();

  const datalist = document.getElementById('group-list');
  datalist.innerHTML = allGroups.map(g => `<option value="${escapeHtml(g)}"></option>`).join('');
}

async function init() {
  const form = document.getElementById('save-form');
  const fieldTitle = document.getElementById('field-title');
  const fieldUrl = document.getElementById('field-url');
  const fieldGroup = document.getElementById('field-group');
  const btnCancel = document.getElementById('btn-cancel');
  const btnSave = document.getElementById('btn-save');

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    fieldTitle.value = tab.title || '';
    fieldUrl.value = tab.url || '';
  }

  // Load existing groups
  await loadGroups();

  // Cancel closes popup
  btnCancel.addEventListener('click', () => window.close());

  // Save form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btnSave.disabled = true;
    btnSave.textContent = 'Saving...';

    const title = fieldTitle.value.trim();
    const rawUrl = fieldUrl.value.trim();
    const group = fieldGroup.value.trim();

    if (!rawUrl) {
      showStatus('URL is required', 'error');
      btnSave.disabled = false;
      btnSave.textContent = 'Save';
      return;
    }

    const url = normalizeUrl(rawUrl);

    try {
      const state = await getState();
      const shortcuts = state.shortcuts || [];

      // Check for duplicate URL
      if (shortcuts.some(s => s.url === url)) {
        showStatus('This link is already saved', 'error');
        btnSave.disabled = false;
        btnSave.textContent = 'Save';
        return;
      }

      const shortcut = {
        id: createId(),
        title: title || hostnameLabel(url),
        url,
        icon: faviconFromUrl(url),
        iconColor: '',
        color: '#4f6ef7',
        openIn: 'new-tab',
        description: '',
        showDescription: true,
        group,
        order: 0,
        favorite: false,
      };

      state.shortcuts = [...shortcuts, shortcut];
      await setState(state);

      showStatus('Saved!', 'success');
      btnSave.textContent = 'Saved';
      setTimeout(() => window.close(), 800);
    } catch (err) {
      console.error(err);
      showStatus('Failed to save', 'error');
      btnSave.disabled = false;
      btnSave.textContent = 'Save';
    }
  });

  fieldTitle.focus();
  fieldTitle.select();
}

document.addEventListener('DOMContentLoaded', init);
