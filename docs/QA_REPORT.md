# QA Observability Report

Generated on: 2026-03-20
Features mapped: 14
Covered: 12 | Partial: 2 | Missing: 0

## Coverage Map

| Group | Feature | Risk | Coverage | Tests | Gap |
| --- | --- | --- | --- | --- | --- |
| Public site | Blog/legal translation integrity | medium | covered | `tests/public-i18n.spec.js` | No visual/layout assertions for every public page; this only checks translation warnings. |
| Public site | Homepage, programs, contact, and blog form flows | medium | partial | `Manual QA notes, tools/static-server.js for browser-driven checks` | No dedicated automated submission, validation, or responsive-layout suite exists yet. |
| LMS dashboard | Admin dashboard shell and KPI rails | high | covered | `tests/dashboard-admin.spec.js` | Local stub coverage is strong, but this still does not exercise the live Supabase backend. |
| LMS dashboard | Admin management workflows (users, enrollments, announcements, reports, settings, courses) | high | covered | `tests/dashboard-admin.spec.js` | No live-backend assertions for these admin mutations yet. |
| LMS dashboard | Trainer workflows (grading, schedules, messages, course builder) | high | covered | `tests/dashboard-admin.spec.js` | Coverage is stub-based; it does not prove live RLS behavior or persisted writes. |
| LMS dashboard | Student dashboard access and learning flows | high | partial | `tests/recommended-e2e.spec.js, tests/live-auth.spec.js` | Student flow is represented, but real end-to-end state transitions against production-like data are still limited. |
| LMS dashboard | Live enrollment, payment, and progress persistence | critical | covered | `tests/live-write.spec.js` | Covers isolated live inserts and the admin payment workflow that creates enrollment and course_progress rows. |
| LMS dashboard | Student submission writes and progress-write denial | critical | covered | `tests/live-write.spec.js` | Student-owned assignment submissions persist successfully; course_progress write attempts fail explicitly by RLS. |
| LMS dashboard | Trainer course create/update/delete persistence | high | covered | `tests/live-write.spec.js` | Validates live course CRUD for trainer-owned records with isolated slugs and delete cleanup. |
| Marketer portal | Marketer/staff portal access control | high | covered | `tests/recommended-e2e.spec.js, tests/live-auth.spec.js` | Portal access is covered, but live claim creation is not yet validated end to end. |
| Marketer portal | Claim submission and review flows | high | covered | `tests/recommended-e2e.spec.js, tests/live-write.spec.js` | Live inserts now prove marketer/staff claim persistence and admin-only status escalation. |
| Backend (Supabase) | Live auth/session bootstrap and role routing | critical | covered | `tests/live-auth.spec.js` | Live login is covered, but password-reset, session expiry, and MFA-style edge cases are not covered. |
| Backend (Supabase) | Protected routes and unauthorized redirects | critical | covered | `tests/live-auth.spec.js` | Routes are covered, but the full matrix of direct URL access and stale-session behavior is still limited. |
| Backend (Supabase) | RLS enforcement and role escalation prevention | critical | covered | `tests/live-auth.spec.js, tests/live-write.spec.js` | Now covers insert/update/delete restrictions across core LMS and marketer tables, plus explicit failure assertions. |

## Risk Matrix

| Group | Feature | Risk | Coverage | Gap |
| --- | --- | --- | --- | --- |
| Public site | Blog/legal translation integrity | medium | covered | No visual/layout assertions for every public page; this only checks translation warnings. |
| Public site | Homepage, programs, contact, and blog form flows | medium | partial | No dedicated automated submission, validation, or responsive-layout suite exists yet. |
| LMS dashboard | Admin dashboard shell and KPI rails | high | covered | Local stub coverage is strong, but this still does not exercise the live Supabase backend. |
| LMS dashboard | Admin management workflows (users, enrollments, announcements, reports, settings, courses) | high | covered | No live-backend assertions for these admin mutations yet. |
| LMS dashboard | Trainer workflows (grading, schedules, messages, course builder) | high | covered | Coverage is stub-based; it does not prove live RLS behavior or persisted writes. |
| LMS dashboard | Student dashboard access and learning flows | high | partial | Student flow is represented, but real end-to-end state transitions against production-like data are still limited. |
| LMS dashboard | Live enrollment, payment, and progress persistence | critical | covered | Covers isolated live inserts and the admin payment workflow that creates enrollment and course_progress rows. |
| LMS dashboard | Student submission writes and progress-write denial | critical | covered | Student-owned assignment submissions persist successfully; course_progress write attempts fail explicitly by RLS. |
| LMS dashboard | Trainer course create/update/delete persistence | high | covered | Validates live course CRUD for trainer-owned records with isolated slugs and delete cleanup. |
| Marketer portal | Marketer/staff portal access control | high | covered | Portal access is covered, but live claim creation is not yet validated end to end. |
| Marketer portal | Claim submission and review flows | high | covered | Live inserts now prove marketer/staff claim persistence and admin-only status escalation. |
| Backend (Supabase) | Live auth/session bootstrap and role routing | critical | covered | Live login is covered, but password-reset, session expiry, and MFA-style edge cases are not covered. |
| Backend (Supabase) | Protected routes and unauthorized redirects | critical | covered | Routes are covered, but the full matrix of direct URL access and stale-session behavior is still limited. |
| Backend (Supabase) | RLS enforcement and role escalation prevention | critical | covered | Now covers insert/update/delete restrictions across core LMS and marketer tables, plus explicit failure assertions. |

## Test Tiers

| Tier | Command | Scope | Config |
| --- | --- | --- | --- |
| Smoke | `npm run test:smoke` | Playwright local suite filtered to `@critical` | `playwright.config.js` |
| Full regression | `npm test` | All local Playwright tests except live Supabase specs | `playwright.config.js` |
| Live staging | `npm run test:live` | Live Supabase auth and RBAC suite only | `playwright.live.config.js` |

## Tag Usage

| Tag | Meaning |
| --- | --- |
| `@critical` | Release-blocking flows that must pass in smoke and live security checks. |
| `@auth` | Sign-in, sign-out, session bootstrap, and route-guard behavior. |
| `@rbac` | Role routing, access control, and role-escalation resistance. |
| `@lms` | Student, trainer, and admin dashboard flows for the LMS. |
| `@marketer` | Marketer and staff portal flows, including claims and portal access. |
| `@supabase` | Tests that exercise the live Supabase backend, RLS, and auth state. |
| `@public` | Public marketing, blog, legal, and brochure-style pages. |
