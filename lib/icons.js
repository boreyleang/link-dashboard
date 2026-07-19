/**
 * Icon helpers: free-store search (Iconify), upload resize, and recommendations.
 */

/** Free icon sources users can browse (open / free-for-personal-use). */
export const FREE_ICON_STORES = [
  {
    name: 'Iconify',
    url: 'https://icon-sets.iconify.design/',
    note: '200+ open icon sets (search built into this app)',
  },
  {
    name: 'Lucide',
    url: 'https://lucide.dev/icons/',
    note: 'Clean outline icons — also on Iconify as lucide:*',
  },
  {
    name: 'Heroicons',
    url: 'https://heroicons.com/',
    note: 'Tailwind team icons — heroicons:* on Iconify',
  },
  {
    name: 'Material Icons',
    url: 'https://fonts.google.com/icons',
    note: 'Google Material — mdi:* / material-symbols:* on Iconify',
  },
  {
    name: 'Tabler Icons',
    url: 'https://tabler.io/icons',
    note: 'Large free outline set — tabler:* on Iconify',
  },
  {
    name: 'Simple Icons',
    url: 'https://simpleicons.org/',
    note: 'Brand logos (GitHub, Slack, …) — simple-icons:* on Iconify',
  },
  {
    name: 'Phosphor',
    url: 'https://phosphoricons.com/',
    note: 'Flexible free family — ph:* on Iconify',
  },
  {
    name: 'SVG Repo',
    url: 'https://www.svgrepo.com/',
    note: 'Download free SVG / PNG, then upload here',
  },
];

export const ICON_SEARCH_SUGGESTIONS = [
  'github',
  'google',
  'mail',
  'youtube',
  'chat',
  'music',
  'cloud',
  'code',
  'shop',
  'game',
  'news',
  'home',
];

const ICONIFY_SEARCH = 'https://api.iconify.design/search';
const ICONIFY_SVG = 'https://api.iconify.design';

const MAX_ICON_UPLOAD_BYTES = 800 * 1024;
const MAX_ICON_EDGE = 256;
const MAX_BG_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_BG_EDGE = 1920;

/**
 * Search free icons via Iconify public API.
 * @param {string} query
 * @param {{ limit?: number }} [options]
 * @returns {Promise<{ icons: Array<{ id: string, prefix: string, name: string, svgUrl: string }>, total: number }>}
 */
export async function searchIcons(query, options = {}) {
  const limit = options.limit ?? 48;
  const q = String(query || '').trim();
  if (!q) {
    return { icons: [], total: 0 };
  }

  const url = new URL(ICONIFY_SEARCH);
  url.searchParams.set('query', q);
  url.searchParams.set('limit', String(limit));

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Icon search failed (${response.status})`);
  }

  const data = await response.json();
  const icons = (data.icons || []).map((id) => {
    const [prefix, name] = String(id).split(':');
    return {
      id,
      prefix,
      name,
      svgUrl: iconifySvgUrl(prefix, name),
    };
  });

  return {
    icons,
    total: Number(data.total) || icons.length,
  };
}

export function iconifySvgUrl(prefix, name, color = '%23ffffff') {
  return `${ICONIFY_SVG}/${prefix}/${name}.svg?height=128&color=${color}`;
}

/**
 * Parse iconify prefix/name from a stored remote Iconify URL.
 * @param {string} value
 * @returns {{ prefix: string, name: string } | null}
 */
export function parseIconifyUrl(value) {
  const text = String(value || '');
  const match = text.match(/api\.iconify\.design\/([^/]+)\/([^/?#]+?)(?:\.svg)?(?:[?#]|$)/i);
  if (!match) return null;
  return { prefix: match[1], name: match[2] };
}

/**
 * True when the value still points at the live Iconify CDN (not durable offline).
 * @param {string} value
 */
export function isRemoteIconifyUrl(value) {
  return Boolean(parseIconifyUrl(value));
}

/**
 * Encode SVG markup as a base64 data URL (self-contained, survives storage round-trips).
 * @param {string} svgText
 */
export function svgToBase64DataUrl(svgText) {
  const cleaned = String(svgText || '')
    .replace(/^\uFEFF/, '')
    .trim();
  if (!cleaned) {
    throw new Error('Empty SVG');
  }

  const base64 =
    typeof btoa === 'function'
      ? btoa(unescape(encodeURIComponent(cleaned)))
      : Buffer.from(cleaned, 'utf8').toString('base64');

  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Resolve a durable icon value for storage.
 * Returns an embedded base64 SVG data URL (self-contained, works in extension
 * pages without CSP issues from canvas/blob SVG rendering).
 * @param {string} iconId e.g. "mdi:github"
 * @returns {Promise<string>} data URL
 */
export async function resolveIconifyToDataUrl(iconId) {
  const [prefix, name] = String(iconId).split(':');
  if (!prefix || !name) {
    throw new Error('Invalid icon id');
  }

  const svgUrl = iconifySvgUrl(prefix, name, '%23ffffff');
  const response = await fetch(svgUrl);
  if (!response.ok) {
    throw new Error(`Icon download failed (${response.status})`);
  }

  const svgText = await response.text();
  if (!svgText || !svgText.includes('<svg')) {
    throw new Error('Icon download returned invalid SVG');
  }

  // Use base64 SVG data URL — reliable in extension <img> tags without canvas CSP issues.
  // Only fall back to PNG canvas if SVG encoding fails for some reason.
  try {
    return svgToBase64DataUrl(svgText);
  } catch {
    return svgTextToPngDataUrl(svgText, MAX_ICON_EDGE);
  }
}

/**
 * Rasterize SVG markup to a PNG data URL via canvas.
 * @param {string} svgText
 * @param {number} edge
 * @returns {Promise<string>}
 */
async function svgTextToPngDataUrl(svgText, edge) {
  if (typeof document === 'undefined') {
    throw new Error('Canvas unavailable');
  }

  const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = await loadImage(objectUrl);
    const size = Math.max(1, edge || MAX_ICON_EDGE);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(image, 0, 0, size, size);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Fetch any HTTP(S) image URL and return it as an embedded data URL.
 * This makes the icon durable — it will survive browser restarts without
 * needing a network request.
 * @param {string} url
 * @returns {Promise<string>} data URL
 */
export async function fetchUrlToDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Icon fetch failed (${response.status})`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(/** @type {string} */ (reader.result));
    reader.onerror = () => reject(new Error('Could not read icon data'));
    reader.readAsDataURL(blob);
  });
}

