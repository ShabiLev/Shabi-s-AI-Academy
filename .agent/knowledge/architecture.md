# Architecture

## Purpose

Give an AI agent the fastest correct orientation to this app's system shape
before it changes code, without repeating the authoritative architecture set.

## Authoritative source(s)

- [.codex/architecture/overview.md](../../.codex/architecture/overview.md)
- [.codex/architecture/runtime.md](../../.codex/architecture/runtime.md)
- [.codex/adr/README.md](../../.codex/adr/README.md) and all accepted ADRs

## Project-specific interpretation

Shabi's AI Academy (application version 1.5.0-beta.1) is a protected React +
TypeScript + Vite single-page app. It teaches AI-agent concepts through
bilingual lessons, a Prompt Library/Builder, an Agent Builder, a read-only
Starter Catalog, a deterministic Mock/Dry-Run Runtime, a Knowledge Base, and a
QA Center — all local-first. There is no production backend for course
content and no live AI provider wired into the runtime. Optional Supabase
authentication and hybrid cloud sync (ADR-011, ADR-012) exist for accounts
without making the app depend on network availability.

For AOS purposes: `feature` and `refactor` tasks must read overview.md and
runtime.md before touching domain code, and must not introduce a capability
(a live provider, a real backend call, a connected tool) that these documents
still describe as future/reserved.

## Constraints

- Never contradict overview.md's dependency boundaries (pages → domain →
  storage/runtime → provider abstraction).
- Any change that would require a new architectural decision (backend, live
  provider, MCP, synchronization redesign) needs a new ADR first, per
  overview.md's "Testing impact and evolution" section — do not implement it
  ahead of the ADR.
- `liveReserved` execution mode stays disabled; do not flip it on as a side
  effect of an unrelated change.

## Known limitations

- No live AI provider is connected anywhere in the app; every "AI" behavior
  a learner sees is either static lesson content, a deterministic Mock
  Provider, or a simulation function.
- Cloud sync (ADR-012) is additive and optional; most domain contexts still
  read/write local storage directly rather than through the shared
  `DataProvider` contract (see `src/data/`), which is a known, accepted gap
  the ADR itself flags as follow-up work.

## Current implementation status

Shipped: local-first SPA shell, Mock/Dry-Run runtime, Starter Catalog
import flow, optional Supabase auth + hybrid data provider for a subset of
domains (see `.agent/knowledge/storage.md` and `.agent/knowledge/supabase.md`
for which ones). Not shipped: live providers, a general backend, MCP,
autonomous agent execution.
