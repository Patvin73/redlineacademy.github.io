# QA Test Plan - Redline Academy Website

Last updated: 2026-03-15 (Asia/Jakarta)

Payment testing is intentionally excluded and will be handled separately.

## How To Run
- Primary QA gate: `npm run lint && npm test`
- Browser QA (Playwright): `npm test`
- Live Supabase QA: `npm run test:live`
- Optional unit tests (Jest): `npm run test:unit`
- Live Supabase auth QA: set `PLAYWRIGHT_LIVE_SUPABASE_URL`, `PLAYWRIGHT_LIVE_SUPABASE_ANON_KEY`, and seeded user credentials, then run `npm run test:live`

## Automated E2E (Implemented)
Source suite: `tests/dashboard-admin.spec.js`

### Admin/Trainer Dashboard (LMS)
Admin coverage:
- [x] Dashboard renders core sections (sidebar, main, KPI cards)
- [x] Users management: open Users section and toggle active status
- [x] Users filters: role tabs toggle active state
- [x] Enrollments totals: verify total, pending, and revenue values
- [x] Enrollments row rendering: status tags and amount formatting
- [x] Courses: delete flow (confirm -> row removed)
- [x] Announcements: publish announcement and delete it
- [x] Announcements: schedule future publish and verify "Scheduled" status
- [x] Reports: verify revenue and certificate metrics
- [x] Settings: branding + email toggles (UI retains changes)

Trainer coverage:
- [x] Role gate: admin-only sections are hidden for trainer
- [x] KPI and role badge are populated for trainer
- [x] Activity feed: empty state appears when there is no activity
- [x] Grading: open submission, input grade, save, and verify success message
- [x] Grading: request resubmit and verify success message
- [x] Grading filters: submitted, graded, resubmit_required, and all filters show correct items
- [x] Schedule: create a new event and confirm it appears in the list
- [x] Messages: unread badge appears when there is an unread message
- [x] Messages: simulate marking a message as read and verify badge clears
- [x] Messages: empty state appears when there are no messages
- [x] Course builder: multi-tab navigation, add module, save as draft, verify course appears
- [x] Course builder: edit flow opens builder panel with "Edit Course" title

## Recommended E2E (Staging / Live Supabase)
These should run against a staging environment with a real Supabase project and seeded test users. The repo now includes an opt-in live auth suite in `tests/live-auth.spec.js`; keep using the stubbed suites for deterministic local smoke coverage.

### Student Dashboard (LMS)
- [x] Auth/guard: student can access; other roles cannot
- [x] Header profile: name, id, email populated; logout works
- [x] Student data: course/enrollment list renders; empty-state is correct
- [x] Progress UI: completion and last active render correctly
- [x] Core navigation/sections: all visible tabs/sections open without console errors
- [x] Optional (if present): quiz/assignment submit updates UI and DB state

### Portal Marketer/Staff
- [x] Auth/guard: marketer/staff can access; other roles cannot
- [x] Claim form validation: required fields and error messages
- [x] Claim submit success: record created, UI shows expected success state
- [x] Claim edge cases: duplicate claim, rejected claim, invalid inputs
- [x] Role-based visibility: staff vs marketer differences (if any)

## Manual QA (All Pages)
Run on desktop and mobile, and on both Indonesian and English.
- [ ] `index.html`: form validation, submit behavior, success/error messaging, no double-submit
- [ ] `pages/programs.html`: enroll form (file upload, required fields, backend response states)
- [ ] `pages/contact.html`: contact form validation and submission end-to-end
- [ ] `pages/blog.html`: any form/search UI behaves and does not break layout
- [ ] `pages/login.html`: LMS login vs staff/marketer login, wrong-role messaging, redirects
- [ ] `pages/dashboard-admin.html`: basic load, nav between sections, no console errors
- [ ] `pages/dashboard-student.html`: basic load, main actions, no console errors
- [ ] `pages/dashboard-marketer.html`: claim flow UI, no console errors
- [ ] `pages/about.html`, `pages/legal.html`: layout/i18n sanity check
- [ ] `pages/payment_success.html`, `pages/payment_failed.html`: layout only (logic tested separately)

## Database Flow Tests (Staging Supabase)
Goal: verify DB schema, RLS, and dashboard queries are correct for all roles.

Setup:
- [ ] Apply SQL setup scripts as applicable: `SUPABASE_LMS_SETUP.sql`, `SUPABASE_MARKETER_SETUP.sql`, `SUPABASE_PAYMENTS_SETUP.sql`
- [ ] Run health checks: `SUPABASE_HEALTHCHECK.sql`
- [ ] Run smoke script (safe/rollback): `SUPABASE_SMOKETEST.sql`

Role + RLS coverage:
- [x] Student: only reads their own profile/enrollments/progress/messages (UI proxy via Playwright; RLS pending)
- [x] Trainer: reads only their courses/students/submissions/schedules (UI proxy via Playwright; RLS pending)
- [x] Admin: reads global data (users, enrollments/payments metadata, announcements, settings) (UI proxy via Playwright; RLS pending)
- [x] Marketer/Staff: reads and writes only claim-related tables they should access (UI proxy via Playwright; RLS pending)

