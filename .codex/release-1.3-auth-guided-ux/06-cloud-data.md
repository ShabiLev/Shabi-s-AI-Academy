# Cloud data

Typed repositories depend on `DataProvider`, with local, Supabase, and hybrid implementations. The Supabase implementation is lazy and unavailable without authenticated configuration. Hybrid queues bounded, idempotent mutations and exposes explicit local-only, synchronized, pending, synchronizing, offline, failed, or conflict status.

SQL migrations create profiles, preferences, progress, prompts, agents, projects, project links, knowledge, workflows, runs, favorites, recents, notifications, onboarding, sync metadata, audit events, and a protected role table. Every private table enables RLS and indexes ownership/common queries.

## Acceptance

UI code depends on repositories, confirmed remote writes update sync status, and no private row is accessible without an ownership policy.
