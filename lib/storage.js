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
  groupOrder: ['Popular', 'Social', 'Entertainment', 'Shopping'],
  groupDisplay: 'grid',
  showBookmarks: false,
  showNotes: false,
  showRecent: true,
  showDescription: true,
  recentCount: 8,
  theme: 'auto',
  showFavorites: true,
};

/**
 * Recommended starter links — most popular websites, shown on first run
 * and when the user resets the dashboard to defaults.
 */
const DEFAULT_SHORTCUTS = [
  // Popular
  {
    id: 'default-google',
    title: 'Google',
    url: 'https://www.google.com',
    icon: 'https://www.google.com/s2/favicons?domain=google.com&sz=128',
    color: '#4285F4',
    openIn: 'new-tab',
    group: 'Popular',
    order: 0,
    description: 'Search engine',
    showDescription: true,
  },
  {
    id: 'default-youtube',
    title: 'YouTube',
    url: 'https://www.youtube.com',
    icon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
    color: '#FF0000',
    openIn: 'new-tab',
    group: 'Popular',
    order: 1,
    description: 'Video platform',
    showDescription: true,
  },
  {
    id: 'default-gmail',
    title: 'Gmail',
    url: 'https://mail.google.com',
    icon: 'https://www.google.com/s2/favicons?domain=mail.google.com&sz=128',
    color: '#EA4335',
    openIn: 'new-tab',
    group: 'Popular',
    order: 2,
    description: 'Email by Google',
    showDescription: true,
  },
  {
    id: 'default-google-maps',
    title: 'Google Maps',
    url: 'https://maps.google.com',
    icon: 'https://www.google.com/s2/favicons?domain=maps.google.com&sz=128',
    color: '#34A853',
    openIn: 'new-tab',
    group: 'Popular',
    order: 3,
    description: 'Maps & navigation',
    showDescription: true,
  },
  {
    id: 'default-chatgpt',
    title: 'ChatGPT',
    url: 'https://chat.openai.com',
    icon: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
    color: '#10A37F',
    openIn: 'new-tab',
    group: 'Popular',
    order: 4,
    description: 'AI assistant',
    showDescription: true,
  },
  {
    id: 'default-wikipedia',
    title: 'Wikipedia',
    url: 'https://www.wikipedia.org',
    icon: 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=128',
    color: '#000000',
    openIn: 'new-tab',
    group: 'Popular',
    order: 5,
    description: 'Free encyclopedia',
    showDescription: true,
  },
  {
    id: 'default-github',
    title: 'GitHub',
    url: 'https://github.com',
    icon: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
    color: '#24292f',
    openIn: 'new-tab',
    group: 'Popular',
    order: 6,
    description: 'Code repositories',
    showDescription: true,
  },

  // Social
  {
    id: 'default-facebook',
    title: 'Facebook',
    url: 'https://www.facebook.com',
    icon: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=128',
    color: '#1877F2',
    openIn: 'new-tab',
    group: 'Social',
    order: 0,
    description: 'Social networking',
    showDescription: true,
  },
  {
    id: 'default-instagram',
    title: 'Instagram',
    url: 'https://www.instagram.com',
    icon: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=128',
    color: '#E4405F',
    openIn: 'new-tab',
    group: 'Social',
    order: 1,
    description: 'Photo sharing',
    showDescription: true,
  },
  {
    id: 'default-x',
    title: 'X (Twitter)',
    url: 'https://x.com',
    icon: 'https://www.google.com/s2/favicons?domain=x.com&sz=128',
    color: '#000000',
    openIn: 'new-tab',
    group: 'Social',
    order: 2,
    description: 'Social networking',
    showDescription: true,
  },
  {
    id: 'default-tiktok',
    title: 'TikTok',
    url: 'https://www.tiktok.com',
    icon: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=128',
    color: '#000000',
    openIn: 'new-tab',
    group: 'Social',
    order: 3,
    description: 'Short videos',
    showDescription: true,
  },
  {
    id: 'default-whatsapp',
    title: 'WhatsApp',
    url: 'https://web.whatsapp.com',
    icon: 'https://www.google.com/s2/favicons?domain=whatsapp.com&sz=128',
    color: '#25D366',
    openIn: 'new-tab',
    group: 'Social',
    order: 4,
    description: 'Messaging app',
    showDescription: true,
  },
  {
    id: 'default-reddit',
    title: 'Reddit',
    url: 'https://www.reddit.com',
    icon: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=128',
    color: '#FF4500',
    openIn: 'new-tab',
    group: 'Social',
    order: 5,
    description: 'News & communities',
    showDescription: true,
  },
  {
    id: 'default-linkedin',
    title: 'LinkedIn',
    url: 'https://www.linkedin.com',
    icon: 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=128',
    color: '#0A66C2',
    openIn: 'new-tab',
    group: 'Social',
    order: 6,
    description: 'Professional network',
    showDescription: true,
  },

  // Entertainment
  {
    id: 'default-netflix',
    title: 'Netflix',
    url: 'https://www.netflix.com',
    icon: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=128',
    color: '#E50914',
    openIn: 'new-tab',
    group: 'Entertainment',
    order: 0,
    description: 'Streaming service',
    showDescription: true,
  },
  {
    id: 'default-spotify',
    title: 'Spotify',
    url: 'https://open.spotify.com',
    icon: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=128',
    color: '#1DB954',
    openIn: 'new-tab',
    group: 'Entertainment',
    order: 1,
    description: 'Music streaming',
    showDescription: true,
  },

  // Shopping
  {
    id: 'default-amazon',
    title: 'Amazon',
    url: 'https://www.amazon.com',
    icon: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=128',
    color: '#FF9900',
    openIn: 'new-tab',
    group: 'Shopping',
    order: 0,
    description: 'Online marketplace',
    showDescription: true,
  },
];

