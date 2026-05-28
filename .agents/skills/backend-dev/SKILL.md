# Backend Dev

Use this skill for server-side logic, data flow, background work, auth-sensitive paths, and backend regressions.

## Workflow
- Trace the runtime path from entrypoint to persistence.
- Confirm schema, permissions, environment variables, and external service contracts before editing.
- Fix one root cause at a time with the smallest safe change.
- Add tests for changed behavior, especially auth, validation, and persistence.
- Run the narrowest relevant test first, then the impacted suite.

## Guardrails
- Avoid broad refactors, dependency upgrades, or unrelated cleanup.
- Preserve existing response shapes and business rules unless they are the bug.
- Keep error messages useful without leaking secrets.
