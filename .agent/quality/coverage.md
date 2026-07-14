# Coverage

## Purpose

How coverage is measured and enforced in this repository, and the rule an
agent must follow when coverage regresses. See also
[`test-selection.md`](test-selection.md), [`evidence.md`](evidence.md), and
[`../workflow/testing.md`](../workflow/testing.md).

## Where coverage comes from

- **Command:** `npm run test:coverage` (`vitest run --coverage`), or
  `npm run test:coverage:open` for a local HTML view.
- **Thresholds:** the single source of truth is
  `quality/config/coverageThresholds.cjs`:
  `{ statements: 75, branches: 65, functions: 70, lines: 75 }`. It is
  imported by `vite.config.ts` (which enforces it directly through Vitest's
  own `coverage.thresholds` option) and by
  `quality/scripts/collect-quality-results.mjs` (which judges
  `coverage/coverage-summary.json` against the same numbers for the
  generated quality report) and by `scripts/run-quality-evidence.mjs`
  (`summarizeCoverage()` in `scripts/evidence-utils.mjs`, used to populate
  `coverage-summary.json` and the `## Coverage` table in `summary.md`).
- The threshold file's own header records a measured baseline (2026-07-11:
  statements 95.5%, branches 85.46%, functions 78.51%, lines 95.5%) that is
  comfortably above the enforced floor — the floor is intentionally lower
  than the current measured baseline to leave headroom, not set to the
  baseline itself.

## Coverage in evidence

`quality/execution/latest/coverage-summary.json` and the `## Coverage`
table in `quality/execution/latest/summary.md` report, per metric
(statements/branches/functions/lines): `percent`, `threshold`, `delta`
(vs. the previous indexed run), and `passed`. If `test:coverage` did not
run in a given evidence profile (e.g. `fast`), the file instead contains
`{ status: "notAvailable", thresholds: coverageThresholds }` — never a
fabricated passing result. See [`evidence.md`](evidence.md).

## Critical risk: changing `quality/config/coverageThresholds.cjs`

Editing this file is a **Critical-risk action** under
`.agent/loaders/task-classifier.md` and `.agent/master.md` §3/§9 (same tier
as write-capable MCP tools or secret exposure risk). It is **normally
prohibited without explicit, separate authorization** from the user in the
current session — never as a side effect of "fixing" a failing coverage
gate during an unrelated task.

This applies to any edit that weakens the gate, including but not limited
to:

- Lowering any of `statements`, `branches`, `functions`, or `lines`.
- Adding new exclusion patterns to the Vitest coverage config that reduce
  what is measured, if done in order to dodge a specific failing number.
- Disabling coverage enforcement in `vite.config.ts` for a path or file.

## Recovery from a coverage regression

If `npm run test:coverage` fails because a change dropped coverage below
threshold, the required recovery is to **add tests**, not to lower the
bar:

1. Identify the uncovered lines/branches/functions from the Vitest coverage
   report (`coverage/coverage-summary.json`, or the HTML report via
   `npm run test:coverage:open`).
2. Write targeted unit/component tests for the newly-added or newly-exposed
   code paths.
3. Re-run `npm run test:coverage` and confirm all four metrics clear their
   thresholds again.
4. If coverage cannot reasonably be restored within the scope of the
   current task (e.g. a large pre-existing gap unrelated to this change),
   stop and report the gap rather than editing the threshold file — this is
   a stop condition per `.agent/master.md` §9 ("a task requires a
   Critical-risk action").

See [`../prompts/coverage-recovery.md`](../prompts/coverage-recovery.md) for
the task-specific prompt template used when coverage recovery is itself the
assigned task.
