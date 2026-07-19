/**
 * Free background photo search (Openverse / Creative Commons) and store recommendations.
 */

/** Free / freemium photo sites users can browse for wallpapers. */
export const FREE_IMAGE_STORES = [
  {
    name: 'Openverse',
    url: 'https://openverse.org/image/',
    note: 'Search Creative Commons & public domain photos (built into this app)',
  },
  {
    name: 'Unsplash',
    url: 'https://unsplash.com/',
    note: 'High-quality free photos — download, then Upload photo',
  },
  {
    name: 'Pexels',
    url: 'https://www.pexels.com/',
    note: 'Free stock photos & videos — download, then Upload',
  },
  {
    name: 'Pixabay',
    url: 'https://pixabay.com/',
    note: 'Free images under Pixabay license — download, then Upload',
  },
  {
    name: 'Wikimedia Commons',
    url: 'https://commons.wikimedia.org/',
    note: 'Public domain & free-licensed media',
  },
  {
    name: 'NASA Image Library',
    url: 'https://images.nasa.gov/',
    note: 'Space & earth photos (public domain)',
  },
  {
    name: 'Lorem Picsum',
    url: 'https://picsum.photos/',
    note: 'Random placeholder photos via Image URL (e.g. https://picsum.photos/1920/1080)',
  },
];

export const BG_SEARCH_SUGGESTIONS = [
  'nature',
  'mountain',
  'ocean',
  'city night',
  'forest',
  'space',
  'abstract',
  'desert',
  'sunset',
  'minimal',
  'dark',
  'galaxy',
];

const OPENVERSE_IMAGES = 'https://api.openverse.org/v1/images/';

/**
 * Search free Creative Commons images via Openverse (no API key).
 * @param {string} query
 * @param {{ pageSize?: number, page?: number }} [options]
 * @returns {Promise<{ images: Array<object>, resultCount: number, pageCount: number }>}
 */
export async function searchBackgroundImages(query, options = {}) {
  const pageSize = options.pageSize ?? 24;
  const page = options.page ?? 1;
  const q = String(query || '').trim();
  if (!q) {
    return { images: [], resultCount: 0, pageCount: 0 };
  }

  const url = new URL(OPENVERSE_IMAGES);
  url.searchParams.set('q', q);
  url.searchParams.set('page', String(page));
  url.searchParams.set('page_size', String(pageSize));
  // Prefer images that are good wallpaper candidates
  url.searchParams.set('aspect_ratio', 'wide,tall');
  url.searchParams.set('size', 'large,medium');

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      // Openverse asks clients to identify themselves
      'User-Agent': 'LinkDashboard/1.3 (Chrome extension; local development)',
    },
  });

  if (!response.ok) {
    throw new Error(`Image search failed (${response.status})`);
  }

  const data = await response.json();
  const images = (data.results || [])
    .map((item) => normalizeOpenverseResult(item))
    .filter((item) => item.url);

  return {
    images,
    resultCount: Number(data.result_count) || images.length,
    pageCount: Number(data.page_count) || 1,
  };
}

function normalizeOpenverseResult(item) {
  const license = [item.license, item.license_version].filter(Boolean).join(' ').trim();
  return {
    id: String(item.id || ''),
    title: String(item.title || 'Untitled').trim() || 'Untitled',
    url: String(item.url || '').trim(),
    thumbnail: String(item.thumbnail || item.url || '').trim(),
    creator: String(item.creator || 'Unknown').trim() || 'Unknown',
    license,
    landingUrl: String(item.foreign_landing_url || item.detail_url || '').trim(),
    source: 'openverse',
  };
}

/**
 * Build a short attribution line for UI (CC images should credit creators when possible).
 * @param {{ creator?: string, license?: string, title?: string }} image
 */
export function formatImageAttribution(image) {
  const parts = [];
  if (image?.title) parts.push(image.title);
  if (image?.creator) parts.push(`by ${image.creator}`);
  if (image?.license) parts.push(`(${image.license})`);
  return parts.join(' · ') || 'Free image via Openverse';
}
