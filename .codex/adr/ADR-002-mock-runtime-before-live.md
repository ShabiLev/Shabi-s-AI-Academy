# ADR-002: Mock Runtime Before Live

- Status: Accepted
- Date: 2026-07-12

## Context

Agent blueprints exist but live providers would introduce secrets, cost, nondeterminism, and misleading status.

## Decision

Ship deterministic Mock and Dry Run modes first; reserve and disable Live Run in 0.7.0.

## Alternatives considered

Immediate browser API integration; no runtime until live integration.

## Consequences

Learners can inspect execution safely; live value is deferred.

## Risks

Mock behavior may be mistaken for provider behavior unless clearly labelled.

## Follow-up work

Add secure live architecture and contract tests in a later ADR.

## Related documents

[Architecture overview](../architecture/overview.md), [security](../standards/security.md), [Sprint 7 master specification](../sprint-7/00-master-spec.md).
