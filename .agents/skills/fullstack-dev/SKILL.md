# Fullstack Dev

Use this skill when a change crosses UI, API, database, auth, storage, or tests.

## Workflow
- Map the end-to-end flow: UI trigger, client state, request, backend/database contract, and rendered result.
- Decide whether the fix belongs in frontend, backend, SQL, storage policy, or tests before editing.
- Patch one root cause at a time.
- Add only critical regression coverage for the changed contract.
- Verify each layer with the narrowest relevant check before broad regression.

## Guardrails
- Keep diffs minimal and scoped.
- Do not refactor across layers unless necessary to fix the verified bug.
- Always call out required Supabase SQL or deployment steps separately.
