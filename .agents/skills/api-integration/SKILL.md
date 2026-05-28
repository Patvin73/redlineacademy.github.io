# API Integration

Use this skill for API wiring, request/response contracts, webhook handlers, client SDK calls, and integration bugs.

## Workflow
- Identify the exact endpoint, SDK call, payload shape, auth context, and caller.
- Preserve public contracts unless the verified bug is the contract itself.
- Validate request validation, error handling, retries, idempotency, and logging.
- Prefer narrow fixes at the boundary where data shape or auth state actually breaks.
- Add focused contract tests for payloads, status handling, and edge cases.

## Guardrails
- Do not change unrelated routes, copy, styling, or data models.
- Do not swallow errors silently.
- Do not weaken auth or permission checks to make an integration pass.
