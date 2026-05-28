# QA Review

Use this skill for manual QA plans, regression triage, test reports, and validating bug fixes.

## Workflow
- Identify affected user roles, pages, data states, and critical flows.
- Run focused checks first, then impacted suite, then broader regression as needed.
- Distinguish product failures from local runner noise like port conflicts or teardown hangs.
- Report exact pass/fail status and any remaining risk.

## Guardrails
- Do not mark a flow fixed without checking the real runtime surface.
- Do not ignore flaky failures; isolate and rerun narrowly.
- Do not broaden test scope beyond what the change warrants.
