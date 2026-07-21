# Memory Policy

## Purpose

Establishes that AOS memory is explicit and file-based only — there is no
hidden or assumed agent memory. Anything an agent needs to recall across
sessions must be written to one of the files described below, or it does
not persist.

## Principle

An agent must never assume it "remembers" a decision, a fact, or a prior
result from an earlier conversation or session unless that information is
recorded in one of the memory files in `.agent/memory/`. If it is not
written down, it is not known.

## Categories

Durable, hand-authored memory remains under `.agent/memory/`. Mutable task,
quality, release, progress, and handoff summaries are generated under the
ignored `.agent/runtime/memory/` directory and are never release proof.

Historical generated Markdown already committed under `.agent/memory/` is
retained for compatibility, but tools must not update or present it as current.

1. **Stable project facts** — see `.agent/memory/project-memory.md`.
2. **Architecture decisions** — see `.agent/memory/decision-memory.md`.
3. **Accepted conventions** — see `.agent/memory/project-memory.md`.
4. **Current task state** — see `.agent/memory/task-memory.md`.
5. **Known failures** — see `.agent/memory/failure-memory.md`.
6. **Research findings** — see `.agent/memory/research-memory.md`.
7. **Rejected approaches** — see `.agent/memory/failure-memory.md`.
8. **Pending reviews** — see `.agent/memory/task-memory.md`.

## What memory must NEVER store

- Passwords, API keys, tokens, or any credential.
- Private user data of any kind.
- Raw environment values (`.env` contents, connection strings, provider
  secrets).
- Anything `.agent/security/secrets.md` or `.agent/security/logging.md`
  prohibits from logs or committed files.

If a fact worth remembering would require recording one of the above,
record that the fact exists and where it lives (e.g. "the API key is in
the deployment platform's secret manager"), never the value itself.

## Rules

- Durable memory files are plain Markdown, human-reviewable, and tracked in Git.
- Generated runtime memory is ignored and may be deleted or recreated without a
  commit. `npm run memory:update` writes only `.agent/runtime/`.
- An entry must state where it came from (which task, decision, or
  research effort) so it can be traced back.
- Stale or superseded entries are marked as such, not deleted silently —
  see each category file for its own update rule.
- Memory is not a substitute for the handoff documents in `.agent/handoff/`
  — a handoff describes one task's state; memory describes durable facts
  that outlive any single task.

## Relationship to other modules

- `.agent/knowledge/memory.md` is the project-facing pointer into this
  policy for feature/agent-creation tasks.
- `.agent/handoff/handoff-template.md` covers task-scoped state; this
  policy covers durable, cross-task state.
