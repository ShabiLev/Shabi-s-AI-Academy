# ADR-010: Human Approval for Risky Actions

- Status: Accepted
- Date: 2026-07-12

## Context

Future tools may propose external writes, commands, messages, or destructive actions.

## Decision

Classify tool risk and require explicit, contextual human approval before risky execution; 0.7.0 only simulates approvals.

## Alternatives considered

Implicit consent; one-time blanket approval; fully autonomous external actions.

## Consequences

Clear control and auditability with additional interaction and state.

## Risks

Approval fatigue or misleading summaries.

## Follow-up work

Test approve/reject/cancel; future connectors must supply exact action previews.

## Related documents

[Architecture overview](../architecture/overview.md), [security](../standards/security.md), [Sprint 7 master specification](../sprint-7/00-master-spec.md).
