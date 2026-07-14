# Git

## Purpose

Point to the single source of truth for Git behavior in this repo so an
agent doesn't invent commands from memory.

## Authoritative source(s)

- [.codex/standards/git.md](../../.codex/standards/git.md)
- `.agent/git/git-policy.md`, `.agent/git/branch-strategy.md`,
  `.agent/git/commit-policy.md`, `.agent/git/synchronization.md`,
  `.agent/git/recovery.md`, `.agent/git/pull-request.md`,
  `.agent/git/cleanup.md` (see `.agent/manifest.json` for each module's
  one-line purpose)

## Project-specific interpretation

This project observes standard Conventional Commits (see the repo's actual
history, e.g. `test(quality): persist execution evidence`,
`fix(docs): add missing Release 1.3 handoff`) and task branches named by
type/scope (e.g. `feature/1.4.0-agent-operating-system`,
`test/1.3.0-quality-evidence`). AOS's Git rules (`.agent/git/`) sit on top of
this and are stricter about generating commands from live `git status`/`git
log` output rather than assumption, and about never pushing or merging
without explicit in-session authorization (`master.md` §7, §9).

## Constraints

- Inspect `git status`/`git diff` before staging; stage intentionally, never
  a blind `git add -A`.
- One Conventional Commit per logical change; never `--amend` a commit that
  a hook rejected — fix and create a new commit instead.
- Never `reset --hard`, force-push, or rewrite published history without
  explicit user authorization.
- Never push or merge without explicit authorization given in the current
  session, per `master.md` §7 and §9.

## Known limitations

- This file does not restate branch-naming or commit-message rules in
  detail; those live only in `.agent/git/branch-strategy.md` and
  `.agent/git/commit-policy.md` — read those directly for the exact format
  when performing a Git-classified task.
- No repo-side commit-msg hook enforces Conventional Commits automatically;
  compliance is agent- and reviewer-enforced.

## Current implementation status

In effect today: Conventional Commit history, task-branch workflow,
human-authorized push/merge. Not automated: commit-message format
enforcement via a git hook.
