/**
 * blog-config.js
 * Central configuration for Supabase blog integration.
 * Change WEBSITE_ID to 'flameoff' or 'sparkshield' per deployment.
 */

const BLOG_CONFIG = {
  // ── Supabase credentials ──
  SUPABASE_URL: 'https://uwhjfpmsjerdhljsvmiy.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3aGpmcG1zamVyZGhsanN2bWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNzM0MDEsImV4cCI6MjA5MTY0OTQwMX0.WcJtZHoG5fe3gic6GP948Pyi_r3NOW98Z7nQvar-b0o',

  // ── Which site's blogs to show ──
  // Set to 'flameoff' for the Flame Off website
  // Set to 'sparkshield' for the SparkShield website
  WEBSITE_ID: 'flameoff',

  // ── Pagination ──
  BLOG_LIST_LIMIT: 10,     // blogs per page on blog.html
  HOME_PREVIEW_LIMIT: 3,   // blogs shown on homepage

  // ── Supabase Storage bucket name ──
  STORAGE_BUCKET: 'blog-images',
};

// Supabase REST API helpers
const SUPABASE_HEADERS = {
  'apikey': BLOG_CONFIG.SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${BLOG_CONFIG.SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

/**
 * Fetch blogs from Supabase
 * @param {Object} options
 * @param {number} options.limit
 * @param {number} options.offset
 * @param {string} options.slug - fetch single blog by slug
 * @returns {Promise<Array>}
 */
async function fetchBlogs({ limit = BLOG_CONFIG.BLOG_LIST_LIMIT, offset = 0, slug = null } = {}) {
let url = `${BLOG_CONFIG.SUPABASE_URL}/rest/v1/blogs?website=eq.${BLOG_CONFIG.WEBSITE_ID}&status=eq.published&select=*&order=created_at.desc`;

  if (slug) {
    url = `${BLOG_CONFIG.SUPABASE_URL}/rest/v1/blogs?website=eq.${BLOG_CONFIG.WEBSITE_ID}&slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=*`;
  } else {
    url += `&limit=${limit}&offset=${offset}`;
  }

  const res = await fetch(url, { headers: SUPABASE_HEADERS });
  if (!res.ok) throw new Error(`Supabase error: ${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * Get full public URL for a Supabase Storage image
 * @param {string} path - storage path or full URL
 * @returns {string}
 */
function getBlogImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BLOG_CONFIG.SUPABASE_URL}/storage/v1/object/public/${BLOG_CONFIG.STORAGE_BUCKET}/${path}`;
}

/**
 * Format a date string nicely
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

/**
 * Estimate reading time from HTML content
 * @param {string} html
 * @returns {string}
 */
function readingTime(html) {
  const text = html ? html.replace(/<[^>]+>/g, '') : '';
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}
