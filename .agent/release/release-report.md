# Release Report

## Purpose

Required structure for the release completion report, so every release is
documented consistently and its actual state is never overstated.

## Required sections

1. **Version** — the version released, per [`versioning.md`](versioning.md),
   and confirmation every visible version reference is consistent.
2. **Scope** — what changed in this release (feature/fix summary,
   referencing [`changelog.md`](changelog.md) entries).
3. **Release state** — the final state per [`release-policy.md`](release-policy.md)
   (`ready`, `readyWithWarnings`, or `blocked`), with the specific reason
   if not a clean `ready`.
4. **Checklist results** — actual results of
   [`release-checklist.md`](release-checklist.md), including the real
   `npm run validate:release` outcome (pass/fail per step, not a single
   pass/fail for the whole chain if anything failed partway).
5. **Evidence** — reference to the [`release-evidence.md`](release-evidence.md)
   run (`npm run quality:evidence:full`) and where its artifacts live
   under `quality/runtime/execution/latest/`.
6. **Manual review status** — explicit status of every item required by
   [`../quality/manual-review.md`](../quality/manual-review.md): done,
   not done, or not applicable — never omitted.
7. **Security review** — reference to the
   [`../security/security-review-template.md`](../security/security-review-template.md)
   outcome if one was required.
8. **Deployment verification** — result of
   [`deployment-verification.md`](deployment-verification.md) if this
   release included a deployment.
9. **Commit/PR reference** — the actual commit SHA(s) and PR link, per
   [`../git/pull-request.md`](../git/pull-request.md).
10. **Known issues / follow-ups** — anything deferred, with enough detail
    for the next agent or the user to act on it.

## Rules

- Every section reflects what actually happened; a section with no real
  content is marked as such (e.g. "not applicable — no deployment in this
  release"), never left implying something that didn't happen did.
- This report is what [`release-policy.md`](release-policy.md)'s state
  determination is based on, not the other way around — the state is a
  consequence of the actual results, not a label chosen first.

## Related

[`release-policy.md`](release-policy.md), [`release-checklist.md`](release-checklist.md),
[`../workflow/final-report.md`](../workflow/final-report.md),
[`../templates/release-report.md`](../templates/release-report.md).
