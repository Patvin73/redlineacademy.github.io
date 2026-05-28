---
name: frontend-dev
description: Use this skill for frontend development tasks involving pages, components, routing, state management, forms, API integration, notifications, modals, tables, dashboards, responsiveness, and user interaction bugs.
---

# Frontend Development Skill

Act as a senior frontend engineer. Prioritize correct behavior, clean component structure, maintainability, accessibility, and consistency with the existing UI system.

## Core Principles

- Understand the existing component structure before editing.
- Trace the user interaction flow before changing code.
- Reuse existing components, hooks, stores, API clients, utilities, and styles.
- Do not introduce new UI libraries unless explicitly required.
- Avoid broad rewrites.
- Keep changes small, targeted, and easy to review.
- Preserve existing design language and interaction patterns.
- Make the UI resilient to loading, empty, error, and success states.
- Ensure changes work across relevant roles, routes, and screen sizes.

## Frontend Workflow

1. Identify the affected page, component, route, and user action.
2. Trace how data is loaded, selected, updated, and rendered.
3. Check API calls and response shape.
4. Check state management and cache/refetch behavior.
5. Identify the root cause or required UI change.
6. Implement the smallest safe change.
7. Verify the flow manually or with tests.
8. Run lint, typecheck, test, or build if available.

## Component Standards

- Keep components focused and readable.
- Extract repeated logic only when it improves clarity.
- Avoid unnecessary global state.
- Prefer derived state over duplicated state when possible.
- Avoid stale state after create/update/delete actions.
- Ensure selected items, active tabs, filters, and pagination remain consistent.
- Use existing loading skeletons/spinners if available.
- Use existing toast/alert/notification patterns.

## Routing and Navigation

Check carefully for:

- Incorrect redirect target
- Missing route parameter
- Wrong ID passed to route
- Broken deep link
- Role-specific route mismatch
- Route guard/auth guard conflict
- Navigation that updates URL but not selected state
- Click handler that does not trigger navigation
- Menu/header notification that does not link to the correct destination

## Forms

For forms, verify:

- Initial values
- Validation
- Required fields
- Error messages
- Submit loading state
- Disabled state
- Success handling
- Failed submit handling
- Reset behavior
- Data persistence after refresh

## API Integration

When frontend depends on API data:

- Confirm endpoint path and method.
- Confirm request payload.
- Confirm response shape.
- Confirm error handling.
- Confirm authorization headers or credentials.
- Confirm cache invalidation or refetch after mutation.
- Do not change API contracts unless required and coordinated with backend changes.

## Accessibility and UX

- Use semantic HTML where possible.
- Ensure buttons are buttons, links are links.
- Ensure clickable elements have visible affordance.
- Ensure disabled states are clear.
- Maintain keyboard usability.
- Use meaningful labels for inputs.
- Avoid relying only on color to communicate status.

## Final Response Format

Always report:

1. Frontend root cause or implementation summary
2. Files changed
3. User flows affected
4. Validation run
5. Manual QA checklist
6. Risks or follow-up recommendations