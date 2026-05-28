# Security Review

Use this skill for security-sensitive review of auth, RLS, storage policies, secrets, input handling, and privileged operations.

## Workflow
- Identify assets, trust boundaries, roles, and attacker-controlled inputs.
- Verify permissions at the actual enforcement layer, not only the UI.
- Check for secret exposure, overbroad grants, missing validation, unsafe redirects, and silent failures.
- Recommend or patch minimal secure-by-default changes.

## Guardrails
- Do not loosen access controls to fix UX or tests.
- Do not print secrets or tokens.
- Keep security findings concrete and tied to files, SQL, or flows.
