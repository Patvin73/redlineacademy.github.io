# SEO Automation Pipeline

This repository now includes a modular, reusable SEO page generation pipeline for scaling keyword pages to 500+ URLs.

## What It Does

Input keyword records (`JSON` or `CSV`) are transformed into publish-ready HTML pages:

1. Parse and validate keyword inputs.
2. Generate SEO metadata:
- Title
- Meta description
- URL slug
3. Generate structured content:
- H1, H2, H3 hierarchy
- Body sections
- FAQ section
4. Automatically add internal links based on keyword similarity.
5. Inject JSON-LD schema:
- `Article`
- `Course`
- `FAQPage`
6. Output pages to `/pages/{slug}.html`
7. Optionally:
- merge generated URLs into `sitemap.xml`
- export WordPress-ready CSV (`output/seo-wordpress.csv`)

## File Layout

- `tools/generate-seo-pages.js` CLI entrypoint
- `tools/seo/lib/io.js` input parsing/validation
- `tools/seo/lib/text.js` slug/similarity/text utils
- `tools/seo/lib/generator.js` SEO model/content generation
- `tools/seo/lib/template.js` reusable HTML template renderer
- `tools/seo/lib/sitemap.js` sitemap merge utility
- `tools/seo/lib/cms.js` optional CMS export utility
- `components/page-layout.html` reusable layout shell
- `components/site-header.html` reusable header
- `components/site-footer.html` reusable footer
- `seo/meta.config.js` centralized metadata config
- `seo/canonical.js` centralized canonical URL logic
- `seo/schema.config.js` centralized schema templates
- `scripts/internal-links.js` reusable internal linking helper
- `scripts/validate-seo-structure.js` SEO structure validator
- `data/seo-keywords.sample.json` sample JSON input
- `data/seo-keywords.sample.csv` sample CSV input

## Input Format

Required fields per row:
- `keyword`
- `search intent` (`search_intent` or `searchIntent`)
- `location` (defaulted to `Indonesia` if omitted)

Example JSON:

```json
[
  {
    "keyword": "pelatihan caregiver indonesia",
    "search_intent": "informational",
    "location": "Indonesia"
  }
]
```

Example CSV:

```csv
keyword,search_intent,location
pelatihan caregiver indonesia,informational,Indonesia
```

## Usage

Generate pages from JSON:

```bash
node tools/generate-seo-pages.js --input data/seo-keywords.sample.json
```

Generate pages and update sitemap:

```bash
node tools/generate-seo-pages.js --input data/seo-keywords.sample.json --update-sitemap
```

Generate from CSV and overwrite existing outputs:

```bash
node tools/generate-seo-pages.js --input data/seo-keywords.sample.csv --overwrite
```

Generate and export to WordPress CSV:

```bash
node tools/generate-seo-pages.js --input data/seo-keywords.sample.json --cms-export wordpress-csv
```

Dry run:

```bash
node tools/generate-seo-pages.js --input data/seo-keywords.sample.json --dry-run
```

NPM shortcut:

```bash
npm run seo:generate
```

## Scaling Notes (500+ pages)

- The pipeline is deterministic and file-based, making it easy to run in CI.
- Internal linking uses similarity scoring, so it naturally adapts as keyword count grows.
- Use batching (split input into multiple files) for staged publishing.
- Keep `--overwrite` disabled in CI unless intentional.
- Track outputs via `output/seo-generation-report.json`.

## Optional CMS Integration

Current adapter:
- `--cms-export wordpress-csv` writes `output/seo-wordpress.csv`

This CSV can be imported with WordPress import plugins that support:
- title/slug/meta description
- HTML content

You can add new adapters by extending `tools/seo/lib/cms.js`.
