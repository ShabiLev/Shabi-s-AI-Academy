# Handoff Policy

## Purpose

Defines when an agent must write a handoff document and what every handoff
must contain, so the next agent (a different AOS role, or a different agent
family — Codex or Claude Code) can continue without re-deriving context or
repeating completed work.

## When a handoff is required

- Before stopping a task that is not fully complete (token/context limit,
  end of session, or a deliberate pause).
- Whenever work moves from one operational role to another (e.g.
  `developer` to `qa-engineer`), per the role definitions in
  `.agent/agents/`.
- Whenever a different agent family will resume the task (Codex to Claude
  Code, or vice versa) — see `.agent/handoff/agent-switch.md` for the exact
  resume sequence.
- Before a release moves from QA to release management, or from security
  review to release management.

## Required fields

Every handoff document must include, at minimum, the fields defined in
`.agent/handoff/handoff-template.md`: task, scope, branch, starting commit,
latest commit, files changed, tests executed, evidence path, open failures,
warnings, manual review, next action, prohibited assumptions.

## Rules

- A handoff must describe real state — actual branch/commit, actual test
  results, actual evidence paths. Never fabricate any field.
- A missing or unavailable field must be recorded as such (e.g. "not run",
  "not applicable") — never omitted silently and never invented.
- A handoff does not replace the final report required by
  `.agent/workflow/final-report.md`; for a completed task, both are
  produced.
- The receiving role/agent must read the latest handoff before doing any
  new work (see `.agent/handoff/agent-switch.md`).

## Where handoffs are stored

Handoff documents are lightweight Markdown files describing task state at a
point in time; they are not large generated artifacts and are tracked in
Git like any other `.agent/` content, distinct from the gitignored
`quality/execution/runs/`.

## Relationship to other modules

- `.agent/handoff/handoff-template.md` — the field structure every handoff
  follows.
- `.agent/handoff/agent-switch.md` — the exact resume sequence for a
  cross-agent handoff.
- `.agent/handoff/research-to-content.md`, `developer-to-qa.md`,
  `qa-to-release.md`, `security-to-release.md` — specific role-to-role
  contracts using this same field set.
