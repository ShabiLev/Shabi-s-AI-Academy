# Codex AOS Bootstrap

This file is a pointer, not a workflow. The Agent Operating System lives at
[`.agent/`](../../.agent/); this file only tells Codex how to get there.

## Do this, in order

1. Read [`.agent/master.md`](../../.agent/master.md) — the AOS orchestration
   entry point (loading sequence, precedence, task classification, stop
   conditions).
2. Identify the task type using [`.agent/loaders/task-classifier.md`](../../.agent/loaders/task-classifier.md).
3. Load the modules mapped to that task type from
   [`.agent/registry.json`](../../.agent/registry.json). Do not load the
   entire `.agent/` tree.
4. Read the active `.codex/` release specification referenced by
   [`AGENTS.md`](../../AGENTS.md) (currently
   [`.codex/release-1.4-aos/00-master-spec.md`](../release-1.4-aos/00-master-spec.md)).
5. Use the evidence workflow: [`.agent/quality/evidence.md`](../../.agent/quality/evidence.md)
   and `npm run quality:evidence:*`, saving results under
   `quality/execution/latest/`.
6. Resume from the explicit sanitized state linked by `.agent/master.md`,
   then verify Git and focused tests before trusting it.
7. If the task is not finished when you stop, update memory and create a handoff per
   [`.agent/handoff/handoff-policy.md`](../../.agent/handoff/handoff-policy.md)
   so Claude Code (or a future Codex session) can continue.
8. Stop before `git push` / `git merge` unless the user has explicitly
   authorized it in the current session.

## What this file must never contain

Full workflow rules, test-selection logic, security policy, or Git policy.
Those live once, in `.agent/`, per [`.agent/compatibility.md`](../../.agent/compatibility.md).
If you find yourself adding a rule here instead of in `.agent/`, stop — put
it in the correct module and link to it instead.

## Codex-specific notes

- `.codex/` remains Codex's home for architecture, standards, prompt
  templates, and release specifications. AOS does not move or replace any
  of it.
- Use the repository tools available in VS Code as your execution surface.
- Preserve existing `.codex/release-*/` and `.codex/sprint-*/` workflows
  exactly as they are.
