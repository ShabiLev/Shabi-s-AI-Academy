# Storage Architecture

## Purpose

Define safe local persistence until a backend exists.

## Current state

Course progress, settings, prompts, agents, QA data, and versioned checklist state are stored locally through feature-specific adapters.

## Decision and constraints

Every key has a schema/version, parser, safe default, and bounded data policy. Writes serialize user-owned data only. Malformed content is quarantined or replaced safely without crashing.

## Dependency boundaries

Storage adapters depend on domain types; UI never parses localStorage. Built-in catalogs and secrets are never persisted as personal data.

## Anti-patterns

Unbounded histories, raw JSON.parse in components, silent migration data loss, storing API keys, or writing full external datasets.

## Testing impact

Unit-test valid, legacy, malformed, oversized, and unavailable-storage cases. E2E verifies refresh and isolation.

## Future evolution

A future backend requires migration, synchronization, conflict, deletion, and privacy ADRs.

## Related documents

[Security](security.md), [state](state-management.md), [ADR-003](../adr/ADR-003-local-first-storage.md), [runtime](../sprint-7/01-runtime.md).
