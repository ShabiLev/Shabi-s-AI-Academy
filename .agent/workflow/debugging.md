# Debugging

## Purpose

Define a root-cause-first process for `bugfix` and `hotfix` tasks. This
module exists specifically to forbid the shortcut of masking a failure with
a skipped test, a weakened assertion, or an unexplained retry — the process
is about finding *why* something is broken, not making the symptom go away.

## When to load

Load for every `bugfix` and `hotfix` task type, before
[`implementation.md`](implementation.md). For `hotfix`, run this in
compressed form but do not skip reproduction or root cause — urgency is not
a license to guess.

## Prerequisites

- A reported symptom exists: what was expected, what happened, and how to
  trigger it (repro steps, failing test, or error log).
- The affected branch/commit is known (per
  [`../git/branch-strategy.md`](../git/branch-strategy.md)).

## Required actions

1. **Reproduce first.** Before touching any code, reproduce the bug
   locally — run the app (`npm run dev`), the specific failing test, or the
   exact user steps reported. If it cannot be reproduced, say so explicitly
   and state what additional information is needed; do not guess a fix for
   an unreproduced bug.
2. **Capture the failure signal.** Save the exact error, stack trace, failing
   assertion, or console/network output. This becomes the acceptance
   criterion for "fixed."
3. **Isolate the smallest failing case.** Narrow the repro to the smallest
   input, route, or component that still triggers it — this points at the
   real boundary, not just the surface symptom.
4. **Trace to root cause.** Follow the failure backward through the actual
   call path (state, storage, routing, provider boundary) using
   [`../knowledge/architecture.md`](../knowledge/architecture.md) and the
   relevant domain `knowledge/*.md` module until you can state *why* it
   happens, not just *where* it surfaces.
5. **Check for related instances.** Search for the same faulty pattern
   elsewhere in the codebase (same storage parsing, same validation, same
   provider call) — a root cause found in one place often exists in
   siblings.
6. **Write the regression test before or alongside the fix.** Per
   [`.codex/standards/qa.md`](../../.codex/standards/qa.md), every
   production defect gets the smallest reliable regression test before
   closure. Confirm it fails against the pre-fix code, then passes after.
7. **Fix the root cause, not the symptom.** Implement the change per
   [`implementation.md`](implementation.md) — the smallest reversible edit
   that removes the actual cause identified in step 4.
8. **Re-run the original repro and the full focused test suite** per
   [`testing.md`](testing.md) to confirm the fix and rule out new
   regressions.
9. **For `hotfix`, also check rollback viability** — confirm the fix can be
   reverted cleanly if it turns out to be wrong in production, per
   [`../release/rollback.md`](../release/rollback.md).

## Prohibited actions

- Silencing, skipping, or weakening a failing test to make CI green instead
  of fixing the cause — explicitly forbidden by
  [`.codex/standards/testing.md`](../../.codex/standards/testing.md) and
  `master.md` §10 principle 12.
- Adding a blanket retry, arbitrary wait, or broadened try/catch to hide
  nondeterminism instead of identifying it.
- Claiming a fix without ever reproducing the original bug.
- Fixing only the first reported instance when the same faulty pattern
  exists elsewhere and was found in step 5.
- Treating a flaky test as acceptable — per
  [`.codex/standards/qa.md`](../../.codex/standards/qa.md) a flaky test is a
  defect, not noise.

## Deliverables

- A stated root cause (not just a symptom description).
- A regression test that fails before the fix and passes after.
- The fix itself, scoped to the root cause.

## Evidence requirements

The regression test run (before/after) and the full focused suite run from
step 8 feed [`../quality/evidence.md`](../quality/evidence.md) the same way
any other code change does — see [`testing.md`](testing.md).

## Exit criteria

The original repro no longer fails, the new regression test fails on the
pre-fix code and passes on the post-fix code, no related instance of the
same root cause was left unaddressed without being explicitly noted as
out of scope, and the focused/full test suites pass.
