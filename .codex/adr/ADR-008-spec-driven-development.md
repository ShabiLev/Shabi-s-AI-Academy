# ADR-008: Specification-Driven Development

- Status: Accepted
- Date: 2026-07-12

## Context

Sprint 7 spans runtime, catalogs, playfields, storage, UX, and safety; implicit requirements would diverge.

## Decision

The active master spec and linked modules control implementation, acceptance, tests, version, and commit.

## Alternatives considered

Ticket-only delivery; code-first discovery without decisions; prose disconnected from tests.

## Consequences

Reviewable scope and handoff; docs require maintenance.

## Risks

Specifications can become stale or overconstrain learning.

## Follow-up work

Update spec with behavior and use ADRs for durable deviations.

## Related documents

[Architecture overview](../architecture/overview.md), [security](../standards/security.md), [Sprint 7 master specification](../sprint-7/00-master-spec.md).
