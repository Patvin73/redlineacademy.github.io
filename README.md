# Redline Academy

Redline Academy is a hybrid bilingual website for caregiver training, public enrollment, and role-based LMS operations.

Redline Academy adalah website hybrid bilingual untuk promosi program caregiver, pendaftaran publik, dan operasional LMS berbasis role.

## Project Status

- Public site: active
- LMS dashboards: active
- Supabase integration: active
- Legacy PHP and DOKU payment files: still present in the repo
- No frontend build step: the site is served as static files plus optional PHP/Supabase backends

This README is based on the current source code and config files in the repository. Older docs were used only as secondary context.

## Quick Start

### Prerequisites

- Node.js `>= 20.19.0`
- npm
- Optional: PHP 7.4+ if you need to run the legacy PHP endpoints locally
- Optional: a Supabase project if you want to use LMS, article storage, or live QA

### Install

```bash
npm install
```

### Run locally

Recommended local server:

```bash
node tools/static-server.js
```

Open:

- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/pages/programs.html`
- `http://127.0.0.1:8000/pages/login.html`

There is no bundler or build output to generate first.

## What This Repo Contains

### Main surfaces

- Public marketing pages: `index.html` and `pages/*.html`
- Enrollment page: `pages/programs.html`
- Blog and editorial hub: `pages/blog.html` plus article pages
- LMS login: `pages/login.html`
- Role dashboards:
  - `pages/dashboard-student.html`
  - `pages/dashboard-admin.html`
  - `pages/dashboard-marketer.html`
- Internal article management:
  - `pages/create-article.html`
  - `pages/article-view.html`

### Main features

- Bilingual UI (`id` and `en`) using `data-i18n` and `js/script.js`
- Public program discovery and enrollment flow
- Supabase-backed authentication and role routing
- Student, admin/trainer, and marketer dashboards
- Blog hub with static editorial pages plus dynamic Supabase-backed articles
- Playwright regression, smoke, and live QA workflows
- SEO validation and SEO page generation utilities
- GitHub Actions verification and FTP deployment to Hostinger

## Tech Stack

### Frontend

- HTML
- CSS
- Vanilla JavaScript
- Playwright for browser testing

### Backend and data

- Supabase Auth and database access
- Supabase Edge Functions in `supabase/functions/*`
- Legacy PHP endpoints for registration, CSRF, webhook, and payment-related flows
- SQL setup scripts for LMS, marketer, payments, health checks, and smoke tests

### Tooling

- Node.js
- ESLint
- Prettier
- Jest
- GitHub Actions

## Important Folder Structure

