# ADR-005: Starter Catalog Separation

- Status: Accepted
- Date: 2026-07-12

## Context

Built-in prompts and agents have different ownership and lifecycle from learner content.

## Decision

Keep catalogs immutable and read-only; explicit import creates attributed editable local copies with new IDs.

## Alternatives considered

Preloading catalogs into personal storage; editing built-ins in place.

## Consequences

Honest counts, provenance, and safe updates; duplicate UX is required.

## Risks

Drift between imported copies and updated catalogs.

## Follow-up work

Preserve hashes/source IDs and define migration/update policy.

## Related documents

[Architecture overview](../architecture/overview.md), [security](../standards/security.md), [Sprint 7 master specification](../sprint-7/00-master-spec.md).
