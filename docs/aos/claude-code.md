# Claude Code and the AOS

How Claude Code bootstraps into the AOS in this repository.

## Entry point

Claude Code's bootstrap file is
[`../../.claude/workflows/aos.md`](../../.claude/workflows/aos.md). Like the
Codex bootstrap, it is a pointer, not a workflow — it must never contain
full workflow rules, test-selection logic, security policy, or Git policy;
those live once, in `.agent/`, per
[`../../.agent/compatibility.md`](../../.agent/compatibility.md).

## What the bootstrap file tells Claude Code to do, in order

1. Read [`../../.agent/master.md`](../../.agent/master.md) for the loading
   sequence, precedence, task classification, and stop conditions.
2. Read [`../../CLAUDE.md`](../../CLAUDE.md) (repository-local) and any
   user-global `CLAUDE.md` instructions already loaded into context.
3. Read [`../../AGENTS.md`](../../AGENTS.md).
4. Read the active `.codex/` release specification referenced by
   `AGENTS.md` — treated as valid, authoritative project instruction, not
   optional background, even though it lives under a differently-named
   directory.
5. Identify the task type using
   [`../../.agent/loaders/task-classifier.md`](../../.agent/loaders/task-classifier.md)
   and load the mapped modules from
   [`../../.agent/registry.json`](../../.agent/registry.json).
6. Save evidence per
   [`../../.agent/quality/evidence.md`](../../.agent/quality/evidence.md)
   under `quality/execution/latest/`.
7. Write a handoff per
   [`../../.agent/handoff/handoff-policy.md`](../../.agent/handoff/handoff-policy.md)
   if it stops before the task is complete.
8. Stop before `git push` / `git merge` unless the user has explicitly
   authorized it in the current session.

## How `CLAUDE.md` and AOS relate

`CLAUDE.md` (both the repository-local file and any user-global one) sits
at precedence tier 2 — system/repository-level instructions — one tier
above the AOS master and its modules (tier 5). See
[`../../.agent/precedence.md`](../../.agent/precedence.md). In practice this
means a `CLAUDE.md` rule can constrain how AOS guidance is applied, but AOS
security, authorization, and evidence requirements are never optional
because a task instruction did not mention them.

## What stays Claude-specific

- Claude Code inspects `.claude/` for skills, agents, and settings already
  configured for this repository before assuming a capability doesn't
  exist.
- `.codex/` architecture and release documents are treated as valid,
  authoritative project instructions — never skipped because they live
  under a differently-named directory.
- Claude Code does not create Claude-specific duplicates of Codex artifacts
  (e.g. no `.claude/standards/security.md` copying
  `.codex/standards/security.md` — reference the original instead).

## Cross-agent consistency

See [`codex.md`](codex.md) for the equivalent Codex bootstrap and
[`../../.agent/compatibility.md`](../../.agent/compatibility.md) for the
`npm run aos:check` consistency checks both entry points must pass.
