# Branch Strategy

## Purpose

Naming and lifecycle for task branches; `main` stays stable and is never
committed to directly by an agent.

## Rules

- `main` is the stable, deployable branch. No agent commits directly to
  `main`; all work happens on a task branch created from an up-to-date
  `main` (or from the branch the user is actively working on, if already
  checked out).
- Branch names are descriptive and scoped to the task type, matching the
  pattern already used in this repo's history (e.g.
  `feature/1.4.0-agent-operating-system`, `test/1.3.0-quality-evidence`,
  `fix/docs-release-handoff`): `<type>/<short-description>`, where `<type>`
  is one of `feature`, `fix`, `hotfix`, `refactor`, `test`, `docs`, `chore`.
  Include the target version when the branch is version-scoped.
- Before creating a branch, check current state with `git status` and
  `git branch` — never assume which branch is checked out. If the user is
  already on an appropriate task branch, continue on it rather than
  creating a redundant one.
- A branch lives for the duration of one task/feature. It is merged (with
  authorization, see [`merge-policy.md`](merge-policy.md)) or explicitly
  abandoned — it does not accumulate unrelated follow-on work indefinitely.
- Long-running branches must periodically sync with `main` per
  [`synchronization.md`](synchronization.md) to avoid large, risky merges
  later.
- Never delete a branch that has unmerged, unique commits without explicit
  user confirmation — see [`cleanup.md`](cleanup.md).

## Review checklist

- Does `git branch --show-current` (or equivalent) confirm work is
  happening on a task branch, not `main`?
- Does the branch name reflect the actual task type and scope?
- Has the branch been checked for drift against `main` before any merge is
  proposed?

## Related

[`git-policy.md`](git-policy.md), [`merge-policy.md`](merge-policy.md),
[`../../.codex/standards/git.md`](../../.codex/standards/git.md).
