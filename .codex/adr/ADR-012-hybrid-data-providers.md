# ADR-012: Hybrid Data Providers

- Status: Accepted
- Date: 2026-07-14

## Context

Account users need optional cloud persistence without weakening the local-first application or discarding offline changes.

## Decision

Domain repositories depend on a small `DataProvider` contract. Local, Supabase, and hybrid implementations share that contract. Hybrid writes locally first, adds an idempotent mutation to a persistent queue capped at 100 entries, and flushes only when explicitly requested. Retry uses bounded exponential backoff. A synchronized status is emitted only after the remote provider confirms every queued mutation.

## Alternatives considered

Direct table calls from UI components; cloud-only storage; uncontrolled background polling; unbounded retry queues.

## Consequences

Features remain usable offline and provider-specific code stays centralized. Sync conflicts and migration decisions require dedicated user flows.

## Risks

Queue saturation can evict the oldest mutation; device clocks cannot safely resolve every conflict; remote schema drift can fail a flush.

## Follow-up work

Expose queue diagnostics, add deterministic conflict review, and migrate existing domain contexts incrementally through repositories.

## Related documents

[ADR-003](ADR-003-local-first-storage.md), [ADR-011](ADR-011-optional-supabase-authentication.md), [cloud data specification](../release-1.3-auth-guided-ux/06-cloud-data.md).
