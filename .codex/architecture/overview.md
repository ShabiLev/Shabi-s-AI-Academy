# Architecture Overview

## Purpose

Define the controlling system shape for Shabi's AI Academy 1.2.0-beta.1 and its post-release follow-up.

## Current state

The application is a protected React + TypeScript + Vite single-page application. It provides bilingual lessons, prompt and agent builders, local libraries, a read-only prompt catalog, a deterministic Mock/Dry Run Runtime with browser-local history, How To content, and a QA Center. There is no production backend or live AI provider.

## Decision

Use feature-oriented domain modules behind pages and contexts. UI components consume typed domain services; storage, providers, and tools remain behind abstractions.

```mermaid
flowchart LR
  UI[Pages and components] --> Domain[Typed domain services]
  Domain --> Catalog[Read-only built-ins]
  Domain --> Storage[Validated local storage]
  Domain --> Runtime[Runtime state machine]
  Runtime --> Provider[Provider abstraction]
  Runtime --> Tools[Tool registry abstraction]
  Provider --> Mock[Deterministic Mock Provider]
  Provider -. future secure boundary .-> Live[Live providers]
```

## Principles and constraints

- React + TypeScript + Vite; TypeScript remains strict.
- Local-first until a real backend is deliberately introduced.
- Built-in catalogs never become user-owned until explicit import.
- Mock and Dry Run are deterministic prerequisites to Live Run.
- Provider and tool registries are abstractions; UI never calls provider APIs.
- External data is untrusted plain data and is never executed.
- Secrets never enter localStorage, bundles, fixtures, screenshots, or logs.
- Hebrew RTL and English LTR are complete, semantic experiences.
- Accessibility and quality gates are default architecture concerns.
- Status labels describe observed state; no fabricated live connectivity.

## Dependency boundaries

Pages may import components, contexts, translations, and public domain APIs. Domain code must not import pages. Provider adapters and storage modules must not depend on React. Catalog data is immutable. Cross-feature imports require a shared domain reason, not convenience.

## Anti-patterns

Direct localStorage parsing in components, duplicated state machines, provider calls in click handlers, mutable catalog objects, HTML execution from external text, direction-specific pixel hacks, and claims that a conceptual tool is connected.

## Testing impact and evolution

Domain transitions, validators, serialization, and imports require Vitest. User-visible flows require Playwright, axe, representative visuals, and Lighthouse on primary routes. A backend, live providers, MCP, and synchronization require new accepted ADRs and threat models.

Related: [coding boundaries](coding-standards.md), [runtime](runtime.md), [security](security.md), [Sprint 7](../sprint-7/00-master-spec.md), [ADRs](../adr/README.md).
