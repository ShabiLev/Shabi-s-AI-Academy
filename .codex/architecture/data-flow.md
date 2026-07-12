# Data Flow Architecture

## Purpose

Show how user input, built-in definitions, runtime events, and persistence move through the system.

## Current state

Current libraries use explicit import from immutable catalogs into validated local stores. Sprint 7 extends the pattern to agents, packs, playground drafts, and run history.

## Decision and constraints

Validate at entry, normalize once, create immutable requests, emit append-only run events, and persist only bounded non-secret records.

## Dependency boundaries

```mermaid
sequenceDiagram
  actor U as User
  participant UI
  participant D as Domain service
  participant R as Runtime
  participant P as Mock Provider
  participant S as Validated storage
  U->>UI: Explicit action
  UI->>D: Typed input
  D->>R: Validated request
  R->>P: Deterministic request
  P-->>R: Result/events
  R->>S: Bounded safe history
  R-->>UI: Observable state
```

## Anti-patterns

UI cannot skip validation or write raw adapters. Catalog imports produce new personal IDs and preserve provenance.

## Testing impact

Executing imported text, persisting entire catalogs, mutable event histories, or treating displayed logs as provider truth.

## Future evolution

Unit-test every boundary and Playwright-test explicit action, persistence, attribution, and failure presentation.

## Related documents

Future live flows insert a secure gateway between runtime and provider without moving secrets into the browser.
