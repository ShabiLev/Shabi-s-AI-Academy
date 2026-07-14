# Rollback

## Purpose

Safe rollback options if a release is found broken after merge/deploy, so
recovery is deliberate and reversible rather than a panicked force-push.

## Rules

- First, confirm the release is actually broken with the same rigor as
  [`deployment-verification.md`](deployment-verification.md) — reproduce
  the failure, don't roll back on an assumption.
- Preferred rollback is a **forward fix**: a new commit (following
  [`../git/commit-policy.md`](../git/commit-policy.md)) that reverts or
  corrects the breaking change, keeping history intact. `git revert
  <sha>` is preferred over rewriting history.
- If reverting the merge commit itself, use `git revert -m 1 <merge-sha>`
  against the actual merge commit identified via `git log` — never a
  guessed SHA (per [`../git/synchronization.md`](../git/synchronization.md)
  "generate from actual state").
- Rolling back a GitHub Pages deployment means re-deploying the last known
  good build (re-running `npm run build:pages` from the last good commit
  and redeploying), not editing the live artifact directly.
- Any rollback still requires the same push/merge authorization as any
  other Git operation — see [`../git/git-policy.md`](../git/git-policy.md).
  An incident does not implicitly authorize a force push.
- After rollback, re-run the applicable evidence
  ([`release-evidence.md`](release-evidence.md) or at minimum
  [`deployment-verification.md`](deployment-verification.md)) to confirm
  the rolled-back state is actually healthy before declaring the incident
  resolved.
- Record what broke, why, and the rollback action taken in the
  [`release-report.md`](release-report.md) for this release, so the same
  failure mode can be checked for next time.

## Related

[`deployment-verification.md`](deployment-verification.md),
[`../git/recovery.md`](../git/recovery.md), [`release-policy.md`](release-policy.md).
