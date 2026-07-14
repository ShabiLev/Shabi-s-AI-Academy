# AOS Git policy

A summary of the Git rules AOS enforces for any agent working in this
repository. Full detail lives in
[`../../.agent/git/`](../../.agent/git/); this page only orients you to
which file to read for what.

## Non-negotiable rules

- **`main` stays stable.** All work happens on a task branch, never directly
  on `main`. See
  [`../../.agent/git/branch-strategy.md`](../../.agent/git/branch-strategy.md).
- **Conventional Commits required** for every commit. See
  [`../../.agent/git/commit-policy.md`](../../.agent/git/commit-policy.md).
- **No blind `git add -A` / `git add .`.** Files are staged by name after
  reviewing `git status`.
- **No force push, ever**, unless the user explicitly requests it and
  understands the risk — and even then, force-pushing `main` or another
  shared branch is refused.
- **No `git reset --hard`** without explicit user authorization after being
  told what will be discarded.
- **No push or merge without explicit authorization from the user in the
  current session.** A prior approval, an implied "yes go ahead" from an
  earlier unrelated task, or the mere existence of a finished change does
  not count as authorization.
- **Git commands are generated from actual current state** — `git status`,
  `git branch`, `git log` (or equivalent) are run and read before any
  command is constructed; nothing is assumed or invented.

## Branch naming

`<type>/<short-description>`, where `<type>` is one of `feature`, `fix`,
`hotfix`, `refactor`, `test`, `docs`, `chore`, matching the pattern already
used in this repo's history (e.g. `feature/1.4.0-agent-operating-system`).
See
[`../../.agent/git/branch-strategy.md`](../../.agent/git/branch-strategy.md).

## Module index

| Module | Governs |
| --- | --- |
| [`branch-strategy.md`](../../.agent/git/branch-strategy.md) | Naming and lifecycle for task branches. |
| [`commit-policy.md`](../../.agent/git/commit-policy.md) | Conventional Commits rules and granularity. |
| [`merge-policy.md`](../../.agent/git/merge-policy.md) | When/how a branch may be merged; authorization. |
| [`synchronization.md`](../../.agent/git/synchronization.md) | Generating exact fetch/pull/merge commands from real state. |
| [`recovery.md`](../../.agent/git/recovery.md) | Safe recovery from a broken branch/merge/rebase state. |
| [`pull-request.md`](../../.agent/git/pull-request.md) | PR title/description conventions and test-plan content. |
| [`cleanup.md`](../../.agent/git/cleanup.md) | Safe branch/worktree cleanup; never delete unmerged unique work without confirmation. |

## Escalation

If a task appears to require a force push, a `reset --hard`, a push, or a
merge without the authorization above, the required behavior is to stop and
ask — per [`../../.agent/master.md`](../../.agent/master.md) §9, this is a
named stop condition, not a judgment call.

## Related

[`../../.agent/git/git-policy.md`](../../.agent/git/git-policy.md) (the
anchor module), [`../../.agent/precedence.md`](../../.agent/precedence.md),
[`../../.agent/knowledge/git.md`](../../.agent/knowledge/git.md).
