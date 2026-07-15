# Claude Code AOS Bootstrap

This file is a pointer, not a workflow. The Agent Operating System lives at
[`.agent/`](../../.agent/); this file only tells Claude Code how to get
there.

## Do this, in order

1. Read [`.agent/master.md`](../../.agent/master.md) — the AOS orchestration
   entry point (loading sequence, precedence, task classification, stop
   conditions).
2. Read [`CLAUDE.md`](../../CLAUDE.md) (repository-local) and any
   user-global `CLAUDE.md` instructions already loaded into context.
3. Read [`AGENTS.md`](../../AGENTS.md).
4. Read the active [Version 1.4 AOS release specification](../../.codex/release-1.4-aos/00-master-spec.md)
   referenced by `AGENTS.md` — treat it as valid, authoritative project
   instruction, not optional background.
5. Identify the task type using [`.agent/loaders/task-classifier.md`](../../.agent/loaders/task-classifier.md)
   and load the mapped modules from [`.agent/registry.json`](../../.agent/registry.json).
6. Save evidence per [`.agent/quality/evidence.md`](../../.agent/quality/evidence.md)
   under `quality/execution/latest/`.
7. Resume from the explicit sanitized state linked by `.agent/master.md`,
   then verify Git and focused tests before trusting it.
8. Update memory and create a handoff per [`.agent/handoff/handoff-policy.md`](../../.agent/handoff/handoff-policy.md)
   if you stop before the task is complete.
9. Stop before `git push` / `git merge` unless the user has explicitly
   authorized it in the current session.

## What this file must never contain

Full workflow rules, test-selection logic, security policy, or Git policy.
Those live once, in `.agent/`, per [`.agent/compatibility.md`](../../.agent/compatibility.md).

## Claude-specific notes

- Inspect `.claude/` for skills, agents, and settings already configured for
  this repository before assuming a capability doesn't exist.
- Treat `.codex/` architecture and release documents as valid project
  instructions — do not skip them because they live under a
  differently-named directory, and do not create Claude-specific
  duplicates of Codex artifacts.
