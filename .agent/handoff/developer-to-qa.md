# Developer to QA Handoff

## Purpose

Defines the specific handoff contract from `developer` to `qa-engineer`
when a code change is ready for testing. Uses the field set defined in
`.agent/handoff/handoff-template.md`.

## Field guidance for this pair

- **Task / Scope** — the feature/bugfix/hotfix/refactor as implemented, and
  explicitly what was left out of scope.
- **Branch / Starting commit / Latest commit** — the task branch and its
  commit range for this change.
- **Files changed** — the actual diff file list, not a paraphrase.
- **Tests executed** — which tests `developer` already ran locally (focused
  tests, build, lint) and their results; this is not a substitute for
  `qa-engineer` re-running the full suite.
- **Evidence path** — the `quality/runtime/execution/latest/` files already
  produced.
- **Open failures** — any known failing test or edge case not yet handled,
  stated plainly rather than hidden.
- **Warnings** — anything QA should pay special attention to (a tricky
  edge case, a flaky area of the app, a dependency change).
- **Manual review** — whether UX/security/content review is needed for
  this change per the task classification, and whether it has started.
- **Next action** — the specific test scope `qa-engineer` should run per
  `.agent/quality/test-selection.md`.
- **Prohibited assumptions** — `qa-engineer` must not assume `developer`'s
  local test run is sufficient evidence; the full required suite must
  still run.

## Shared reference

See `.agent/handoff/handoff-template.md` for the full field list and
`.agent/agents/developer.md` / `.agent/agents/qa-engineer.md` for the
roles' responsibilities.
