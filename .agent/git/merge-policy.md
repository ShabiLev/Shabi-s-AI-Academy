# Merge Policy

## Purpose

When and how a branch may be merged, and the authorization requirement
that gates it — merging is treated as a deliberate, verified action, never
a routine step.

## Rules

- **No merge without explicit authorization** from the user in the current
  session. A branch being "done," tests passing, or a prior general
  go-ahead on a different task is not sufficient.
- **Before any merge, verify the branch is fully contained** relative to
  its target, in both directions:
  - `git merge-base --is-ancestor <target> <branch>` — confirms `<branch>`
    has all of `<target>`'s history (it's not stale/behind in a way that
    would silently drop target-branch work).
  - `git merge-base --is-ancestor <branch> <target>` — if this is already
    true, `<branch>` is already merged/contains nothing new; say so rather
    than merging.
  Run both checks and report their actual result before proceeding —
  never assume containment from memory or from the branch's name.
- Prefer the merge strategy already used in this repository's history
  (check recent merge commits with `git log --merges` if unsure) rather
  than introducing a new one (e.g. squash vs. merge commit) without
  discussion.
- A merge is a stop condition if: the containment checks fail
  unexpectedly, the branch has diverged significantly and a conflict is
  likely, or the target branch is `main` and no release/PR process
  (`pull-request.md`) has been followed for this repository's normal flow.
- After a merge, run `git log` and `git status` to confirm the result
  matches expectations before reporting it done.

## Review checklist

- Was explicit merge authorization given in this session?
- Did both `merge-base --is-ancestor` checks run, and what did they show?
- Does the post-merge `git status`/`git log` match the expected outcome?

## Related

[`git-policy.md`](git-policy.md), [`synchronization.md`](synchronization.md),
[`pull-request.md`](pull-request.md).