/** Curated catalog of links users can add from the Store. */
const STORE_CATALOG = [
  // AI & Productivity
  { title: 'ChatGPT', url: 'https://chat.openai.com', icon: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128', color: '#10A37F', group: 'AI & Productivity', description: 'AI assistant by OpenAI' },
  { title: 'Claude', url: 'https://claude.ai', icon: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=128', color: '#D4A574', group: 'AI & Productivity', description: 'AI assistant by Anthropic' },
  { title: 'Google Gemini', url: 'https://gemini.google.com', icon: 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=128', color: '#1A73E8', group: 'AI & Productivity', description: 'AI by Google' },
  { title: 'Microsoft Copilot', url: 'https://copilot.microsoft.com', icon: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128', color: '#7B68EE', group: 'AI & Productivity', description: 'AI by Microsoft' },
  { title: 'Perplexity AI', url: 'https://perplexity.ai', icon: 'https://www.google.com/s2/favicons?domain=perplexity.ai&sz=128', color: '#20B2AA', group: 'AI & Productivity', description: 'AI-powered search' },
  { title: 'Notion', url: 'https://notion.so', icon: 'https://www.google.com/s2/favicons?domain=notion.so&sz=128', color: '#000000', group: 'AI & Productivity', description: 'All-in-one workspace' },
  { title: 'Trello', url: 'https://trello.com', icon: 'https://www.google.com/s2/favicons?domain=trello.com&sz=128', color: '#0079BF', group: 'AI & Productivity', description: 'Kanban boards' },
  { title: 'Jira', url: 'https://atlassian.net', icon: 'https://www.google.com/s2/favicons?domain=atlassian.com&sz=128', color: '#0052CC', group: 'AI & Productivity', description: 'Project tracking' },
  { title: 'Asana', url: 'https://asana.com', icon: 'https://www.google.com/s2/favicons?domain=asana.com&sz=128', color: '#F06A6A', group: 'AI & Productivity', description: 'Task management' },
  { title: 'ClickUp', url: 'https://clickup.com', icon: 'https://www.google.com/s2/favicons?domain=clickup.com&sz=128', color: '#7B68EE', group: 'AI & Productivity', description: 'Project management' },
  { title: 'Monday.com', url: 'https://monday.com', icon: 'https://www.google.com/s2/favicons?domain=monday.com&sz=128', color: '#FF3D57', group: 'AI & Productivity', description: 'Work management' },

  // Email & Office
  { title: 'Gmail', url: 'https://mail.google.com', icon: 'https://www.google.com/s2/favicons?domain=mail.google.com&sz=128', color: '#EA4335', group: 'Email & Office', description: 'Email by Google' },
  { title: 'Outlook', url: 'https://outlook.live.com', icon: 'https://www.google.com/s2/favicons?domain=outlook.live.com&sz=128', color: '#0078D4', group: 'Email & Office', description: 'Email by Microsoft' },
  { title: 'Yahoo Mail', url: 'https://mail.yahoo.com', icon: 'https://www.google.com/s2/favicons?domain=mail.yahoo.com&sz=128', color: '#6001D2', group: 'Email & Office', description: 'Email by Yahoo' },
  { title: 'Proton Mail', url: 'https://mail.proton.me', icon: 'https://www.google.com/s2/favicons?domain=proton.me&sz=128', color: '#6D4AFF', group: 'Email & Office', description: 'Encrypted email' },
  { title: 'Google Drive', url: 'https://drive.google.com', icon: 'https://www.google.com/s2/favicons?domain=drive.google.com&sz=128', color: '#0F9D58', group: 'Email & Office', description: 'Cloud storage' },
  { title: 'Google Docs', url: 'https://docs.google.com', icon: 'https://www.google.com/s2/favicons?domain=docs.google.com&sz=128', color: '#4285F4', group: 'Email & Office', description: 'Documents' },
  { title: 'Google Sheets', url: 'https://sheets.google.com', icon: 'https://www.google.com/s2/favicons?domain=sheets.google.com&sz=128', color: '#0F9D58', group: 'Email & Office', description: 'Spreadsheets' },
  { title: 'Microsoft 365', url: 'https://microsoft365.com', icon: 'https://www.google.com/s2/favicons?domain=microsoft365.com&sz=128', color: '#D83B01', group: 'Email & Office', description: 'Office suite' },
  { title: 'Dropbox', url: 'https://dropbox.com', icon: 'https://www.google.com/s2/favicons?domain=dropbox.com&sz=128', color: '#0061FF', group: 'Email & Office', description: 'Cloud storage' },
  { title: 'OneDrive', url: 'https://onedrive.live.com', icon: 'https://www.google.com/s2/favicons?domain=onedrive.live.com&sz=128', color: '#0078D4', group: 'Email & Office', description: 'Cloud storage by Microsoft' },

  // Communication
  { title: 'Telegram', url: 'https://web.telegram.org', icon: 'https://www.google.com/s2/favicons?domain=telegram.org&sz=128', color: '#26A5E4', group: 'Communication', description: 'Messaging app' },
  { title: 'WhatsApp Web', url: 'https://web.whatsapp.com', icon: 'https://www.google.com/s2/favicons?domain=whatsapp.com&sz=128', color: '#25D366', group: 'Communication', description: 'Messaging app' },
  { title: 'Discord', url: 'https://discord.com', icon: 'https://www.google.com/s2/favicons?domain=discord.com&sz=128', color: '#5865F2', group: 'Communication', description: 'Voice & text chat' },
  { title: 'Slack', url: 'https://slack.com', icon: 'https://www.google.com/s2/favicons?domain=slack.com&sz=128', color: '#4A154B', group: 'Communication', description: 'Team communication' },
  { title: 'Microsoft Teams', url: 'https://teams.microsoft.com', icon: 'https://www.google.com/s2/favicons?domain=teams.microsoft.com&sz=128', color: '#6264A7', group: 'Communication', description: 'Team collaboration' },
  { title: 'Zoom', url: 'https://zoom.us', icon: 'https://www.google.com/s2/favicons?domain=zoom.us&sz=128', color: '#2D8CFF', group: 'Communication', description: 'Video conferencing' },
  { title: 'Google Meet', url: 'https://meet.google.com', icon: 'https://www.google.com/s2/favicons?domain=meet.google.com&sz=128', color: '#00897B', group: 'Communication', description: 'Video conferencing' },
  { title: 'Skype', url: 'https://web.skype.com', icon: 'https://www.google.com/s2/favicons?domain=skype.com&sz=128', color: '#00AFF0', group: 'Communication', description: 'Video & voice chat' },

  // Source Code
  { title: 'GitHub', url: 'https://github.com', icon: 'https://www.google.com/s2/favicons?domain=github.com&sz=128', color: '#24292f', group: 'Source Code', description: 'Code repositories' },
  { title: 'GitLab', url: 'https://gitlab.com', icon: 'https://www.google.com/s2/favicons?domain=gitlab.com&sz=128', color: '#FC6D26', group: 'Source Code', description: 'DevOps platform' },
  { title: 'Bitbucket', url: 'https://bitbucket.org', icon: 'https://www.google.com/s2/favicons?domain=bitbucket.org&sz=128', color: '#0052CC', group: 'Source Code', description: 'Code hosting' },
  { title: 'Azure DevOps', url: 'https://dev.azure.com', icon: 'https://www.google.com/s2/favicons?domain=azure.com&sz=128', color: '#0078D4', group: 'Source Code', description: 'DevOps by Microsoft' },

  // Developer Tools
  { title: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=128', color: '#F48024', group: 'Developer Tools', description: 'Q&A for developers' },
  { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: 'https://www.google.com/s2/favicons?domain=developer.mozilla.org&sz=128', color: '#000000', group: 'Developer Tools', description: 'Web documentation' },
  { title: 'npm', url: 'https://npmjs.com', icon: 'https://www.google.com/s2/favicons?domain=npmjs.com&sz=128', color: '#CB3837', group: 'Developer Tools', description: 'Node.js packages' },
  { title: 'Docker Hub', url: 'https://hub.docker.com', icon: 'https://www.google.com/s2/favicons?domain=docker.com&sz=128', color: '#2496ED', group: 'Developer Tools', description: 'Container registry' },
  { title: 'Kubernetes Docs', url: 'https://kubernetes.io', icon: 'https://www.google.com/s2/favicons?domain=kubernetes.io&sz=128', color: '#326CE5', group: 'Developer Tools', description: 'Container orchestration' },
  { title: 'Postman', url: 'https://postman.com', icon: 'https://www.google.com/s2/favicons?domain=postman.com&sz=128', color: '#FF6C37', group: 'Developer Tools', description: 'API testing' },
  { title: 'Swagger', url: 'https://swagger.io', icon: 'https://www.google.com/s2/favicons?domain=swagger.io&sz=128', color: '#85EA2D', group: 'Developer Tools', description: 'API documentation' },
  { title: 'Vercel', url: 'https://vercel.com', icon: 'https://www.google.com/s2/favicons?domain=vercel.com&sz=128', color: '#000000', group: 'Developer Tools', description: 'Hosting & deployment' },
  { title: 'Netlify', url: 'https://netlify.com', icon: 'https://www.google.com/s2/favicons?domain=netlify.com&sz=128', color: '#00C7B7', group: 'Developer Tools', description: 'Web hosting' },
  { title: 'Cloudflare Dashboard', url: 'https://dash.cloudflare.com', icon: 'https://www.google.com/s2/favicons?domain=cloudflare.com&sz=128', color: '#F38020', group: 'Developer Tools', description: 'CDN & security' },

  // Search
  { title: 'Google', url: 'https://google.com', icon: 'https://www.google.com/s2/favicons?domain=google.com&sz=128', color: '#4285F4', group: 'Search', description: 'Search engine' },
  { title: 'Bing', url: 'https://bing.com', icon: 'https://www.google.com/s2/favicons?domain=bing.com&sz=128', color: '#00809D', group: 'Search', description: 'Search engine' },
  { title: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: 'https://www.google.com/s2/favicons?domain=duckduckgo.com&sz=128', color: '#DE5833', group: 'Search', description: 'Privacy search engine' },
  { title: 'Yahoo Search', url: 'https://search.yahoo.com', icon: 'https://www.google.com/s2/favicons?domain= yahoo.com&sz=128', color: '#6001D2', group: 'Search', description: 'Search engine' },

  // Social Media
  { title: 'Facebook', url: 'https://facebook.com', icon: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=128', color: '#1877F2', group: 'Social Media', description: 'Social networking' },
  { title: 'Instagram', url: 'https://instagram.com', icon: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=128', color: '#E4405F', group: 'Social Media', description: 'Photo sharing' },
  { title: 'X (Twitter)', url: 'https://x.com', icon: 'https://www.google.com/s2/favicons?domain=x.com&sz=128', color: '#000000', group: 'Social Media', description: 'Social networking' },
  { title: 'Threads', url: 'https://threads.net', icon: 'https://www.google.com/s2/favicons?domain=threads.net&sz=128', color: '#000000', group: 'Social Media', description: 'Text-based social' },
  { title: 'TikTok', url: 'https://tiktok.com', icon: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=128', color: '#000000', group: 'Social Media', description: 'Short videos' },
  { title: 'LinkedIn', url: 'https://linkedin.com', icon: 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=128', color: '#0A66C2', group: 'Social Media', description: 'Professional network' },
  { title: 'Reddit', url: 'https://reddit.com', icon: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=128', color: '#FF4500', group: 'Social Media', description: 'News & communities' },
  { title: 'Pinterest', url: 'https://pinterest.com', icon: 'https://www.google.com/s2/favicons?domain=pinterest.com&sz=128', color: '#BD081C', group: 'Social Media', description: 'Image discovery' },

  // Video & Streaming
  { title: 'YouTube', url: 'https://youtube.com', icon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128', color: '#FF0000', group: 'Video & Streaming', description: 'Video platform' },
  { title: 'Netflix', url: 'https://netflix.com', icon: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=128', color: '#E50914', group: 'Video & Streaming', description: 'Streaming service' },
  { title: 'Disney+', url: 'https://disneyplus.com', icon: 'https://www.google.com/s2/favicons?domain=disneyplus.com&sz=128', color: '#113CCF', group: 'Video & Streaming', description: 'Streaming service' },
  { title: 'Prime Video', url: 'https://primevideo.com', icon: 'https://www.google.com/s2/favicons?domain=primevideo.com&sz=128', color: '#00A8E1', group: 'Video & Streaming', description: 'Streaming by Amazon' },
  { title: 'Twitch', url: 'https://twitch.tv', icon: 'https://www.google.com/s2/favicons?domain=twitch.tv&sz=128', color: '#9146FF', group: 'Video & Streaming', description: 'Live streaming' },
  { title: 'Spotify', url: 'https://open.spotify.com', icon: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=128', color: '#1DB954', group: 'Video & Streaming', description: 'Music streaming' },
  { title: 'Apple Music', url: 'https://music.apple.com', icon: 'https://www.google.com/s2/favicons?domain=music.apple.com&sz=128', color: '#FC3C44', group: 'Video & Streaming', description: 'Music streaming' },
  { title: 'SoundCloud', url: 'https://soundcloud.com', icon: 'https://www.google.com/s2/favicons?domain=soundcloud.com&sz=128', color: '#FF5500', group: 'Video & Streaming', description: 'Music platform' },

  // Shopping
  { title: 'Amazon', url: 'https://amazon.com', icon: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=128', color: '#FF9900', group: 'Shopping', description: 'Online marketplace' },
  { title: 'eBay', url: 'https://ebay.com', icon: 'https://www.google.com/s2/favicons?domain=ebay.com&sz=128', color: '#E53238', group: 'Shopping', description: 'Online auction' },
  { title: 'AliExpress', url: 'https://aliexpress.com', icon: 'https://www.google.com/s2/favicons?domain=aliexpress.com&sz=128', color: '#E43225', group: 'Shopping', description: 'Online marketplace' },
  { title: 'Temu', url: 'https://temu.com', icon: 'https://www.google.com/s2/favicons?domain=temu.com&sz=128', color: '#FB7701', group: 'Shopping', description: 'Online marketplace' },
  { title: 'Etsy', url: 'https://etsy.com', icon: 'https://www.google.com/s2/favicons?domain=etsy.com&sz=128', color: '#F1641E', group: 'Shopping', description: 'Handmade & vintage' },
  { title: 'Walmart', url: 'https://walmart.com', icon: 'https://www.google.com/s2/favicons?domain=walmart.com&sz=128', color: '#0071DC', group: 'Shopping', description: 'Retail marketplace' },

  // Finance
  { title: 'PayPal', url: 'https://paypal.com', icon: 'https://www.google.com/s2/favicons?domain=paypal.com&sz=128', color: '#003087', group: 'Finance', description: 'Online payments' },
  { title: 'Wise', url: 'https://wise.com', icon: 'https://www.google.com/s2/favicons?domain=wise.com&sz=128', color: '#9FE870', group: 'Finance', description: 'International transfers' },
  { title: 'Stripe Dashboard', url: 'https://dashboard.stripe.com', icon: 'https://www.google.com/s2/favicons?domain=stripe.com&sz=128', color: '#635BFF', group: 'Finance', description: 'Payment processing' },
  { title: 'Binance', url: 'https://binance.com', icon: 'https://www.google.com/s2/favicons?domain=binance.com&sz=128', color: '#F0B90B', group: 'Finance', description: 'Crypto exchange' },
  { title: 'Coinbase', url: 'https://coinbase.com', icon: 'https://www.google.com/s2/favicons?domain=coinbase.com&sz=128', color: '#0052FF', group: 'Finance', description: 'Crypto exchange' },
  { title: 'TradingView', url: 'https://tradingview.com', icon: 'https://www.google.com/s2/favicons?domain=tradingview.com&sz=128', color: '#2962FF', group: 'Finance', description: 'Financial charts' },

  // News
  { title: 'BBC', url: 'https://bbc.com', icon: 'https://www.google.com/s2/favicons?domain=bbc.com&sz=128', color: '#BB1919', group: 'News', description: 'World news' },
  { title: 'CNN', url: 'https://cnn.com', icon: 'https://www.google.com/s2/favicons?domain=cnn.com&sz=128', color: '#CC0000', group: 'News', description: 'News network' },
  { title: 'Reuters', url: 'https://reuters.com', icon: 'https://www.google.com/s2/favicons?domain=reuters.com&sz=128', color: '#FF8000', group: 'News', description: 'News agency' },
  { title: 'Bloomberg', url: 'https://bloomberg.com', icon: 'https://www.google.com/s2/favicons?domain=bloomberg.com&sz=128', color: '#000000', group: 'News', description: 'Financial news' },
  { title: 'The Verge', url: 'https://theverge.com', icon: 'https://www.google.com/s2/favicons?domain=theverge.com&sz=128', color: '#000000', group: 'News', description: 'Tech news' },
  { title: 'TechCrunch', url: 'https://techcrunch.com', icon: 'https://www.google.com/s2/favicons?domain=techcrunch.com&sz=128', color: '#00A562', group: 'News', description: 'Tech news' },
  { title: 'Hacker News', url: 'https://news.ycombinator.com', icon: 'https://www.google.com/s2/favicons?domain=ycombinator.com&sz=128', color: '#FF6600', group: 'News', description: 'Tech news' },
  { title: 'Product Hunt', url: 'https://producthunt.com', icon: 'https://www.google.com/s2/favicons?domain=producthunt.com&sz=128', color: '#DA552F', group: 'News', description: 'New products daily' },

  // Maps & Travel
  { title: 'Google Maps', url: 'https://maps.google.com', icon: 'https://www.google.com/s2/favicons?domain=maps.google.com&sz=128', color: '#4285F4', group: 'Maps & Travel', description: 'Maps & navigation' },
  { title: 'Waze', url: 'https://waze.com', icon: 'https://www.google.com/s2/favicons?domain=waze.com&sz=128', color: '#33CCFF', group: 'Maps & Travel', description: 'GPS navigation' },
  { title: 'Booking.com', url: 'https://booking.com', icon: 'https://www.google.com/s2/favicons?domain=booking.com&sz=128', color: '#003580', group: 'Maps & Travel', description: 'Hotel bookings' },
  { title: 'Airbnb', url: 'https://airbnb.com', icon: 'https://www.google.com/s2/favicons?domain=airbnb.com&sz=128', color: '#FF5A5F', group: 'Maps & Travel', description: 'Vacation rentals' },
  { title: 'Agoda', url: 'https://agoda.com', icon: 'https://www.google.com/s2/favicons?domain=agoda.com&sz=128', color: '#E42536', group: 'Maps & Travel', description: 'Hotel bookings' },
  { title: 'Expedia', url: 'https://expedia.com', icon: 'https://www.google.com/s2/favicons?domain=expedia.com&sz=128', color: '#FBCE00', group: 'Maps & Travel', description: 'Travel bookings' },

  // Learning
  { title: 'Coursera', url: 'https://coursera.org', icon: 'https://www.google.com/s2/favicons?domain=coursera.org&sz=128', color: '#0056D2', group: 'Learning', description: 'Online courses' },
  { title: 'Udemy', url: 'https://udemy.com', icon: 'https://www.google.com/s2/favicons?domain=udemy.com&sz=128', color: '#A435F0', group: 'Learning', description: 'Online courses' },
  { title: 'Khan Academy', url: 'https://khanacademy.org', icon: 'https://www.google.com/s2/favicons?domain=khanacademy.org&sz=128', color: '#14BF96', group: 'Learning', description: 'Free education' },
  { title: 'edX', url: 'https://edx.org', icon: 'https://www.google.com/s2/favicons?domain=edx.org&sz=128', color: '#02262B', group: 'Learning', description: 'Online courses' },
  { title: 'freeCodeCamp', url: 'https://freecodecamp.org', icon: 'https://www.google.com/s2/favicons?domain=freecodecamp.org&sz=128', color: '#0A0A23', group: 'Learning', description: 'Learn to code' },
  { title: 'W3Schools', url: 'https://w3schools.com', icon: 'https://www.google.com/s2/favicons?domain=w3schools.com&sz=128', color: '#04AA6D', group: 'Learning', description: 'Web tutorials' },

  // Design
  { title: 'Figma', url: 'https://figma.com', icon: 'https://www.google.com/s2/favicons?domain=figma.com&sz=128', color: '#A259FF', group: 'Design', description: 'UI design tool' },
  { title: 'Canva', url: 'https://canva.com', icon: 'https://www.google.com/s2/favicons?domain=canva.com&sz=128', color: '#00C4CC', group: 'Design', description: 'Graphic design' },
  { title: 'Adobe Express', url: 'https://express.adobe.com', icon: 'https://www.google.com/s2/favicons?domain=adobe.com&sz=128', color: '#FF0000', group: 'Design', description: 'Quick design tool' },
  { title: 'Dribbble', url: 'https://dribbble.com', icon: 'https://www.google.com/s2/favicons?domain=dribbble.com&sz=128', color: '#EA4C89', group: 'Design', description: 'Design inspiration' },
  { title: 'Behance', url: 'https://behance.net', icon: 'https://www.google.com/s2/favicons?domain=behance.net&sz=128', color: '#1769FF', group: 'Design', description: 'Creative portfolio' },
  { title: 'Unsplash', url: 'https://unsplash.com', icon: 'https://www.google.com/s2/favicons?domain=unsplash.com&sz=128', color: '#000000', group: 'Design', description: 'Free stock photos' },
  { title: 'Pexels', url: 'https://pexels.com', icon: 'https://www.google.com/s2/favicons?domain=pexels.com&sz=128', color: '#05A081', group: 'Design', description: 'Free stock photos' },

  // Password Managers
  { title: 'Bitwarden', url: 'https://bitwarden.com', icon: 'https://www.google.com/s2/favicons?domain=bitwarden.com&sz=128', color: '#175DDC', group: 'Password Managers', description: 'Password manager' },
  { title: '1Password', url: 'https://1password.com', icon: 'https://www.google.com/s2/favicons?domain=1password.com&sz=128', color: '#0572EC', group: 'Password Managers', description: 'Password manager' },
  { title: 'LastPass', url: 'https://lastpass.com', icon: 'https://www.google.com/s2/favicons?domain=lastpass.com&sz=128', color: '#D11C1C', group: 'Password Managers', description: 'Password manager' },
  { title: 'Dashlane', url: 'https://dashlane.com', icon: 'https://www.google.com/s2/favicons?domain=dashlane.com&sz=128', color: '#0078FF', group: 'Password Managers', description: 'Password manager' },

  // Cloud Platforms
  { title: 'AWS Console', url: 'https://aws.amazon.com/console', icon: 'https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=128', color: '#FF9900', group: 'Cloud Platforms', description: 'Amazon cloud' },
  { title: 'Google Cloud Console', url: 'https://console.cloud.google.com', icon: 'https://www.google.com/s2/favicons?domain=cloud.google.com&sz=128', color: '#4285F4', group: 'Cloud Platforms', description: 'Google cloud' },
  { title: 'Microsoft Azure Portal', url: 'https://portal.azure.com', icon: 'https://www.google.com/s2/favicons?domain=azure.com&sz=128', color: '#0078D4', group: 'Cloud Platforms', description: 'Microsoft cloud' },
  { title: 'DigitalOcean', url: 'https://digitalocean.com', icon: 'https://www.google.com/s2/favicons?domain=digitalocean.com&sz=128', color: '#0080FF', group: 'Cloud Platforms', description: 'Cloud hosting' },
  { title: 'Oracle Cloud', url: 'https://cloud.oracle.com', icon: 'https://www.google.com/s2/favicons?domain=oracle.com&sz=128', color: '#C74634', group: 'Cloud Platforms', description: 'Oracle cloud' },
  { title: 'Vultr', url: 'https://vultr.com', icon: 'https://www.google.com/s2/favicons?domain=vultr.com&sz=128', color: '#007BFC', group: 'Cloud Platforms', description: 'Cloud hosting' },
  { title: 'Linode', url: 'https://linode.com', icon: 'https://www.google.com/s2/favicons?domain=linode.com&sz=128', color: '#00B050', group: 'Cloud Platforms', description: 'Cloud hosting' },

  // DevOps
  { title: 'Grafana', url: 'https://grafana.com', icon: 'https://www.google.com/s2/favicons?domain=grafana.com&sz=128', color: '#F46800', group: 'DevOps', description: 'Monitoring dashboards' },
  { title: 'Prometheus', url: 'https://prometheus.io', icon: 'https://www.google.com/s2/favicons?domain=prometheus.io&sz=128', color: '#E6522C', group: 'DevOps', description: 'Metrics monitoring' },
  { title: 'Rancher', url: 'https://rancher.com', icon: 'https://www.google.com/s2/favicons?domain=rancher.com&sz=128', color: '#0075A8', group: 'DevOps', description: 'Kubernetes management' },
  { title: 'Portainer', url: 'https://portainer.io', icon: 'https://www.google.com/s2/favicons?domain=portainer.io&sz=128', color: '#13BEF9', group: 'DevOps', description: 'Container management' },
  { title: 'Jenkins', url: 'https://jenkins.io', icon: 'https://www.google.com/s2/favicons?domain=jenkins.io&sz=128', color: '#D33833', group: 'DevOps', description: 'CI/CD automation' },
  { title: 'Argo CD', url: 'https://argo-cd.readthedocs.io', icon: 'https://www.google.com/s2/favicons?domain=readthedocs.io&sz=128', color: '#EF7B4D', group: 'DevOps', description: 'GitOps for Kubernetes' },
  { title: 'Harbor', url: 'https://goharbor.io', icon: 'https://www.google.com/s2/favicons?domain=goharbor.io&sz=128', color: '#4495D7', group: 'DevOps', description: 'Container registry' },
  { title: 'SonarQube', url: 'https://sonarqube.org', icon: 'https://www.google.com/s2/favicons?domain=sonarqube.org&sz=128', color: '#4E9BCD', group: 'DevOps', description: 'Code quality' },

  // Entertainment
  { title: 'IMDb', url: 'https://imdb.com', icon: 'https://www.google.com/s2/favicons?domain=imdb.com&sz=128', color: '#F5C518', group: 'Entertainment', description: 'Movie database' },
  { title: 'Letterboxd', url: 'https://letterboxd.com', icon: 'https://www.google.com/s2/favicons?domain=letterboxd.com&sz=128', color: '#00D735', group: 'Entertainment', description: 'Movie social network' },
  { title: 'Steam', url: 'https://store.steampowered.com', icon: 'https://www.google.com/s2/favicons?domain=steampowered.com&sz=128', color: '#1B2838', group: 'Entertainment', description: 'PC gaming' },
  { title: 'Epic Games Store', url: 'https://store.epicgames.com', icon: 'https://www.google.com/s2/favicons?domain=epicgames.com&sz=128', color: '#0078F2', group: 'Entertainment', description: 'PC gaming' },
  { title: 'GOG', url: 'https://gog.com', icon: 'https://www.google.com/s2/favicons?domain=gog.com&sz=128', color: '#86328A', group: 'Entertainment', description: 'DRM-free gaming' },
  { title: 'Chess.com', url: 'https://chess.com', icon: 'https://www.google.com/s2/favicons?domain=chess.com&sz=128', color: '#7FA650', group: 'Entertainment', description: 'Online chess' },
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
