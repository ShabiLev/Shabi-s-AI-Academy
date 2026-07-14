# Storage

## Purpose

Clarify the local-first storage model and the boundary where optional cloud
sync begins, so an agent doesn't add unbounded or unvalidated persistence.

## Authoritative source(s)

- [.codex/architecture/storage.md](../../.codex/architecture/storage.md)
- [.codex/adr/ADR-003-local-first-storage.md](../../.codex/adr/ADR-003-local-first-storage.md)
- [.codex/adr/ADR-012-hybrid-data-providers.md](../../.codex/adr/ADR-012-hybrid-data-providers.md)

## Project-specific interpretation

Every feature domain owns a `*Storage.ts` module (e.g.
`src/agents/agentStorage.ts`, `src/prompts/promptStorage.ts`,
`src/knowledge/knowledgeStorage.ts`, `src/runtime/runtimeStorage.ts`,
`src/workflows/workflowStorage.ts`) that reads/writes a versioned,
schema-checked `localStorage` key with a safe default on corruption. Above
that, `src/data/` defines a `DataProvider` contract with three
implementations: `LocalDataProvider` (localStorage only),
`SupabaseDataProvider` (cloud tables), and `HybridDataProvider`, which writes
locally first, enqueues an idempotent mutation (capped at 100 entries,
`src/data/sync/syncQueue.ts`), and only flushes to the cloud provider on
explicit request with bounded exponential backoff (ADR-012).

Bounded-history is an enforced convention, not a suggestion:
`MAX_RUNTIME_RUNS = 50` in `src/runtime/types.ts` caps stored runtime runs.

## Constraints

- New persisted domain state needs a schema version, a parser with a safe
  default, and a bound on collection size — follow an existing
  `*Storage.ts` module as the template.
- Never write full external/catalog datasets to storage; Starter Catalog
  items are immutable module constants until explicitly imported
  (ADR-005), at which point they become a new, separately-owned local record.
- Never persist secrets (API keys, service-role credentials) — see
  `.agent/knowledge/security.md` and ADR-009.
- Cloud writes go through the `DataProvider` contract; do not call the
  Supabase client directly from a page or component.

## Known limitations

- Not all domain contexts route through `DataProvider` yet; most still talk
  to their own `localStorage` adapter directly, meaning most user data does
  not currently benefit from Hybrid sync even though the mechanism exists
  (ADR-012 follow-up work).
- The sync queue's 100-entry cap means a very long offline session can evict
  the oldest queued mutation before it ever reaches the cloud.
- No cross-device conflict-resolution UI exists yet; ADR-012 explicitly
  defers that.

## Current implementation status

Shipped: per-domain versioned local storage adapters, bounded runtime
history, `DataProvider`/`LocalDataProvider`/`SupabaseDataProvider`/
`HybridDataProvider` implementations and the capped sync queue. Partial:
only a subset of domains have been wired onto `HybridDataProvider`; the rest
remain local-only by choice, not by omission.
