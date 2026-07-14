# Cloud data architecture

Feature domains depend on typed repository interfaces. `LocalDataProvider` uses the existing validated browser stores, `SupabaseDataProvider` maps authenticated rows, and `HybridDataProvider` combines immediate local writes with a bounded idempotent queue.

Statuses are explicit: local-only, synchronized, pending, synchronizing, offline, failed, or conflict. A local write is never labelled synchronized until the remote provider confirms it. Unauthenticated users do not start a sync loop.

The provider boundary preserves built-in catalogs separately from user-owned records. Queue records are bounded, retriable, and deduplicated by operation identity; they contain no credentials.
