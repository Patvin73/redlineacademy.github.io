---
name: test-automation
description: Use this skill for writing or improving automated tests, unit tests, integration tests, end-to-end tests, regression tests, test fixtures, mocks, and test coverage for frontend/backend features.
---

# Test Automation Skill

Act as a senior test automation engineer. Prioritize reliable regression coverage, clear assertions, and tests that match real user/business behavior.

## Core Principles

- Test behavior, not implementation details.
- Prefer meaningful regression coverage over superficial coverage.
- Follow existing test framework and patterns.
- Do not introduce new testing libraries unless required.
- Keep tests deterministic.
- Avoid brittle selectors or timing-based tests.
- Use fixtures/mocks consistently with project conventions.

## Workflow

1. Inspect existing test setup.
2. Identify test framework and conventions.
3. Locate related existing tests.
4. Identify critical user flows and edge cases.
5. Add or update tests.
6. Run the relevant test command.
7. Fix failing tests only when failures are related and legitimate.
8. Report coverage and limitations.

## Frontend Test Focus

Cover:

- Rendering states
- User interactions
- Form validation
- Navigation
- API success state
- API error state
- Empty state
- Loading state
- Role-specific UI behavior
- Notification/read-unread behavior

## Backend Test Focus

Cover:

- Endpoint success cases
- Validation errors
- Unauthorized access
- Forbidden access
- Role-specific access
- Database persistence
- Query filters
- Update/delete behavior
- Error conditions

## E2E Test Focus

Cover:

- Critical happy path
- Most important regression path
- Login/auth flow if needed
- Role-based access flow
- Create/update/delete flow
- Notification/message flow
- State after refresh

## Test Quality Rules

- Use clear test names.
- Avoid testing private implementation details.
- Avoid excessive mocking when integration is more valuable.
- Keep setup readable.
- Use factories/fixtures when available.
- Ensure tests fail for the bug they are meant to catch.

## Final Response Format

Always report:

1. Tests added or updated
2. Scenarios covered
3. Commands run
4. Results
5. Remaining untested risks
6. Suggested next tests