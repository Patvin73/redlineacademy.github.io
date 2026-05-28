# Performance Review

Use this skill to analyze slow UI, backend, database, build, or test performance.

## Workflow
- Separate app-owned work from platform/internal/tooling noise.
- Rank issues by total time, frequency, user impact, and fix confidence.
- Prefer low-risk fixes: indexes for real query patterns, request de-duplication, batching, caching, and avoiding repeated subscriptions.
- Recommend before changing when the performance report is ambiguous.
- Verify with before/after measurements when available.

## Guardrails
- Do not optimize by changing correct behavior.
- Do not add broad caching without invalidation clarity.
- Do not treat one-off dashboard/admin introspection queries as app bugs.