Data integrity:
- [ ] Creating/updating entities changes expected dashboard views (KPIs, lists, badges)
- [ ] Deletions are either blocked or cascaded as intended (courses, schedules, announcements)

## Database Flow Test Report (Staging Supabase)
Date: 2026-03-15 (Asia/Jakarta)
- Status: PARTIAL - UI role-gating verified via Playwright (local Supabase stub). Staging RLS checks still blocked.
- Missing inputs: Postgres connection details (PGHOST/PGUSER/PGDATABASE/PGPASSWORD) and a dummy Auth user email for `SUPABASE_SMOKETEST.sql`.
- Checklist impact: Setup + Data integrity remain unchecked; Role + RLS marked as UI proxy only.

## Executed Today (2026-03-15)
Ran full local suite via `npm test`.
- [x] `npm test`: 33/33 tests passed (1.5m)

Manual QA (browser automation via Playwright CLI + local static server):
- [x] `pages/programs.html` enrollment form submits to `public-enroll` Edge Function (bank transfer, full payment) and returns 200 OK with success notice

## Executed Today (2026-03-13)
Ran full local suite via `npm test`.
- [x] dashboard admin renders core sections
- [x] admin can open Users section and toggle active
- [x] admin sees enrollments totals
- [x] trainer hides admin-only sections
- [x] trainer sees KPI values and role badge
- [x] trainer can open grading submission and save grade
- [x] trainer can create schedule event
- [x] trainer sees unread messages badge
- [x] trainer can mark message as read (simulated)
- [x] trainer sees empty state when no messages
- [x] trainer can filter grading tabs (submitted/graded/all)
- [x] trainer can request resubmit from grading panel
- [x] trainer can filter resubmit_required items
- [x] trainer can use course builder tabs and save draft
- [x] trainer can open course builder edit flow
- [x] trainer sees empty activity feed state
- [x] admin can publish and delete announcement
- [x] admin can schedule announcement in the future
- [x] admin sees reports revenue metrics
- [x] admin settings tab supports branding and email changes
- [x] admin can delete a course from the list
- [x] admin can filter users by role tabs
- [x] admin enrollments table renders status tags
Re-ran `npm test` on 2026-03-13: 23/23 tests passed (1.2m).

Manual QA (desktop, console-only via Playwright CLI + local static server):
- [x] `index.html`: no console errors or warnings
- [x] `pages/about.html`: no console errors or warnings
- [x] `pages/programs.html`: no console errors or warnings
- [x] `pages/contact.html`: no console errors or warnings
- [x] `pages/blog.html`: warnings only (missing i18n keys: `assistantCarer`, `blog`)
- [x] `pages/legal.html`: warnings only (missing i18n keys: `assistantCarer`, `blog`)
- [x] `pages/login.html`: no console errors or warnings
- [x] `pages/dashboard-admin.html`: console errors (offline fonts + Supabase CDN) and missing i18n keys (see Notes)
- [x] `pages/dashboard-student.html`: warning only (not authenticated — guard should redirect)
- [x] `pages/dashboard-marketer.html`: no console errors or warnings
- [x] `pages/payment_success.html`: no console messages
- [x] `pages/payment_failed.html`: no console messages

Manual QA still pending: mobile viewport checks and full Indonesian/English language toggle verification.

Re-test after i18n fixes (2026-03-13):
- [x] `pages/blog.html`: console warnings cleared
- [x] `pages/legal.html`: console warnings cleared
- [x] `pages/dashboard-admin.html`: console warnings cleared (offline CDN errors did not reproduce in this run)

Automated E2E (recommended) executed via `npm test` on 2026-03-13: student + marketer/staff scenarios passed using Supabase stub in `tests/recommended-e2e.spec.js`.
Optional assignment submit flow now covered in `tests/recommended-e2e.spec.js`.

## Notes
- Admin/Trainer automated tests use a Supabase CDN stub to bypass login guard and provide deterministic data.
- Live Supabase auth tests are opt-in via environment variables and target the staging project when credentials are present.
- CI validates skipped-test count from JSON Playwright output and fails on any unexpected skip.
- Local webServer is started via `tools/static-server.js` as configured in `playwright.config.js`.
- Playwright CLI desktop checks ran in a sandbox without internet. External font/CDN failures are expected:
  - Google Fonts: `net::ERR_INTERNET_DISCONNECTED`
  - Supabase CDN: `net::ERR_INTERNET_DISCONNECTED`
- Missing translation keys observed in console warnings:
  - `assistantCarer`, `blog` (blog/legal pages)
  - `lmsNewMessage`, `lmsNoMessages`, `lmsSelectMessage`, `lmsTimezone`, `lmsNotifications`, `lmsMarkAllRead`, `lmsNoNotifications` (admin dashboard)

