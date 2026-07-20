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
  showDescription: true,
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
    icon: 'https://www.google.com/s2/favicons?domain=notion.so&sz=128',
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

/** Curated catalog of links users can add from the Store. */
const STORE_CATALOG = [
  // Social
  { title: 'Twitter / X', url: 'https://x.com', icon: 'https://abs.twimg.com/favicons/twitter.3.ico', color: '#1DA1F2', group: 'Social', description: 'Social networking' },
  { title: 'LinkedIn', url: 'https://linkedin.com', icon: 'https://linkedin.com/favicon.ico', color: '#0A66C2', group: 'Social', description: 'Professional network' },
  { title: 'Reddit', url: 'https://reddit.com', icon: 'https://www.reddit.com/favicon.ico', color: '#FF4500', group: 'Social', description: 'News & communities' },
  { title: 'Discord', url: 'https://discord.com', icon: 'https://www.google.com/s2/favicons?domain=discord.com&sz=128', color: '#5865F2', group: 'Social', description: 'Voice & text chat' },
  { title: 'Instagram', url: 'https://instagram.com', icon: 'https://static.cdninstagram.com/rsrc.php/yr/r/rzWiSjZRxk5.webp', color: '#E4405F', group: 'Social', description: 'Photo sharing' },
  { title: 'TikTok', url: 'https://tiktok.com', icon: 'https://www.tiktok.com/favicon.ico', color: '#000000', group: 'Social', description: 'Short videos' },
  { title: 'Facebook', url: 'https://facebook.com', icon: 'https://www.facebook.com/favicon.ico', color: '#1877F2', group: 'Social', description: 'Social networking' },
  { title: 'Telegram', url: 'https://web.telegram.org', icon: 'https://web.telegram.org/favicon.ico', color: '#26A5E4', group: 'Social', description: 'Messaging app' },

  // Design
  { title: 'Behance', url: 'https://behance.net', icon: 'https://www.behance.net/favicon.ico', color: '#1769FF', group: 'Design', description: 'Creative portfolio' },
  { title: 'Unsplash', url: 'https://unsplash.com', icon: 'https://unsplash.com/favicon.ico', color: '#000000', group: 'Design', description: 'Free stock photos' },
  { title: 'Coolors', url: 'https://coolors.co', icon: 'https://www.google.com/s2/favicons?domain=coolors.co&sz=128', color: '#000000', group: 'Design', description: 'Color palette generator' },
  { title: 'Font Awesome', url: 'https://fontawesome.com', icon: 'https://fontawesome.com/favicon.ico', color: '#339AF0', group: 'Design', description: 'Icon library' },
  { title: 'Miro', url: 'https://miro.com', icon: 'https://miro.com/favicon.ico', color: '#FFD02F', group: 'Design', description: 'Online whiteboard' },

  // Productivity
  { title: 'Google Calendar', url: 'https://calendar.google.com', icon: 'https://www.google.com/s2/favicons?domain=calendar.google.com&sz=128', color: '#4285F4', group: 'Productivity', description: 'Calendar & scheduling' },
  { title: 'Google Drive', url: 'https://drive.google.com', icon: 'https://drive.google.com/favicon.ico', color: '#0F9D58', group: 'Productivity', description: 'Cloud storage' },
  { title: 'Todoist', url: 'https://todoist.com', icon: 'https://todoist.com/favicon.ico', color: '#E44332', group: 'Productivity', description: 'Task management' },
  { title: 'Trello', url: 'https://trello.com', icon: 'https://trello.com/favicon.ico', color: '#0079BF', group: 'Productivity', description: 'Kanban boards' },
  { title: 'Notion', url: 'https://notion.so', icon: 'https://www.google.com/s2/favicons?domain=notion.so&sz=128', color: '#000000', group: 'Productivity', description: 'All-in-one workspace' },
  { title: 'Slack', url: 'https://slack.com', icon: 'https://slack.com/favicon.ico', color: '#4A154B', group: 'Productivity', description: 'Team communication' },

  // Development
  { title: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'https://stackoverflow.com/favicon.ico', color: '#F48024', group: 'Development', description: 'Q&A for developers' },
  { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: 'https://developer.mozilla.org/favicon.ico', color: '#000000', group: 'Development', description: 'Web documentation' },
  { title: 'NPM', url: 'https://npmjs.com', icon: 'https://www.google.com/s2/favicons?domain=npmjs.com&sz=128', color: '#CB3837', group: 'Development', description: 'Node.js packages' },
  { title: 'Vercel', url: 'https://vercel.com', icon: 'https://vercel.com/favicon.ico', color: '#000000', group: 'Development', description: 'Hosting & deployment' },
  { title: 'CodePen', url: 'https://codepen.io', icon: 'https://codepen.io/favicon.ico', color: '#000000', group: 'Development', description: 'Front-end playground' },
  { title: 'LeetCode', url: 'https://leetcode.com', icon: 'https://leetcode.com/favicon.ico', color: '#FFA116', group: 'Development', description: 'Coding challenges' },

  // News & Reading
  { title: 'Hacker News', url: 'https://news.ycombinator.com', icon: 'https://news.ycombinator.com/favicon.ico', color: '#FF6600', group: 'News', description: 'Tech news' },
  { title: 'Product Hunt', url: 'https://producthunt.com', icon: 'https://www.producthunt.com/favicon.ico', color: '#DA552F', group: 'News', description: 'New products daily' },
  { title: 'Medium', url: 'https://medium.com', icon: 'https://www.google.com/s2/favicons?domain=medium.com&sz=128', color: '#000000', group: 'News', description: 'Articles & blogs' },
  { title: 'Dev.to', url: 'https://dev.to', icon: 'https://dev.to/favicon.ico', color: '#0A0A23', group: 'News', description: 'Developer community' },

  // Entertainment
  { title: 'Netflix', url: 'https://netflix.com', icon: 'https://www.netflix.com/favicon.ico', color: '#E50914', group: 'Entertainment', description: 'Streaming service' },
  { title: 'Spotify', url: 'https://open.spotify.com', icon: 'https://open.spotify.com/favicon.ico', color: '#1DB954', group: 'Entertainment', description: 'Music streaming' },
  { title: 'Twitch', url: 'https://twitch.tv', icon: 'https://www.twitch.tv/favicon.ico', color: '#9146FF', group: 'Entertainment', description: 'Live streaming' },
  { title: 'Steam', url: 'https://store.steampowered.com', icon: 'https://store.steampowered.com/favicon.ico', color: '#1B2838', group: 'Entertainment', description: 'PC gaming' },
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

// ── Notes & Recent localStorage helpers ──────────────────

const NOTES_KEY = 'linkDashboard_notes';
const RECENT_KEY = 'linkDashboard_recent';

async function readNotes() {
  try {
    return localStorage.getItem(NOTES_KEY) || '';
  } catch {
    return '';
  }
}

async function writeNotes(text) {
  try {
    localStorage.setItem(NOTES_KEY, String(text ?? ''));
  } catch (err) {
    console.error('Failed to write notes', err);
  }
}

async function readRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

async function writeRecent(recent) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent || []));
  } catch (err) {
    console.error('Failed to write recent', err);
  }
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

export {
  DEFAULT_SETTINGS,
  DEFAULT_SHORTCUTS,
  STORE_CATALOG,
  createId,
  readNotes,
  writeNotes,
  readRecent,
  writeRecent,
};
