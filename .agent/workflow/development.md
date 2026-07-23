# Development Workflow

## Purpose

Define the single, ordered phase sequence an agent follows for any
substantial code change (feature, bugfix, hotfix, refactor) from the moment
a task is accepted to the moment a final report is produced. This module is
the backbone that other workflow modules (`planning.md`, `implementation.md`,
`testing.md`, `ui-validation.md`, `ux-review.md`, `self-review.md`,
`final-report.md`) plug into — it does not duplicate their detail, it
sequences them.

## When to load

Load for every task classified as `feature`, `bugfix`, `hotfix`, or
`refactor` in [`../registry.json`](../registry.json), and for `workflow
creation` tasks that need a reference phase sequence to adapt. Do not load
for pure `documentation`, `research`, or `knowledge ingestion` tasks — those
have their own workflow modules.

## Prerequisites

- [`../master.md`](../master.md) has been read and its loading sequence
  followed.
- The task has been classified with
  [`../loaders/task-classifier.md`](../loaders/task-classifier.md).
- Required modules for the resolved task type have been pulled from
  [`../registry.json`](../registry.json).
- `AGENTS.md` and, if present, `CLAUDE.md` have been read.

## Required actions

The 20 phases below are mandatory and run in order. Skipping or reordering a
phase requires stopping and asking the user, per `master.md` §9 — do not
silently skip a phase because it seems unnecessary for a small change; scale
depth, not presence.

1. **Repository verification.** Run `git status`, confirm the current branch
   name, and confirm no uncommitted work would be discarded before starting.
   Never begin work on `main` directly (see [`../git/branch-strategy.md`](../git/branch-strategy.md)).
2. **Instruction loading.** Read `AGENTS.md`, `CLAUDE.md` (if present), the
   active `.codex/` release specification it references, and
   `.agent/master.md`, in that order.
3. **Task classification.** Determine task type, risk level, affected
   domains, and required modules/tests/reviews/evidence using
   [`../loaders/task-classifier.md`](../loaders/task-classifier.md).
4. **Scope analysis.** State exactly what will and will not change. Identify
   affected files, routes, and stored data using
   [`.codex/architecture/overview.md`](../../.codex/architecture/overview.md)
   and the relevant `.agent/knowledge/*.md` module for the domain touched.
5. **Architecture review.** Check the change against
   `.codex/architecture/overview.md`, any accepted ADRs in `.codex/adr/`, and
   [`../knowledge/architecture.md`](../knowledge/architecture.md) for fit
   before writing code.
6. **Implementation plan.** Produce a short plan per
   [`planning.md`](planning.md) and, for non-trivial changes,
   [`../templates/implementation-plan.md`](../templates/implementation-plan.md).
7. **Branch preparation.** Confirm or create a task branch per
   [`../git/branch-strategy.md`](../git/branch-strategy.md); never commit
   directly to `main`.
8. **Focused implementation.** Make the smallest reversible change that
   satisfies the plan, following [`implementation.md`](implementation.md)
   and [`.codex/standards/coding.md`](../../.codex/standards/coding.md).
9. **Focused tests.** Run the narrowest relevant test command first (for
   example a single Vitest file or `npm run test:evidence`) per
   [`testing.md`](testing.md) and
   [`../quality/test-selection.md`](../quality/test-selection.md).
10. **Full tests.** Run the full suite for the affected area — at minimum
    `npm run test:run` and `npm run build`; add `npm run test:e2e` or
    `npm run test:e2e:full` when user-visible flows changed.
11. **UI execution.** If the change is user-facing, execute it in a real
    browser session per [`ui-validation.md`](ui-validation.md) and
    [`../quality/ui-validation.md`](../quality/ui-validation.md) — do not
    infer UI correctness from code reading alone.
12. **UX inspection.** For user-facing changes, walk the affected journeys
    per [`ux-review.md`](ux-review.md) and
    [`../quality/ux-validation.md`](../quality/ux-validation.md).
13. **Security review.** Check the diff against
    [`../security/security-policy.md`](../security/security-policy.md) and
    [`.codex/standards/security.md`](../../.codex/standards/security.md)
    before considering the change complete.
14. **Documentation.** Update docs, `CHANGELOG.md`, and any AOS module
    description that the change makes stale, per
    [`documentation.md`](documentation.md).
15. **Evidence capture.** Run `npm run quality:evidence` (or
    `quality:evidence:full` for release-scale changes) so
    ignored `quality/runtime/execution/latest/` reflects this change, per
    [`../quality/evidence.md`](../quality/evidence.md).
16. **Self-review.** Run the checklist in
    [`self-review.md`](self-review.md) against the actual diff before
    reporting anything as done.
17. **Commit preparation.** Stage only the intended files, review
    `git diff --cached --stat`, and write a Conventional Commit message per
    [`../git/commit-policy.md`](../git/commit-policy.md).
18. **Git synchronization commands.** Generate the exact `git status`,
    `git fetch`, `git push` sequence from the actual current branch/remote
    state per [`../git/synchronization.md`](../git/synchronization.md) —
    never invent commands from memory.
19. **Final report.** Produce the report using the structure in
    [`final-report.md`](final-report.md).
20. **Stop before push/merge unless authorized.** Do not run `git push` or
    merge the branch unless the user has explicitly authorized it in the
    current session (see [`../git/git-policy.md`](../git/git-policy.md) and
    [`../git/merge-policy.md`](../git/merge-policy.md)).

## Prohibited actions

- Starting implementation (phase 8) before phases 1–6 are done.
- Marking a phase complete without the artifact it produces (plan, diff,
  logs, evidence files) actually existing.
- Skipping UI execution or UX inspection for a change that alters rendered
  output, routing, or user-facing copy.
- Fabricating test results, evidence, or manual review status instead of
  running phase 9–16 for real.
- Pushing or merging during phase 20 without explicit, current-session
  authorization.
- Reordering phases to save time on a "small" change — reduce depth per
  phase, not the phase list itself.

## Deliverables

- A short implementation plan (phase 6).
- The code diff scoped to the stated change (phase 8).
- Focused and full test run output (phases 9–10).
- Runtime evidence under `quality/runtime/execution/latest/` (phase 15), never staged.
- Updated documentation/changelog entries where behavior changed (phase 14).
- A self-review record and final report (phases 16, 19).

## Evidence requirements

Evidence is produced by actually running the commands named in phases 9, 10,
and 15 — never fabricated and never asked of the user as copy-paste. See
[`../quality/evidence.md`](../quality/evidence.md) for the exact files under
`quality/runtime/execution/latest/` this must update, and record any command that
does not exist in this repository as `notAvailable`, never as passed.

## Exit criteria

All 20 phases have been executed (or a stop condition from `master.md` §9
was hit and documented), the runtime evidence under `quality/runtime/execution/latest/`
reflect the current change, the self-review checklist has been completed
against the real diff, and a final report following
[`final-report.md`](final-report.md) has been produced. The task is not
"done" until phase 19 exists; it is not "shippable" until an authorized
human decides to push/merge in phase 20.
