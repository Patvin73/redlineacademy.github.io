# Refactor Review

Use this skill to review or perform refactors while preserving behavior.

## Workflow
- Define the behavior that must remain unchanged.
- Keep refactors narrow and reversible.
- Prefer local simplification over new abstractions.
- Run tests that cover the touched behavior.

## Guardrails
- Do not mix refactors with unrelated bug fixes.
- Do not rename, move, or reformat broadly unless explicitly requested.
- Do not change public APIs or DOM contracts during a refactor unless approved.
