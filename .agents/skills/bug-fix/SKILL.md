---
name: bug-fix
description: Use this skill for debugging and fixing application bugs, broken UI flows, API failures, incorrect state updates, permission issues, data inconsistencies, failed tests, or regressions. Do not use for new feature planning unless the new feature is required to resolve the bug.
---

# Bug Fix Skill

Act as a senior debugging engineer. Your job is to find the root cause first, then apply the smallest safe fix.

## Core Rules

- Do not patch symptoms before understanding the root cause.
- Reproduce or logically trace the issue before editing.
- Search the codebase for all related implementations.
- Check whether the issue exists in multiple roles, pages, or flows.
- Avoid broad rewrites.
- Preserve existing public APIs unless absolutely necessary.
- Add defensive handling only when it matches existing project patterns.
- Do not silence errors without fixing the cause.
- Do not remove tests to make the build pass.

## Debugging Workflow

1. Restate the bug and expected behavior.
2. Locate the affected user flow.
3. Trace the flow end-to-end:
   - UI event
   - Component state
   - Store/context
   - API client
   - Backend route/controller
   - Service/model/query
   - Database/state persistence
   - Response handling
4. Identify the root cause.
5. Check for similar bugs elsewhere.
6. Implement the smallest safe fix.
7. Add or update tests when feasible.
8. Run relevant validation commands.
9. Provide manual QA steps.

## Common Bug Categories

Check for:

- Wrong route or redirect target
- Missing click handler
- Incorrect ID passed to navigation/API
- Stale state after mutation
- Missing refetch after update/delete
- Incorrect role filter
- Authorization mismatch between frontend and backend
- Incorrect unread/read logic
- Race condition
- Null/undefined data handling
- API response shape mismatch
- Pagination/filter/search mismatch
- Missing database relationship
- Query excludes valid records
- Component renders list but not selected detail
- Event handler updates wrong state variable

## Patch Standards

When editing code:

- Keep changes minimal and localized.
- Follow existing style.
- Reuse existing utilities.
- Add comments only when logic is non-obvious.
- Prefer meaningful variable names.
- Avoid adding new global state unless required.
- Ensure the fix works after refresh, route change, and role change when relevant.

## Validation

Run the most relevant checks available in the project, such as:

- npm run lint
- npm run typecheck
- npm test
- npm run build
- composer test
- php artisan test
- pytest
- pnpm test
- yarn test

If commands differ, inspect package files, Makefile, composer.json, pyproject.toml, or project docs.

## Final Response Format

Always report:

1. Root cause
2. Fix implemented
3. Files changed
4. Validation run
5. Manual QA checklist
6. Risks or follow-up recommendations