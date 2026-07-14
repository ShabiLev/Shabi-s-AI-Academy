# Recovery

## Purpose

Safe recovery steps for a broken branch/merge/rebase state without
discarding user work — investigation always comes before any destructive
action.

## Rules

- **Investigate before acting.** On encountering unfamiliar repository
  state — an unfinished merge (`MERGE_HEAD` present), an unfinished rebase
  (`.git/rebase-merge` or `.git/rebase-apply` present), unknown branches,
  or unexpected stash entries — run `git status`, `git log --oneline --all -n 20`,
  `git branch -a`, and `git stash list` before doing anything else. Do not
  guess what happened; read the actual state.
- **Prefer reversible operations over deletion.** When something needs to
  be set aside to make progress, use `git stash push` (with `-u` if
  untracked files matter) or rename/move work to a new branch
  (`git branch <backup-name>`) rather than deleting it. A branch or stash
  entry that turns out to be unneeded can be cleaned up later, deliberately,
  per [`cleanup.md`](cleanup.md) — but a deleted one cannot be brought back
  by realizing the mistake.
- Never run `git reset --hard`, `git checkout -- .`, `git clean -f`, or
  `git branch -D` as a first response to a confusing state. These are only
  used after the state is understood and the user has explicitly
  authorized discarding the specific thing being discarded.
- An unfinished merge or rebase is resolved by finishing it
  (`git merge --continue` / `git rebase --continue` after resolving
  conflicts) or explicitly aborting it (`git merge --abort` /
  `git rebase --abort`) — both are safe, reversible-in-intent operations;
  choose based on what the user wants, not by default to whichever is
  easier to type.
- If work appears to be at risk of loss (e.g. commits only reachable via
  reflog), use `git reflog` to locate it before concluding it's gone.
- After any recovery action, run `git status` and `git log` to confirm the
  repository is now in the expected, described state — do not assume the
  recovery worked.

## Review checklist

- Was the unfamiliar state actually investigated (status/log/branch/stash)
  before any action was taken?
- Was a reversible option (stash, rename, reflog) preferred over deletion?
- Did the final `git status` confirm the intended recovered state?

## Related

[`git-policy.md`](git-policy.md), [`synchronization.md`](synchronization.md),
[`cleanup.md`](cleanup.md).
