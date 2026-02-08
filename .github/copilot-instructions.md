## Purpose

Provide concise, actionable guidance for AI coding agents working on this repository: a small static website (HTML/CSS/JS) intended for GitHub Pages deployment.

## Big picture

- Repo is a static multi-page site (no build system): main entry is [index.html](index.html). Content pages live in [pages/](pages/).
- Styling is centralized in [css/style.css](css/style.css). Behavior and the i18n translations live in [js/script.js](js/script.js).
- Assets (images, flags) are under [assets/images/](assets/images/). Language flags: [assets/images/flags/](assets/images/flags/).

## What to change and where (examples)

- Change site copy: edit files under [pages/](pages/) or [index.html](index.html).
- Add assets: put images in [assets/images/](assets/images/) and reference them with relative paths used in the HTML (e.g. `assets/images/hero_pict.png`).
- Edit styles: modify [css/style.css](css/style.css).
- Edit JS and translations: open [js/script.js](js/script.js). The `translations` object contains keys for `id` and `en`. Elements use `data-i18n="key"` (example: `<a href="index.html" data-i18n="home">Beranda</a>`).

## Conventions and notable patterns

- No JS frameworks or package manager: rely on vanilla JS and static assets. Avoid adding Node tooling unless explicitly requested.
- Multi-language pattern: translation keys on elements (`data-i18n`) + `translations` object in [js/script.js](js/script.js). Persist language in `localStorage`.
- Navigation links are relative (e.g., `pages/about.html`), so preserve relative paths when moving files.
- Some features are intentionally commented-out in HTML (eg. blog cards). If enabling, ensure navigation and translation keys are updated.
- Keep image names stable — HTML references expect specific filenames (see README for common asset names).

## Local dev & verification

- Quick preview: open `index.html` directly in a browser or run a static server from repo root:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

- No build step — deployment targets (GitHub Pages, Netlify) expect the repo root as the site root.

## Tests, CI, and tooling

- There are no tests or CI config files in the repo. Do not add global test frameworks without discussing with maintainers.

## Editing rules for AI agents

- Make minimal, focused edits. For content changes: update the relevant HTML file and the `translations` object in [js/script.js](js/script.js).
- When adding a new page: create `pages/newpage.html`, update the site navigation in all pages, and add translation keys to `js/script.js` for `id` and `en`.
- When changing paths to assets, update all HTML references (relative paths are used throughout). Use existing image formats/naming conventions.
- Avoid introducing server-side code or build tooling unless user asks explicitly.

## Example tasks (how to implement)

- Add a new translation key `signupCTAText`:
  1. Add `data-i18n="signupCTAText"` to the target element in the HTML.
  2. Edit [js/script.js](js/script.js) and add the key under both `id` and `en` in `translations`.
  3. Verify language switching in the browser and persistence in `localStorage`.

## When confused

- Check [README.md](README.md) for project intent and the translation guide. If a requested change implies adding build tools, check with the repo owner first.

---

If any section is unclear or you want additional examples (e.g., sample translation PR or asset optimization steps), tell me which part to expand.
