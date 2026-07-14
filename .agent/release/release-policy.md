# Release Policy

## Purpose

Release states and who/what can move a release from one state to the
next — manual review statuses stay explicit at every state and are never
silently promoted to look more finished than they are.

## Release states

1. **planning** — scope defined, not yet implemented.
2. **implementation** — code changes in progress on a task branch.
3. **validation** — implementation complete; automated checks and manual
   review are being run.
4. **readyWithWarnings** — automated gates pass but something is
   incomplete or degraded and disclosed (e.g. a manual UX checklist item
   not yet run, a known non-blocking issue). This state exists so
   incompleteness is visible rather than hidden inside a "ready" claim.
5. **ready** — all required automated gates pass and all required manual
   reviews are actually complete (not skipped, not assumed).
6. **blocked** — a required gate fails, a Critical-risk issue is open, or
   a required manual review cannot be completed; release cannot proceed
   until resolved.
7. **released** — merged/deployed per authorized Git and deployment steps.

## Rules

- A release only reaches **ready** if every manual review required by
  [`../quality/manual-review.md`](../quality/manual-review.md) has
  actually been performed and recorded. A manual check that is "not run"
  or "assumed fine" keeps the release at **readyWithWarnings** at best,
  never **ready** — this must never be silently promoted.
- Moving from **validation** to **ready**/**readyWithWarnings**/**blocked**
  requires the evidence described in [`release-evidence.md`](release-evidence.md)
  to actually have been generated for this candidate, not reused from an
  earlier, different change.
- Only an explicit user decision moves a release to **released** (i.e.
  authorizes the push/merge/deploy) — see
  [`../git/merge-policy.md`](../git/merge-policy.md) and
  [`../workflow/deployment.md`](../workflow/deployment.md). No release
  state transition implies push/merge authorization by itself.
- A state regression (e.g. **ready** → **blocked** because a late issue
  surfaced) is reported plainly, not smoothed over.
- The current state and the reasons for it are part of the
  [`release-report.md`](release-report.md) deliverable.

## Related

[`versioning.md`](versioning.md), [`release-checklist.md`](release-checklist.md),
[`release-evidence.md`](release-evidence.md),
[`../quality/release-gates.md`](../quality/release-gates.md),
[`../quality/manual-review.md`](../quality/manual-review.md).
