# QA to Release Handoff

## Purpose

Defines the specific handoff contract from `qa-engineer` to
`release-manager` when a change is ready to be considered for release. Uses
the field set defined in `.agent/handoff/handoff-template.md`.

## Field guidance for this pair

- **Task / Scope** — which change(s) this QA pass covers, and whether it's
  a single change or the full release scope.
- **Branch / Starting commit / Latest commit** — the release branch and its
  current commit.
- **Files changed** — the full set of files changed since the last
  release, or since the branch diverged.
- **Tests executed** — every test command run, including full-suite and,
  where applicable, `test:e2e`, `test:a11y`, `test:visual`,
  `test:performance`, with pass/fail/not-available status for each.
- **Evidence path** — `quality/execution/latest/` and, for release-scale
  work, the `quality:evidence:full` output.
- **Open failures** — any test still failing; a release cannot be reported
  ready with unexplained open failures.
- **Warnings** — flaky tests, environment-specific issues, or anything
  `release-manager` should treat with caution.
- **Manual review** — status of UX, security, and content manual-review
  gates; must reflect actual human sign-off, not automated inference.
- **Next action** — whether `release-manager` can proceed to the release
  checklist, or what must be resolved first.
- **Prohibited assumptions** — `release-manager` must not assume a gate is
  green without checking the evidence path; must not assume manual review
  happened without explicit confirmation.

## Shared reference

See `.agent/handoff/handoff-template.md` for the full field list and
`.agent/agents/qa-engineer.md` / `.agent/agents/release-manager.md` for the
roles' responsibilities.
