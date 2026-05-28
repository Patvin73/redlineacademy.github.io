# Supabase Postgres Best Practices

Use this skill for Postgres schema design, RLS policy quality, query performance, indexes, functions, triggers, and Supabase Advisor findings.

## Workflow
- Prefer explicit schemas and idempotent migrations.
- Keep RLS policies simple, role-aware, and testable.
- Use `(select auth.uid())` in policies when avoiding repeated auth calls in row checks.
- Move privileged helper functions out of `public` when they should not be exposed.
- Index real runtime filters and sort keys, especially dashboard list queries.

## Guardrails
- Do not use broad public policies for private user data.
- Do not create unnecessary indexes without a query pattern.
- Do not reorder existing view columns casually.
