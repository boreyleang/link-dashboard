/**
 * Chrome storage helpers for dashboard state.
 * Falls back to localStorage when chrome.storage is unavailable (file:// preview).
 */

const STORAGE_KEY = 'linkDashboard';

const DEFAULT_SETTINGS = {
  backgroundColor: '#0f1221',
  backgroundImage: '',
  tileSize: 'medium',
  showLabels: true,
  columns: 0,
  locked: true,
  groupOrder: ['Social', 'Design', 'Productivity', 'Development'],
  groupDisplay: 'grid',
  showBookmarks: false,
  showNotes: false,
  showRecent: true,
  recentCount: 8,
};

const DEFAULT_SHORTCUTS = [
  {
    id: 'demo-google',
    title: 'Google',
    url: 'https://www.google.com',
    icon: 'https://www.google.com/favicon.ico',
    color: '#4285F4',
    openIn: 'new-tab',
    group: '',
    order: 0,
    description: '',
    showDescription: true,
  },
  {
    id: 'demo-youtube',
    title: 'YouTube',
    url: 'https://www.youtube.com',
    icon: 'https://www.youtube.com/favicon.ico',
    color: '#FF0000',
    openIn: 'new-tab',
    group: 'Social',
    order: 0,
    description: 'Watch videos',
    showDescription: true,
  },
  {
    id: 'demo-github',
    title: 'GitHub',
    url: 'https://github.com',
    icon: 'https://github.com/favicon.ico',
    color: '#24292f',
    openIn: 'new-tab',
    group: 'Design',
    order: 0,
    description: 'Code repositories',
    showDescription: true,
  },
  {
    id: 'demo-gmail',
    title: 'Gmail',
    url: 'https://mail.google.com',
    icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
    color: '#EA4335',
    openIn: 'new-tab',
    group: 'Social',
    order: 1,
    description: 'Email',
    showDescription: true,
  },
  {
    id: 'demo-figma',
    title: 'Figma',
    url: 'https://www.figma.com',
    icon: 'https://www.figma.com/favicon.ico',
    color: '#A259FF',
    openIn: 'new-tab',
    group: 'Design',
    order: 1,
    description: 'UI design tool',
    showDescription: true,
  },
  {
    id: 'demo-dribbble',
    title: 'Dribbble',
    url: 'https://dribbble.com',
    icon: 'https://dribbble.com/favicon.ico',
    color: '#EA4C89',
    openIn: 'new-tab',
    group: 'Design',
    order: 2,
    description: 'Design inspiration',
    showDescription: true,
  },
  {
    id: 'demo-notion',
    title: 'Notion',
    url: 'https://notion.so',
    icon: 'https://www.notion.so/favicon.ico',
    color: '#000000',
    openIn: 'new-tab',
    group: 'Productivity',
    order: 0,
    description: 'All-in-one workspace',
    showDescription: true,
  },
  {
    id: 'demo-slack',
    title: 'Slack',
    url: 'https://slack.com',
    icon: 'https://slack.com/favicon.ico',
    color: '#4A154B',
    openIn: 'new-tab',
    group: 'Productivity',
    order: 1,
    description: 'Team communication',
    showDescription: true,
  },
  {
    id: 'demo-github-actions',
    title: 'GitHub Actions',
    url: 'https://github.com/features/actions',
    icon: 'https://github.com/favicon.ico',
    color: '#24292f',
    openIn: 'new-tab',
    group: 'Development',
    order: 0,
    description: 'CI/CD automation',
    showDescription: true,
  },
  {
    id: 'demo-docker',
    title: 'Docker',
    url: 'https://docker.com',
    icon: 'https://docker.com/favicon.ico',
    color: '#0db7ed',
    openIn: 'new-tab',
    group: 'Development',
    order: 1,
    description: 'Container platform',
    showDescription: true,
  },
];

function createId() {
  return `sc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function defaultState() {
  return {
    shortcuts: DEFAULT_SHORTCUTS.map((item) => ({ ...item })),
    archived: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

async function readRaw() {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] ?? null;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function writeRaw(state) {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ [STORAGE_KEY]: state });
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function loadState() {
  const saved = await readRaw();
  if (!saved) {
    return defaultState();
  }

  return {
    shortcuts: Array.isArray(saved.shortcuts) ? saved.shortcuts : defaultState().shortcuts,
    archived: Array.isArray(saved.archived) ? saved.archived : [],
    settings: { ...DEFAULT_SETTINGS, ...(saved.settings || {}) },
  };
}

export async function saveState(state) {
  await writeRaw({
    shortcuts: state.shortcuts,
    archived: state.archived || [],
    settings: state.settings,
  });
}

export async function resetState() {
  const state = defaultState();
  await saveState(state);
  return state;
}

export function normalizeUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function faviconFromUrl(url) {
  try {
    const host = new URL(normalizeUrl(url)).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  } catch {
    return '';
  }
}

export { DEFAULT_SETTINGS, DEFAULT_SHORTCUTS, createId };
