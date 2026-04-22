# AGENTS.md

## Mission
Run all runnable tests/checks in this repo, fix failures one root cause at a time, add only critical missing tests, and preserve correct styling and behavior.

## Workflow
1. Audit first, then run baseline.
2. Fix one root cause at a time.
3. After each fix:
   - run the narrowest relevant tests,
   - then the impacted suite,
   - then broader regression as needed.
4. Prefer minimal, high-confidence changes.
5. Add regression tests for bug fixes.
6. Convert weak tests into real behavior tests where possible.

## Strict do-not-change rules
- Do not change correct styling, layout, spacing, typography, tokens, animations, responsive behavior, copy, or DOM structure unless clearly required by a real bug.
- Do not change correct behavior, public APIs, contracts, routes, data shapes, accessibility semantics, or valid business logic unless it is the verified root cause.
- Do not do broad refactors, mass formatting, large renames, unrelated cleanup, or file moves.
- Do not weaken tests to make them pass.
- Do not blindly update snapshots.
- Do not upgrade dependencies/config unless absolutely necessary and justified.
- Do not touch unrelated files.

## Testing rules
- Treat zero-signal, tautological, misleading, obsolete, duplicate, or implementation-detail-heavy tests as weak tests.
- Update weak tests into behavior/contract tests when possible.
- Remove tests only with justification, and replace them if the covered behavior still matters.
- Add new tests only for:
  - fixed bugs,
  - critical business flows,
  - high-risk edge cases,
  - important public contracts.

## Done when
- All runnable tests/checks pass.
- Reproducible failures are fixed.
- Only critical missing tests were added.
- Weak tests were updated or removed with justification.
- Correct styling and behavior remain unchanged.
- Final diff is minimal and targeted.
