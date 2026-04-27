/**
 * blog-ui.js
 * Reusable blog card builder and UI helpers.
 * Keeps design consistent with FlameOff / SparkShield branding.
 */

/**
 * Build a single blog card HTML string
 * @param {Object} blog - blog row from Supabase
 * @param {boolean} featured - larger card style for featured slot
 * @returns {string} HTML
 */
function buildBlogCard(blog, featured = false) {
  const imageUrl = getBlogImageUrl(blog.featured_image);
  const hasImage = !!imageUrl;
  const date = formatDate(blog.created_at);
  const timeToRead = readingTime(blog.content);
  const excerpt = blog.meta_description
    ? (blog.meta_description.length > 130 ? blog.meta_description.slice(0, 130) + '…' : blog.meta_description)
    : '';

  return `
    <article class="blog-card${featured ? ' blog-card--featured' : ''} reveal" role="article">
      <a href="blog-details/${blog.slug}" class="blog-card__img-wrap" aria-label="Read ${blog.title}">
        ${hasImage
          ? `<img src="${imageUrl}" alt="${blog.title}" class="blog-card__img" loading="lazy" width="800" height="450">`
          : `<div class="blog-card__img-placeholder" aria-hidden="true">
               <svg viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="60" height="40">
                 <path d="M5 35 L20 15 L30 25 L42 10 L55 35Z" fill="rgba(255,60,0,0.18)"/>
                 <circle cx="15" cy="12" r="5" fill="rgba(255,60,0,0.12)"/>
               </svg>
             </div>`}
        <span class="blog-card__category">${blog.category || 'Fire Safety'}</span>
      </a>
      <div class="blog-card__body">
        <div class="blog-card__meta">
          <span class="blog-card__date">${date}</span>
          <span class="blog-card__sep" aria-hidden="true">·</span>
          <span class="blog-card__time">${timeToRead}</span>
        </div>
        <h2 class="blog-card__title">
          <a href="blog-details/${blog.slug}">${blog.title}</a>
        </h2>
        ${excerpt ? `<p class="blog-card__excerpt">${excerpt}</p>` : ''}
        <a href="blog-details/${blog.slug}" class="blog-card__read-more" aria-label="Read full article: ${blog.title}">
          Read Article
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </article>
  `;
}

/**
 * Render a loading skeleton grid
 * @param {number} count
 * @returns {string} HTML
 */
function buildBlogSkeletons(count = 6) {
  return Array.from({ length: count }, () => `
    <div class="blog-card blog-card--skeleton" aria-hidden="true">
      <div class="blog-card__img-wrap skel-img"></div>
      <div class="blog-card__body">
        <div class="skel-line skel-line--sm"></div>
        <div class="skel-line"></div>
        <div class="skel-line skel-line--md"></div>
        <div class="skel-line skel-line--sm"></div>
      </div>
    </div>
  `).join('');
}

/**
 * Render empty state
 * @param {string} message
 * @returns {string} HTML
 */
function buildEmptyState(message = 'No articles found yet. Check back soon!') {
  return `
    <div class="blog-empty-state" role="status">
      <div class="blog-empty-icon" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
          <rect x="8" y="16" width="48" height="36" rx="4" stroke="currentColor" stroke-width="1.5"/>
          <path d="M16 28h32M16 36h20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Render error state
 * @param {string} message
 * @returns {string} HTML
 */
function buildErrorState(message = 'Failed to load articles. Please try again later.') {
  return `
    <div class="blog-error-state" role="alert">
      <div class="blog-error-icon" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
          <circle cx="32" cy="32" r="24" stroke="var(--r)" stroke-width="1.5"/>
          <path d="M32 20v16M32 44v2" stroke="var(--r)" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <p>${message}</p>
      <button class="btn-retry" onclick="location.reload()">Try Again</button>
    </div>
  `;
}

/**
 * Set page meta tags dynamically
 * @param {string} title
 * @param {string} description
 */
function setPageMeta(title, description) {
  if (title) {
    document.title = title;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
  }
  if (description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);
  }
}

/**
 * Trigger scroll-reveal re-scan after dynamic content loads
 */
function triggerReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) setTimeout(() => e.target.classList.add('in'), i * 80);
    });
  }, { threshold: 0.06 });
  document.querySelectorAll('.reveal:not(.in)').forEach(el => obs.observe(el));
}