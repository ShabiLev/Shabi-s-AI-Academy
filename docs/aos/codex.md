# Codex and the AOS

How OpenAI Codex bootstraps into the AOS in this repository.

## Entry point

Codex's bootstrap file is [`../../.codex/workflows/aos.md`](../../.codex/workflows/aos.md).
It is intentionally thin — a pointer, not a workflow — and must never grow
full workflow rules, test-selection logic, security policy, or Git policy;
those live once, in `.agent/`, per
[`../../.agent/compatibility.md`](../../.agent/compatibility.md). If a rule
needs adding, it belongs in the relevant `.agent/` module, referenced from
here, not duplicated here.

## What the bootstrap file tells Codex to do, in order

1. Read [`../../.agent/master.md`](../../.agent/master.md) for the loading
   sequence, precedence, task classification, and stop conditions.
2. Identify the task type using
   [`../../.agent/loaders/task-classifier.md`](../../.agent/loaders/task-classifier.md).
3. Load the modules mapped to that task type from
   [`../../.agent/registry.json`](../../.agent/registry.json) — never the
   entire `.agent/` tree.
4. Read the active `.codex/` release specification referenced by
   [`../../AGENTS.md`](../../AGENTS.md).
5. Use the evidence workflow
   ([`../../.agent/quality/evidence.md`](../../.agent/quality/evidence.md)
   and `npm run quality:evidence:*`), saving results under
   `quality/execution/latest/`.
6. Write a handoff per
   [`../../.agent/handoff/handoff-policy.md`](../../.agent/handoff/handoff-policy.md)
   if the task is not finished when Codex stops.
7. Stop before `git push` / `git merge` unless the user has explicitly
   authorized it in the current session.

## What stays Codex-specific

- `.codex/` remains Codex's home directory for architecture, standards,
  prompt templates, and release specifications — AOS orchestrates *when*
  those get read, it does not relocate or replace them.
- Codex uses the repository tools available in VS Code (file edit,
  terminal, search) as its execution surface.
- Existing `.codex/release-*/` and `.codex/sprint-*/` workflows are
  preserved exactly as they are.

## Cross-agent consistency

`npm run aos:check` verifies the Codex and Claude Code bootstrap files stay
equivalent: neither contains full workflow rules, both point to
`.agent/master.md`, and both reference `AGENTS.md` plus their own
agent-specific inspection step. See
[`../../.agent/compatibility.md`](../../.agent/compatibility.md) and
[`claude-code.md`](claude-code.md) for the Claude Code side of the same
contract.