```text
.
|-- index.html
|-- pages/                    # public pages, dashboards, editorial pages, utilities
|-- js/                       # active runtime JavaScript used by deployed pages
|-- css/                      # core public and LMS styles
|-- styles/                   # editorial/article-specific styles
|-- assets/                   # images, flags, logos, media
|-- components/               # reusable HTML fragments / component assets
|-- data/                     # SEO keyword input and supporting data
|-- docs/                     # QA plans, user flows, payments notes, stack notes
|-- qa/                       # QA coverage registry and related artifacts
|-- tests/                    # Playwright suites
|-- tools/                    # local server, QA reporting, SEO generation utilities
|-- scripts/                  # support scripts and duplicate/alternate JS tree
|-- supabase/
|   `-- functions/            # Edge Functions such as public-enroll
|-- *.sql                     # Supabase setup and smoke-test SQL files
|-- *.php                     # legacy server-side endpoints still present in repo
|-- .github/workflows/        # verify + deploy automation
```

Notes:

- The active runtime JavaScript for deployed pages is primarily in `js/`.
- The deploy workflow explicitly excludes several files under `scripts/`, so do not assume `scripts/` is the production runtime path.
- Both `css/` and `styles/` are in use.

## Architecture at a Glance

### Public layer

- Static HTML pages rendered directly by the browser
- Shared translations and public UI behavior live in `js/script.js`
- Public pages are designed to work from a simple static server

### App layer

- Auth, session bootstrap, guard logic, and dashboard interactions use Supabase
- Runtime client config is loaded via `js/supabase-client.js`
- Articles use `js/articles-store.js`, which reads and writes to the `articles` table through Supabase

### Server-side and legacy layer

- The repo still contains PHP endpoints such as:
  - `submit_registration.php`
  - `get_csrf_token.php`
  - `doku_notify.php`
  - `webhook_health.php`
- These are relevant for legacy or server-hosted flows and cannot run on static hosting alone

## Enrollment and Payment Flow

Current codebase reality:

- `pages/programs.html` contains a server form action to `submit_registration.php`
- The same page also intercepts submit in JavaScript and posts to Supabase Edge Function `public-enroll`
- Manual transfer language and admin verification flow are still reflected in repo docs and UI
- Legacy DOKU/PHP files remain in the repository

Practical interpretation:

- Browser-side public enrollment currently appears to prefer `public-enroll` when Supabase runtime config is available
- PHP payment files still exist and may still matter on server-hosted environments

Status note:

- This dual-path payment/enrollment architecture needs confirmation before any public claim that DOKU is fully active or fully retired

## Environment Variables

Only variables confirmed in source code are listed here.

### Supabase Edge Functions

Used by files under `supabase/functions/*`:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SERVICE_ROLE_KEY`

### Live Playwright QA

Used by `playwright.live.config.js`, `tests/live-auth.spec.js`, `tests/live-write.spec.js`, and `tests/support/live-qa.js`:

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
- `PLAYWRIGHT_LIVE_STAFF_EMAIL`
- `PLAYWRIGHT_LIVE_STAFF_PASSWORD`

Repo note:

- `.env.playwright.live` exists in the repo and is loaded by `playwright.live.config.js`
- Before publishing this repository openly, review whether that file should remain committed

### Legacy PHP and payment-related env vars

Confirmed in `submit_registration.php`:

- `DOKU_CLIENT_ID`
- `DOKU_SECRET_KEY`
- `DOKU_SANDBOX`
- `RATE_LIMIT_WINDOW_SEC`
- `RATE_LIMIT_MAX`
- `RATE_LIMIT_TRUST_PROXY`

### Runtime browser config note

`js/supabase-client.js` currently contains a default public Supabase URL and anon key in source, while also allowing runtime override through:

- `window.__LMS_SUPABASE_CONFIG__`
- `window.__lmsSupabaseConfig__`

If you are rotating environments or publishing the repo, verify whether this default client config should stay as-is.

## Useful Commands

### Quality checks

```bash
npm run lint
npm run seo:validate
npm run qa:report
```

### Local Playwright

```bash
npm run test:smoke
npm test
```

Equivalent local regression commands:

```bash
npm run test:regression
npm run test:e2e
```

### Live Supabase QA

```bash
npm run test:live
```

You must provide the required live env vars first.

### SEO generation

```bash
npm run seo:generate
npm run seo:build
```

Source input used by the generator:

- `data/seo-keywords.sample.json`

### Direct local server

```bash
node tools/static-server.js
```

## Usage Guide

### Public site development

1. Start the static server.
2. Open the target page in the browser.
3. Edit the relevant files in `pages/`, `js/`, `css/`, or `styles/`.
4. Run `npm run lint` and `npm run seo:validate`.
5. Run the narrowest relevant Playwright test before broader regression.

### LMS and dashboards

Key runtime files:

- `js/auth.js`
- `js/guard.js`
- `js/supabase-client.js`
- `js/dashboard-student.js`
- `js/dashboard-admin.js`
- `js/dashboard-marketer.js`

Typical manual flow:

1. Open `pages/login.html`
2. Sign in with a seeded Supabase user
3. Verify role-based redirect to the correct dashboard

### Articles and blog

Key files:

- `pages/create-article.html`
- `pages/article-view.html`
- `pages/blog.html`
- `js/articles-store.js`
- `js/blog-hub.js`

Observed behavior from source and tests:

- Draft and published articles are managed from `pages/create-article.html`
- Published articles are rendered into `index.html` and `pages/blog.html`
- Article storage depends on Supabase

## Testing Strategy

The repo uses multiple test layers:

- Smoke: critical local browser flows
- Full regression: local Playwright suite excluding live Supabase-only specs
- Live QA: auth, RBAC, writes, and cleanup checks against Supabase

Important configs:

- `playwright.config.js`
- `playwright.local.config.js`
- `playwright.live.config.js`
- `jest.config.js`

Important note:

- `npm run test:unit` maps to `jest --passWithNoTests`, so it should not be treated as meaningful coverage on its own

## Deployment and CI/CD

### GitHub Actions

The main workflow is `.github/workflows/deploy.yml`.

Pipeline order:

1. `verify-smoke`
2. `verify-regression`
3. `verify-live`
4. `deploy`

### Deployment target

- Deploy method: FTP
- Action: `SamKirkland/FTP-Deploy-Action`
- Server path: `/home/u838818830/domains/redlineacademy.com.au/public_html/`

### Deployment behavior

- The workflow writes `deploy-info.txt` during deploy
- It excludes development-only directories such as `tests/`, `tools/`, `docs/`, `node_modules/`, and local env files
- It also excludes several duplicate `scripts/*` runtime files, reinforcing that `js/*` is the main deploy path

### Keep-alive workflow

`.github/workflows/keep-supabase-alive.yml` periodically pings the Supabase auth health endpoint using repository secrets.

## Troubleshooting and FAQ

### The site opens locally but some dynamic features do not work

Check whether the page depends on:

- Supabase runtime config
- PHP endpoints
- external assets blocked by your environment

### Port `8000` is already in use

Stop the process using that port or run the local server with another `PORT` value:

```bash
$env:PORT=8001
node tools/static-server.js
```

### `npm run test:live` fails immediately

Most common cause: missing live env vars required by `playwright.live.config.js`.

### SEO validation fails

`scripts/validate-seo-structure.js` checks:

- exactly one `<h1>` per HTML page
- duplicate meta descriptions
- duplicate canonicals
- heading jumps
- broken local links

### Payment flow confusion

This repo currently contains both:

- Supabase `public-enroll`
- PHP/DOKU-related registration files

Treat the exact production payment path as "needs confirmation" unless you verified the current deployed environment.

## Contributing

Recommended workflow:

1. Inspect the real runtime file before editing
2. Keep changes minimal and targeted
3. Run the narrowest relevant test first
4. Run broader regression if the change touches shared behavior
5. Avoid changing layout, copy, or structure unless the bug requires it

## License

- `package.json` currently declares license: `ISC`
- No `LICENSE` file is present in the repository at the time of writing

Publication note:

- Add a real `LICENSE` file before treating the repository as fully ready for public open-source distribution

## Notes That Need Confirmation

- Whether DOKU is still an active production payment path or only a retained legacy/server-side path
- Whether `.env.playwright.live` should remain committed in a public repository
- Whether the default public Supabase client config in `js/supabase-client.js` should remain committed unchanged

Develop & Design by Patrio Vincentio, email patvin73@gmail.com
