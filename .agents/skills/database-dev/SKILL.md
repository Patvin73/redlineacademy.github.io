# Database Dev

Use this skill for SQL, Supabase/Postgres schema, indexes, RLS policies, migrations, query performance, and data-contract bugs.

## Workflow
- Confirm the exact table, view, function, policy, index, or query shape involved.
- Prefer idempotent SQL for repeatable fixes: `if not exists`, `drop policy if exists`, guarded `do $$` blocks where appropriate.
- Preserve column order in existing views unless recreating safely is explicitly required.
- Separate dashboard/frontend fixes from SQL Editor actions.
- Add SQL contract tests when a migration or advisor fix must not regress.

## Performance
- Index filters and sort keys used by real runtime queries.
- Treat Supabase internal/dashboard/catalog queries separately from app queries.
- After performance changes, reset or re-check stats only after the relevant app flow runs.

## Guardrails
- Do not loosen RLS to make tests pass.
- Do not run destructive SQL without explicit approval.
- Always tell the user exactly what to run in Supabase SQL Editor, or say `no SQL needed`.
