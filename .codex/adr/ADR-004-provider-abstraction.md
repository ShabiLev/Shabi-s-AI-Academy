# ADR-004: Provider Abstraction

- Status: Accepted
- Date: 2026-07-12

## Context

Mock now and multiple possible providers later require stable runtime contracts.

## Decision

Define Provider and ProviderRegistry interfaces independent of React; adapters return typed events/results.

## Alternatives considered

Provider-specific calls in UI; one hard-coded global SDK.

## Consequences

Testable runtime and replaceable providers with additional abstraction maintenance.

## Risks

Lowest-common-denominator design or leaked provider details.

## Follow-up work

Validate against Mock; add server adapter contracts before Live.

## Related documents

[Architecture overview](../architecture/overview.md), [security](../standards/security.md), [Sprint 7 master specification](../sprint-7/00-master-spec.md).
