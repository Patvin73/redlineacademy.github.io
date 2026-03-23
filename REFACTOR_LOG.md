# Repository Refactor Log

Date: 2026-03-23

## Objective
Refactor the codebase to be more SEO-friendly, scalable, and maintainable while preserving backward compatibility.

## Before vs After Summary

### Before
- Structure mainly centered on:
  - `css/`
  - `js/`
  - `pages/`
  - ad-hoc SEO logic embedded in page generators.
- SEO page rendering duplicated layout/meta/schema logic directly inside generator template code.
- No centralized SEO config layer for metadata and canonical strategy.
- No reusable component folder for shared header/footer layout.
- Validation was manual/non-standardized for heading/meta/link consistency.

### After
- Introduced architecture layers:
  - `components/` reusable header/footer/layout templates
  - `styles/` canonical stylesheet location
  - `scripts/` canonical JavaScript location + utilities
  - `seo/` centralized metadata/canonical/schema configuration logic
  - `pages/` output pages (unchanged path for compatibility)
- SEO generation now uses:
  - centralized meta config (`seo/meta.config.js`)
  - centralized canonical logic (`seo/canonical.js`)
  - centralized schema templates (`seo/schema.config.js`)
  - reusable layout templates (`components/page-layout.html`)
- Internal linking helper extracted into reusable module:
  - `scripts/internal-links.js`
- Added automated SEO validation:
  - `scripts/validate-seo-structure.js`
- Added npm scripts:
  - `seo:generate`
  - `seo:validate`
  - `seo:build`

## Folder Structure Migration

Refactor target structure implemented:

- `/pages` (HTML pages)
- `/components` (reusable UI parts)
- `/assets` (existing images/fonts preserved)
- `/styles` (new canonical CSS location)
- `/scripts` (new canonical JS location)
- `/seo` (metadata/schema/canonical config)

## Backward Compatibility Strategy

To avoid breaking existing pages:

1. Existing `css/*.css` paths are preserved using wrapper imports.
- Example: `css/style.css` now imports `../styles/style.css`.

2. Existing `js/*.js` files remain intact.
- New architecture also provides `scripts/` for refactored/new pages.

3. Existing `pages/*.html` URLs remain unchanged.
- New SEO-generated pages still output into `/pages/{slug}.html`.

## Performance & Maintainability Improvements

1. Reduced template duplication
- Header/footer/layout now shared via component templates.

2. Better loading strategy in generated pages
- Shared scripts loaded with `defer`.
- Image loading uses lazy loading where relevant in generated templates.

3. Cleaner SEO scaling
- Metadata, canonical URLs, and JSON-LD schema are centrally managed.
- Easier to support large keyword sets without duplicating markup logic.

## Validation Results

Automated checks are available and passing:

- `node scripts/validate-seo-structure.js`
  - validates:
    - exactly one `h1` per page
    - no duplicate meta description
    - no duplicate canonical tag
    - heading-depth jump detection
    - local broken-link detection

Latest result:
- SEO structure validation passed on all scanned HTML files.

## Files Added / Updated (Refactor Core)

### Added
- `components/site-header.html`
- `components/site-footer.html`
- `components/page-layout.html`
- `styles/main.css`
- `scripts/internal-links.js`
- `scripts/main.js`
- `scripts/validate-seo-structure.js`
- `seo/site.config.json`
- `seo/meta.config.js`
- `seo/canonical.js`
- `seo/schema.config.js`

### Updated
- `tools/generate-seo-pages.js`
- `tools/seo/lib/template.js`
- `package.json`
- `css/style.css`
- `css/lms.css`
- `css/lms-admin.css`
- `css/lms-marketer.css`
- `css/lms-student.css`

## Notes

- Existing repository files unrelated to refactor were not force-reverted.
- Live test suites that require external credentials remain outside this refactor scope.
