# Git Policy

## Purpose

Top-level Git rules: no force push, no `reset --hard`, no blind
`git add -A`, and authorization required for push/merge. Every other file
in `.agent/git/` links back to this one.

## Non-negotiable rules

- **Main stays stable.** Work always happens on a task branch, never
  directly on `main`. See [`branch-strategy.md`](branch-strategy.md).
- **Conventional Commits required** for every commit. See
  [`commit-policy.md`](commit-policy.md).
- **No blind `git add -A` / `git add .`.** Stage files by name after
  reviewing `git status`, so unrelated or sensitive files are never swept
  into a commit. See [`commit-policy.md`](commit-policy.md).
- **No force push, ever**, unless the user explicitly requests it in the
  current session and understands the risk. Force-pushing `main`/shared
  branches is refused even with a request — warn instead.
- **No `git reset --hard`** unless the user explicitly authorizes it after
  being told what will be discarded. Prefer reversible alternatives
  (`git stash`, a new commit that reverts) — see [`recovery.md`](recovery.md).
- **No push without explicit user authorization in the current session.**
  A prior approval, an implied "yes go ahead" from an earlier unrelated
  task, or the mere existence of a finished change is not authorization.
- **No merge without explicit authorization**, and only after the branch
  containment check in [`merge-policy.md`](merge-policy.md) passes.
- **Git commands are always generated from actual current state** — run
  `git status`, `git branch`, `git log` (or equivalent) and read the
  output before constructing any command. Never assume or invent a branch
  name, commit SHA, or remote state.

## Module index

| File | Purpose |
|---|---|
| [`branch-strategy.md`](branch-strategy.md) | Naming and lifecycle for task branches. |
| [`commit-policy.md`](commit-policy.md) | Conventional Commits rules and granularity. |
| [`merge-policy.md`](merge-policy.md) | When/how a branch may be merged; authorization. |
| [`synchronization.md`](synchronization.md) | Generating exact fetch/pull/merge commands. |
| [`recovery.md`](recovery.md) | Safe recovery from a broken branch/merge/rebase state. |
| [`pull-request.md`](pull-request.md) | PR title/description conventions and test-plan content. |
| [`cleanup.md`](cleanup.md) | Safe branch/worktree cleanup rules. |

## Relationship to existing standards

This directory interprets and operationalizes
[`../../.codex/standards/git.md`](../../.codex/standards/git.md) for
AOS-driven agent work; it does not loosen it. Where this directory is more
specific (e.g. explicit containment checks before merge), the more
specific rule applies.

## Escalation

If a task appears to require a force push, a `reset --hard`, a push, or a
merge without the authorization this file requires, stop and ask — per
`../master.md` §9, this is a named stop condition, not a judgment call to
make silently.

## Related

[`../precedence.md`](../precedence.md), [`../workflow/development.md`](../workflow/development.md),
[`../knowledge/git.md`](../knowledge/git.md).
