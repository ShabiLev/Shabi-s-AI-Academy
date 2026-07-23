# Cleanup

## Purpose

Safe branch/worktree cleanup rules — never delete without confirming the
target isn't in-progress work.

## Rules

- Before deleting any branch, confirm it is actually merged or explicitly
  abandoned: run `git merge-base --is-ancestor <branch> <target>` (see
  [`merge-policy.md`](merge-policy.md)) or check with the user directly.
  A branch name that "looks old" or "looks like a duplicate" is not
  sufficient evidence.
- Never run `git branch -D` (force delete) as a routine cleanup step.
  `git branch -d` (safe delete, refuses if unmerged) is preferred, and its
  refusal is a signal to investigate, not to switch to `-D`.
- Before removing a worktree (`git worktree remove`), confirm it has no
  uncommitted changes (`git -C <path> status`) and that its branch has
  been handled per the branch-deletion rule above.
- Stash entries are not deleted (`git stash drop`/`clear`) without
  confirming their content is no longer needed — `git stash show -p
  <ref>` first if there's any doubt about what they contain.
- Cleanup of generated/large artifacts (e.g. under
  `quality/runtime/execution/runs/`, already gitignored per `../master.md`
  principle 14) is safe to do more freely since it's regenerable, but
  still confirm nothing there is the only copy of something needed.
- When in doubt about whether something is "in-progress work," treat it as
  in-progress and ask, per [`recovery.md`](recovery.md)'s
  reversible-over-destructive preference.

## Review checklist

- Was containment/merge status actually verified before deleting a branch?
- Was `-D`/force-delete avoided in favor of the safe delete, or explicitly
  justified?
- Was worktree/stash content checked before removal?

## Related

[`git-policy.md`](git-policy.md), [`recovery.md`](recovery.md),
[`merge-policy.md`](merge-policy.md).
