# Commit Policy

## Purpose

Conventional Commits rules and required commit granularity, so history
stays reviewable and each commit tells an honest, scoped story.

## Rules

- Every commit message follows [Conventional Commits](https://www.conventionalcommits.org/):
  `<type>(<scope>): <description>`, e.g.
  `docs(engineering): complete Engineering Kit and Sprint 7 specs` (the
  existing example in `../../.codex/standards/git.md`). Common types:
  `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `build`, `ci`.
- **No blind `git add -A` or `git add .`.** Run `git status` first, review
  the full list of changed/untracked files, and stage specific paths by
  name. This prevents sweeping in secrets, generated artifacts, or
  unrelated in-progress files — see [`../security/secrets.md`](../security/secrets.md).
- Before staging, run `git diff` (and `git diff --cached` if anything is
  already staged) to confirm the actual content matches what the commit
  message will claim.
- One logical change per commit where practical; do not bundle an
  unrelated fix into a feature commit or vice versa.
- Never stage or commit files that look like they contain secrets or
  credentials (`.env`, `credentials.json`, key files) — warn the user if
  they specifically ask for this.
- Never use `--amend` unless the user explicitly requests it — create a
  new commit instead, per `../../.codex/standards/git.md` and
  `../master.md`. This is especially important after a failed pre-commit
  hook: the failed attempt did not produce a commit, so amending would
  target the previous, unrelated commit.
- Never skip commit hooks (`--no-verify`) or bypass signing
  (`--no-gpg-sign`, `-c commit.gpgsign=false`) unless the user explicitly
  asks for it.
- After committing, run `git status` (and `git log -1` if useful) to
  verify the commit succeeded and the tree is in the expected state.

## Review checklist

- Are staged files exactly the intended set (names, not just count)?
- Does the message's type/scope match what actually changed?
- Did `git status` after the commit confirm success and an otherwise clean
  tree?

## Related

[`git-policy.md`](git-policy.md), [`../security/secrets.md`](../security/secrets.md),
[`../../.codex/standards/git.md`](../../.codex/standards/git.md).