/**
 * If a shortcut still stores a legacy remote Iconify CDN URL, embed it as a
 * base64 SVG data URL so it survives browser restarts.
 * Plain HTTP(S) image URLs (favicons, etc.) are left as-is — they cannot be
 * fetched cross-origin and are handled by the browser's <img> tag directly.
 * @param {string} icon
 * @returns {Promise<string>}
 */
export async function ensureDurableIcon(icon) {
  const value = String(icon || '').trim();
  if (!value) return '';
  if (value.startsWith('data:')) return value;

  // Only convert legacy Iconify CDN URLs — everything else is left unchanged.
  const parsed = parseIconifyUrl(value);
  if (parsed) {
    return resolveIconifyToDataUrl(`${parsed.prefix}:${parsed.name}`);
  }

  return value;
}

/**
 * Read a user-selected image file and return a resized data URL (for tile icons).
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function fileToIconDataUrl(file) {
  return fileToImageDataUrl(file, {
    maxBytes: MAX_ICON_UPLOAD_BYTES,
    maxEdge: MAX_ICON_EDGE,
    mime: 'image/png',
    quality: undefined,
    sizeLabel: '800 KB',
  });
}

/**
 * Read a user photo/wallpaper and return a compressed data URL for the dashboard background.
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function fileToBackgroundDataUrl(file) {
  return fileToImageDataUrl(file, {
    maxBytes: MAX_BG_UPLOAD_BYTES,
    maxEdge: MAX_BG_EDGE,
    mime: 'image/jpeg',
    quality: 0.82,
    sizeLabel: '4 MB',
  });
}

/**
 * @param {File} file
 * @param {{ maxBytes: number, maxEdge: number, mime: string, quality?: number, sizeLabel: string }} options
 * @returns {Promise<string>}
 */
async function fileToImageDataUrl(file, options) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (PNG, JPG, SVG, WebP, …)');
  }
  if (file.size > options.maxBytes) {
    throw new Error(`Image is too large (max ${options.sizeLabel}). Try a smaller file.`);
  }

  // SVG: store as data URL without canvas (canvas can rasterize poorly)
  if (file.type === 'image/svg+xml') {
    const text = await file.text();
    const encoded = encodeURIComponent(text)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    return `data:image/svg+xml,${encoded}`;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const { width, height } = fitWithin(image.naturalWidth, image.naturalHeight, options.maxEdge);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
    if (options.quality !== undefined) {
      return canvas.toDataURL(options.mime, options.quality);
    }
    return canvas.toDataURL(options.mime);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read that image'));
    img.src = src;
  });
}

function fitWithin(width, height, maxEdge) {
  const longest = Math.max(width, height) || 1;
  if (longest <= maxEdge) {
    return { width: Math.max(1, width), height: Math.max(1, height) };
  }
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * Guess icon source mode from a stored icon value.
 * @param {string} icon
 * @returns {'auto' | 'url' | 'upload' | 'search'}
 */
export function detectIconMode(icon) {
  const value = String(icon || '').trim();
  if (!value) return 'auto';
  // Remote Iconify links (legacy) open in Search icons
  if (isRemoteIconifyUrl(value)) return 'search';
  // Embedded images from search or upload
  if (value.startsWith('data:')) return 'upload';
  if (value.startsWith('http://') || value.startsWith('https://')) return 'url';
  return 'url';
}
