# Bug Fix

Use this skill when a reported behavior is broken and needs diagnosis plus a targeted fix.

## Workflow
- Reproduce or inspect the exact broken surface first.
- Identify the root cause before patching.
- Make the smallest code change that fixes the verified failure.
- Add or update a regression test when the bug is important or likely to recur.
- Verify with a narrow check, then the impacted suite.

## Guardrails
- Do not change correct styling, copy, DOM structure, APIs, or unrelated behavior.
- Do not mask failures by weakening tests.
- Explain any remaining uncertainty clearly.
