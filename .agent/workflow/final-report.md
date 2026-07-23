# Final Report

## Purpose

Define the required structure and content of the report an agent gives at
the end of a task — this is phase 19 of [`development.md`](development.md)
and the last module loaded before stopping (phase 20).

## When to load

Load for `feature`, `bugfix`, `hotfix`, `refactor`, `release`, and
`research` task types, and in practice at the end of every substantial
task regardless of type, since `workflow.final-report` has `requiredFor:
["feature", "bugfix", "hotfix", "refactor", "release", "research"]` in
[`../manifest.json`](../manifest.json) but is the natural close for any
task type.

## Prerequisites

- [`self-review.md`](self-review.md) has been completed and
  `quality/runtime/execution/latest/self-review.md` reflects it locally.
- Evidence has been captured per
  [`../quality/evidence.md`](../quality/evidence.md).

## Required actions

Structure the final report with these sections, following
[`../templates/task-report.md`](../templates/task-report.md):

1. **What was requested.** Restate the task in one or two sentences.
2. **What changed.** List files added/modified/deleted, matching
   `quality/runtime/execution/latest/changed-files.txt` where an evidence run
   exists.
3. **Tests and evidence run.** Name every command actually executed (per
   [`testing.md`](testing.md)) and its real result — pass, fail, or
   `notAvailable`. Point to the evidence location:
   `quality/runtime/execution/latest/summary.md` and `summary.json`.
4. **Failures and warnings.** State any failure or warning verbatim from
   `quality/runtime/execution/latest/failures.md` / `warnings.md` — never omit or
   soften a real failure.
5. **Manual review status.** State the status of `manualUxReview`,
   `manualSecurityReview`, and `manualContentReview` from
   `quality/runtime/execution/latest/manual-review.md` exactly as recorded —
   `notRun` is reported as `notRun`, never implied as done.
6. **Documentation impact.** State what docs/changelog were updated per
   [`documentation.md`](documentation.md), or that none were needed and
   why.
7. **Risks and follow-ups.** State any known risk, deferred item, or
   follow-up task explicitly.
8. **Git state.** State the current branch, what is staged/committed, and
   the exact next Git command(s) per
   [`../git/synchronization.md`](../git/synchronization.md) — without
   executing a push/merge unless already authorized.
9. **Recommendation.** State Ready, Ready with warnings, or Blocked,
   matching the honesty rules in
   [`.codex/standards/qa.md`](../../.codex/standards/qa.md) — an incomplete
   manual checklist always yields "Ready with warnings" at best, never
   unconditional "Ready."

## Prohibited actions

- Reporting `passed` for any gate that was not actually run.
- Reporting a manual review status as complete because the automated
  companion tests passed — the two are distinct records, per
  [`../quality/manual-review.md`](../quality/manual-review.md).
- Omitting the Git state / next-command section — the user needs the exact
  commands, not a vague "let me know when to push."
- Claiming a push or merge happened when phase 20 of
  `development.md` explicitly stopped before it.
- Fabricating a recommendation of "Ready" when failures or pending manual
  reviews exist.

## Deliverables

- A structured final report following the nine sections above, matching
  [`../templates/task-report.md`](../templates/task-report.md).

## Evidence requirements

The report must reference, not duplicate, runtime evidence under
`quality/runtime/execution/latest/` (`summary.md`, `summary.json`, `failures.md`,
`warnings.md`, `manual-review.md`, `self-review.md`, `changed-files.txt`)
per [`../quality/evidence.md`](../quality/evidence.md) and
[`../quality/reporting.md`](../quality/reporting.md).

## Exit criteria

All nine report sections are present, every status stated matches the real
evidence files exactly (no upgraded or invented statuses), and the
recommendation follows the honesty rules in
[`.codex/standards/qa.md`](../../.codex/standards/qa.md).
