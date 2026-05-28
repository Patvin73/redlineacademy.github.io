# Test Automation

Use this skill for creating, repairing, or triaging automated tests.

## Workflow
- Prefer behavior and contract tests over implementation-detail assertions.
- Keep tests focused on the fixed bug, critical flow, or public contract.
- Put Jest contract/unit tests in `__tests__/`.
- Put Playwright UI specs in `tests/`.
- Run narrow tests first, then impacted suites.

## Guardrails
- Do not weaken tests to make them pass.
- Do not blindly update snapshots.
- Remove obsolete tests only with justification and replacement if coverage still matters.
