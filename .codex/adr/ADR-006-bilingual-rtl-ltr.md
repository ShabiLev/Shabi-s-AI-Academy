# ADR-006: Bilingual RTL and LTR

- Status: Accepted
- Date: 2026-07-12

## Context

Hebrew and English are core product languages, not optional localization.

## Decision

Translate all UI and implement direction semantically with logical layouts and equal testing.

## Alternatives considered

Hebrew-only UI; visual CSS reversal; separate duplicated page trees.

## Consequences

Inclusive equivalent workflows; every feature carries translation/layout cost.

## Risks

Long copy and native controls expose layout regressions.

## Follow-up work

Typed keys, viewport tests, axe, and representative visuals.

## Related documents

[Architecture overview](../architecture/overview.md), [security](../standards/security.md), [Sprint 7 master specification](../sprint-7/00-master-spec.md).
