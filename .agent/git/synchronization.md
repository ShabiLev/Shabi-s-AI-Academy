# Synchronization

## Purpose

How to generate exact fetch/pull/merge commands from actual branch state,
rather than from memory or assumption — this is `../master.md` non-negotiable
principle 10 made concrete.

## Rules

- Before generating any sync command, gather actual state:
  `git status`, `git branch -vv` (shows tracking/ahead-behind), and
  `git log --oneline -n 10` for both the local branch and, if relevant,
  `origin/<branch>` after a `git fetch`.
- Never write a fetch/pull/merge command that references a branch name,
  remote, or commit SHA that hasn't been confirmed to exist in the output
  just gathered.
- Prefer `git fetch` followed by an explicit, reviewed
  `git merge origin/<branch>` (or rebase, if that is this repository's
  convention and the user prefers it) over a bare `git pull`, so the
  incoming changes can be inspected before they're integrated.
- If the local branch has diverged from its remote tracking branch
  (commits on both sides), stop and describe the divergence rather than
  resolving it with a guessed strategy — this is exactly the kind of
  unfamiliar state [`recovery.md`](recovery.md) covers.
- Any conflict encountered during a sync operation is investigated and
  resolved deliberately; conflict markers are never left in committed
  files, and resolution choices are reported, not silently made.

## Review checklist

- Was `git fetch`/`git status`/`git branch -vv` run before constructing
  the sync command?
- Does the command reference only branches/commits confirmed to exist?
- If divergence existed, was it reported before any resolution was
  attempted?

## Related

[`git-policy.md`](git-policy.md), [`recovery.md`](recovery.md),
[`merge-policy.md`](merge-policy.md).
