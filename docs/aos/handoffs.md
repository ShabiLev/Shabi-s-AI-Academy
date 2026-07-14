# The handoff protocol

How work continues cleanly when one agent stops before a task is finished
and another agent — a different AOS role, or a different agent family
(Codex ↔ Claude Code) — picks it up. Full detail lives in
[`../../.agent/handoff/`](../../.agent/handoff/).

## When a handoff is required

- Before stopping a task that is not fully complete (token/context limit,
  end of session, or a deliberate pause).
- Whenever work moves from one operational role to another (e.g.
  `developer` to `qa-engineer` — see
  [`../../.agent/agents/`](../../.agent/agents/)).
- Whenever a different agent family will resume the task.
- Before a release moves from QA to release management, or from security
  review to release management.

See [`../../.agent/handoff/handoff-policy.md`](../../.agent/handoff/handoff-policy.md)
for the authoritative statement of these triggers and required fields.

## Required fields

Every handoff document, per
[`../../.agent/handoff/handoff-template.md`](../../.agent/handoff/handoff-template.md),
includes: task, scope, branch, starting commit, latest commit, files
changed, tests executed, evidence path, open failures, warnings, manual
review state, next action, and prohibited assumptions. A missing or
unavailable field is recorded as such ("not run", "not applicable") — never
omitted silently and never invented. A handoff describes real state only;
it does not replace the final report required by
[`../../.agent/workflow/final-report.md`](../../.agent/workflow/final-report.md) —
for a completed task, both are produced.

## Cross-agent resume sequence (Codex ↔ Claude Code)

[`../../.agent/handoff/agent-switch.md`](../../.agent/handoff/agent-switch.md)
defines the exact 10-step sequence the resuming agent follows, in either
direction:

1. Read `.agent/master.md`.
2. Read the active task prompt under `.agent/prompts/`.
3. Read the latest handoff document.
4. Read `quality/execution/latest/summary.md`.
5. Verify actual Git state against what the handoff claims.
6. Verify actual changed files against the handoff's file list.
7. Re-run focused tests for the affected area.
8. Continue the task without unnecessarily repeating completed work.
9. Preserve existing commits — no amend, rebase, or history rewrite of the
   other agent's work.
10. If stopping again, produce a new handoff.

Steps 5–7 (verification against real state) are never skipped, even if the
handoff looks complete and recent — this is what makes cross-agent handoff
safe when state may have drifted since the handoff was written.

## Role-to-role handoff contracts

| File | Contract |
| --- | --- |
| [`developer-to-qa.md`](../../.agent/handoff/developer-to-qa.md) | Developer → QA engineer. |
| [`qa-to-release.md`](../../.agent/handoff/qa-to-release.md) | QA engineer → release manager. |
| [`security-to-release.md`](../../.agent/handoff/security-to-release.md) | Security reviewer → release manager. |
| [`research-to-content.md`](../../.agent/handoff/research-to-content.md) | Research agent → knowledge curator. |

## Where handoffs live

Handoff documents are lightweight Markdown, tracked in Git like any other
`.agent/` content — distinct from the gitignored
`quality/execution/runs/`. Browse recorded handoffs at `/aos/handoffs`.
