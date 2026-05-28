# Supabase Dev

Use this skill for Supabase client code, Edge Functions, Auth, Storage, Realtime, RLS, and SQL Editor actions.

## Workflow
- Confirm whether the issue is frontend-only, Edge Function, SQL schema, RLS, Storage policy, or Realtime.
- Inspect the real Supabase table/view/function/policy contract before claiming a fix.
- Use idempotent SQL files for repeatable setup or advisor remediation.
- For dashboard questions, answer directly with `no SQL needed` or the exact SQL file/statements to run.

## Realtime
- Avoid duplicate channels for the same user/session.
- Use filtered `postgres_changes` subscriptions where possible.
- Remove stale channels before re-subscribing for a different user.

## Guardrails
- Do not expose service-role keys to browser code.
- Do not bypass RLS unless using a trusted server-side context.
