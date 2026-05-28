# Frontend Dev

Use this skill for UI behavior, dashboard flows, DOM wiring, client-side state, accessibility, and responsive interaction bugs.

## Workflow
- Start from the exact page, section, selector, and runtime controller involved.
- Preserve correct styling, layout, spacing, typography, animations, copy, and DOM structure.
- Trace the user flow through event handlers, state, async loaders, and persistence.
- Fix the smallest verified cause.
- Verify with `node --check` for JS changes and targeted Playwright tests for UI behavior.

## Redline Notes
- Dashboard behavior usually lives in `js/dashboard-admin.js`, `js/dashboard-student.js`, and `styles/*.css`.
- `css/*.css` can be wrapper/import files; inspect the effective style file before editing.
- Do not add landing-page style sections to operational dashboard screens.

## Guardrails
- Do not make visual redesigns during bug fixes.
- Do not change text or layout unless required by the bug.
- Do not leave placeholder actions where real navigation or persistence is expected.
