# MCP Security

## Purpose

Classification and required controls for MCP (Model Context Protocol)
tools by risk tier. This repository has no live MCP integration today
(see [`../knowledge/mcp.md`](../knowledge/mcp.md)); this file governs any
future integration.

## Risk tiers

Every MCP tool must be classified into at least one of these tiers before
it may be used or exposed to an agent:

1. **Read-only** — retrieves information, no state change (e.g. read a
   file, query a table).
2. **Write-capable** — creates or modifies state that is not easily
   reversible by re-reading (e.g. write a file, insert a row).
3. **Destructive** — deletes or overwrites state, or has effects outside
   this repository/workspace (e.g. delete data, drop a table, cancel an
   order).
4. **External network** — makes an outbound call to a third-party service
   or endpoint not controlled by this project.
5. **Credential-bearing** — requires or transmits an API key, token, or
   other secret to operate.
6. **High-risk** — any tool that is write-capable or destructive *and*
   external-network or credential-bearing at the same time; also anything
   touching money, customer communications, or production infrastructure.

A tool can belong to more than one tier; the strictest applicable tier's
controls govern.

## Required controls, by tier

| Control | Read-only | Write-capable | Destructive | External network | Credential-bearing | High-risk |
|---|---|---|---|---|---|---|
| Explicit tool contract (documented inputs/outputs/side effects) | required | required | required | required | required | required |
| Least privilege (narrowest scope/permissions that work) | recommended | required | required | required | required | required |
| Approval before execution (ADR-010) | not required | required | required | recommended | recommended | required |
| Input validation | required | required | required | required | required | required |
| Output validation | required | required | required | required | required | required |
| Audit event recorded | recommended | required | required | required | required | required |
| Timeout | required | required | required | required | required | required |
| Retry limit (no unbounded retry) | required | required | required | required | required | required |
| Secret isolation (never in agent-visible logs/output) | n/a | recommended | recommended | required | required | required |
| Defined failure handling (fail closed, not silently ignored) | required | required | required | required | required | required |
| No silent action (user/agent sees what happened) | recommended | required | required | required | required | required |

## Rules

- No destructive write action executes without explicit human approval in
  the current session, per ADR-010
  (`../../.codex/adr/ADR-010-human-approval-for-risky-actions.md`). This
  is not satisfied by a prior blanket approval or an assumed "the user
  probably wants this."
- A tool that is both write-capable and credential-bearing (e.g. it holds
  its own API key to call an external service) is High-risk by default and
  requires the full control set above, even if individual actions look
  low-impact.
- Adding a new MCP integration is classified "MCP integration" in
  `../loaders/task-classifier.md`, which is Critical-risk and normally
  prohibited without explicit, separate authorization per `../master.md` §3.
- Secrets required by an MCP tool are never passed through agent-visible
  prompt context, logs, or evidence — see [`secrets.md`](secrets.md).

## Related

[`security-policy.md`](security-policy.md), [`../knowledge/mcp.md`](../knowledge/mcp.md),
[`../../.codex/adr/ADR-010-human-approval-for-risky-actions.md`](../../.codex/adr/ADR-010-human-approval-for-risky-actions.md).
