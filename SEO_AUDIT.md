# Technical SEO Audit - Redline Academy

Date: 2026-03-23
Scope: `index.html`, all `pages/*.html`, `test-lang.html`, `robots.txt`, `sitemap.xml`

## Issues Found

1. Semantic structure gaps
- Public pages had `header` + `footer` but no `main` landmark.
- Login page contained two `H1` elements.
- Several pages had heading-depth jumps (`H1 -> H3/H4`) in content sections.

2. Metadata quality and consistency
- Titles/descriptions were too generic for target keyword intent (`pelatihan caregiver indonesia`).
- Utility/private pages (dashboards/login/test/payment) lacked consistent canonical/description/noindex handling.
- Multiple pages had incomplete or inconsistent social metadata and encoding artifacts in text.

3. Indexing and crawl control
- `sitemap.xml` did not include all public indexable pages and had stale `lastmod`.
- `robots.txt` did not explicitly disallow non-public pages.
- Canonicalization existed on some pages but was inconsistent across all HTML endpoints.

4. Performance and media SEO
- All images were eager-loaded (no lazy loading).
- Image decoding hints were not present.

5. Structured data
- Structured data coverage was partial for key page intents.
- No explicit `Course` schema for the programs page.
- No explicit `FAQPage` schema for FAQ content.

6. Internal linking/details
- Blog CTA links used `href="#"` placeholders (non-discoverable for SEO crawl value).
- Some external links opened in new tabs without explicit `noopener noreferrer`.

## Fixes Applied

### 1) HTML & Structure
- Added semantic `main` landmark to all relevant pages:
  - `index.html`
  - `pages/about.html`
  - `pages/blog.html`
  - `pages/contact.html`
  - `pages/legal.html`
  - `pages/programs.html`
  - `pages/payment_success.html`
  - `pages/payment_failed.html`
- Enforced one `H1` per page (fixed `pages/login.html` by converting second panel heading to `H2`).
- Improved heading hierarchy:
  - `index.html`: hero pre-title changed from `H3` to paragraph (`.hero-eyebrow`).
  - `pages/about.html`: `Visi Kami` / `Misi Kami` upgraded to `H2`.
  - `pages/programs.html`: `H4/H5` content headings normalized to `H3`.
  - `pages/contact.html` and `pages/blog.html`: `H4` headings normalized to `H3` where needed.

### 2) Meta Tag Optimization
- Rewrote keyword-targeted SEO titles (<= 60 chars) and descriptions (<= 155 chars) for:
  - `index.html`
  - `pages/about.html`
  - `pages/programs.html`
  - `pages/contact.html`
  - `pages/blog.html`
  - `pages/legal.html`
- Standardized Open Graph and Twitter metadata on public pages.
- Standardized canonical tags on all audited pages.

### 3) Indexing & Crawling
- Regenerated `sitemap.xml` with updated `lastmod` (`2026-03-23`) and complete public URL set.
- Updated `robots.txt`:
  - Allow public crawl
  - Disallow non-public/utility pages (`login`, dashboards, payment result pages, `test-lang.html`)
  - Keep sitemap reference
- Applied `noindex, nofollow` + canonical + description to utility/private pages:
  - `pages/login.html`
  - `pages/dashboard-admin.html`
  - `pages/dashboard-marketer.html`
  - `pages/dashboard-student.html`
  - `pages/payment_success.html`
  - `pages/payment_failed.html`
  - `test-lang.html`

### 4) Performance (Core Web Vitals Support)
- Added `loading="lazy"` and `decoding="async"` to all images across audited HTML pages.
- Added `defer` to local JavaScript includes (`js/*`, `../js/*`) to reduce render-blocking.

### 5) Structured Data
- Added/expanded JSON-LD coverage:
  - `Organization` schema on public pages (except homepage which already had org graph).
  - `Course` schema on `pages/programs.html`.
  - `FAQPage` schema on `pages/contact.html` FAQ section.

### 6) Accessibility & SEO Details
- Verified no missing `alt` attributes across audited HTML pages.
- Verified local internal links resolve (no broken internal links found).
- Replaced blog placeholder `href="#"` CTA links to crawlable destination (`programs.html#enroll-form`).
- Added `rel="noopener noreferrer"` protection for `target="_blank"` links.

## Validation Results

1. Automated structural checks
- All pages now have exactly one `H1`.
- All pages now have canonical tags.
- Public pages have `index, follow`; utility pages have `noindex, nofollow`.
- All `img` tags now include lazy loading and async decoding.

2. Link validation
- Local link crawl check: `NO_BROKEN_LOCAL_LINKS`.

3. Tooling/tests
- `npm run lint`: passed with warnings only (no errors).
- `npm test` / regression Playwright run is blocked by missing required live QA environment variables:
  - `PLAYWRIGHT_LIVE_SUPABASE_URL`
  - `PLAYWRIGHT_LIVE_SUPABASE_ANON_KEY`
  - `PLAYWRIGHT_LIVE_STUDENT_EMAIL`
  - `PLAYWRIGHT_LIVE_STUDENT_PASSWORD`
  - `PLAYWRIGHT_LIVE_ADMIN_EMAIL`
  - `PLAYWRIGHT_LIVE_ADMIN_PASSWORD`
  - `PLAYWRIGHT_LIVE_TRAINER_EMAIL`
  - `PLAYWRIGHT_LIVE_TRAINER_PASSWORD`
  - `PLAYWRIGHT_LIVE_MARKETER_EMAIL`
  - `PLAYWRIGHT_LIVE_MARKETER_PASSWORD`

## Remaining Recommendations

1. WebP/AVIF conversion pipeline (high impact)
- Convert large images in `assets/images` (especially hero/program visuals) to WebP/AVIF and use responsive `picture/srcset`.
- Keep original formats as fallback.

2. Build-time minification (high impact)
- Add production build step to minify HTML/CSS/JS (and optionally inline critical CSS for above-the-fold).
- Current repo serves source-form assets directly.

3. CSS/JS unused-code reduction (medium-high impact)
- Run coverage audit (Chrome Coverage or Lighthouse + Puppeteer) and split or trim unused CSS/JS by page template.

4. CWV lab/field measurement (medium impact)
- Run Lighthouse + PageSpeed Insights on production URLs and tune LCP/CLS/INP based on real metrics.

5. Content strategy for target keyword (medium impact)
- Add dedicated long-form landing/supporting articles around "pelatihan caregiver indonesia", including FAQ clusters and internal links to `programs.html`.
