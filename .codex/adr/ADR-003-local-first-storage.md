# ADR-003: Local-First Storage

- Status: Accepted
- Date: 2026-07-12

## Context

The Academy is a demo/learning app without production backend or authentication.

## Decision

Persist user-owned settings and work through validated, versioned, bounded local adapters.

## Alternatives considered

Mandatory backend now; raw component-level localStorage access.

## Consequences

Offline use and simple deployment; no cross-device sync and browser clearing loses data.

## Risks

Corruption, quota, and shared-device privacy.

## Follow-up work

Maintain migrations/export; design backend sync separately.

## Related documents

[Architecture overview](../architecture/overview.md), [security](../standards/security.md), [Sprint 7 master specification](../sprint-7/00-master-spec.md).
