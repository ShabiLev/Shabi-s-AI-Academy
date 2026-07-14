# Pull Request

## Purpose

PR title/description conventions and required test-plan content, so a
reviewer can understand what changed and how it was verified without
re-deriving it from the diff alone.

## Rules

- PR title stays short (under ~70 characters) and follows the same
  Conventional Commits `type(scope): description` shape as
  [`commit-policy.md`](commit-policy.md), summarizing the overall change,
  not the last commit.
- PR description includes, at minimum:
  - **Summary** — what changed and why, as 1–3 bullet points.
  - **Test plan** — a checklist of what was actually run (or must be run)
    to validate the change, referencing real npm scripts
    (`../quality/test-selection.md`) rather than generic "tested manually."
  - Any manual/UX review status per
    [`../quality/manual-review.md`](../quality/manual-review.md) — never
    presented as automated if it wasn't.
- Before opening a PR, gather actual branch state (`git status`,
  `git diff`, `git log [base]...HEAD`) so the description reflects every
  commit that will be included, not just the most recent one.
- A PR is created only after commits exist on a task branch per
  [`branch-strategy.md`](branch-strategy.md); it is not used as a
  substitute for committing.
- Pushing the branch to open a PR still requires the same push
  authorization as any other push — see [`git-policy.md`](git-policy.md).
- Do not fabricate CI status, review approvals, or test results in a PR
  description.

## Review checklist

- Does the title stay under ~70 characters and use Conventional Commits
  shape?
- Does the test plan reference real, run commands?
- Does the description cover the full commit range since divergence from
  the base branch, not just the latest commit?

## Related

[`git-policy.md`](git-policy.md), [`../quality/manual-review.md`](../quality/manual-review.md),
[`../release/release-report.md`](../release/release-report.md).
