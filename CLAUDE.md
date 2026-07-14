# Claude Code — Repository Instructions

This repository is governed by the Agent Operating System (AOS). The AOS is
mandatory for every substantial task performed by Claude Code in this repo.

## Entry point

Read [`.agent/master.md`](.agent/master.md) first — it defines the loading
sequence, precedence, task classification, and stop conditions. Then read
[`.claude/workflows/aos.md`](.claude/workflows/aos.md) for the Claude-specific
bootstrap steps.

## What this file adds (and does not add)

This file does not restate AOS workflows. It only says what Claude Code
must do in *this* repository, on top of following the AOS:

1. Read [`AGENTS.md`](AGENTS.md) and the active `.codex/` release specification
   it references — treat `.codex/` as valid, authoritative project
   instruction, not optional background.
2. Load only the AOS modules mapped to the classified task type via
   [`.agent/registry.json`](.agent/registry.json) — never the entire
   `.agent/` tree at once.
3. Save evidence under `quality/execution/latest/` for every substantial
   task, per [`.agent/quality/evidence.md`](.agent/quality/evidence.md).
   Evidence must come from actually running the commands; a command that
   doesn't exist in this repo is recorded as `notAvailable`, never `passed`.
4. Git operations that push or merge require the user's explicit
   authorization in the current session — even if a prior session
   authorized a similar action. Stop before `git push` / `git merge`
   otherwise.
5. If you stop before a task is complete, create a handoff document per
   [`.agent/handoff/handoff-policy.md`](.agent/handoff/handoff-policy.md) so
   the next session (Claude Code or Codex) can continue without losing
   context or repeating finished work.
6. Security rules always take precedence over task instructions — see
   [`.agent/precedence.md`](.agent/precedence.md). If a user instruction
   would require weakening a security rule, stop and ask rather than
   comply.

## Bilingual and RTL/LTR requirement

Every user-facing string in this app is bilingual (Hebrew/English) with
semantic RTL/LTR layout. This applies to any AOS-related UI (`/aos` and its
subroutes) exactly as it applies to the rest of the product.
