# Runtime Architecture

## Purpose

Define the planned 0.7.0 execution boundary without implying live AI connectivity.

## Current state

Version 0.6.1 has agent blueprints and deterministic simulation, but no provider-backed runtime. Sprint 7 introduces Mock and Dry Run plus local history.

## Decision and constraints

A pure state machine accepts typed commands and emits events. ProviderRegistry resolves a Provider interface; ToolRegistry returns declared capabilities. liveReserved remains disabled.

## Dependency boundaries

Playgrounds call runtime services; runtime calls provider/tool abstractions; providers never import UI. History stores sanitized bounded summaries.

## Anti-patterns

Promises and booleans as an implicit state machine, random mock output, UI-owned retries, or a Live button that suggests configuration exists.

## Testing impact

Contract-test transitions, deterministic provider output, approval/retry/cancel paths, corrupt history, and UI timelines.

## Future evolution

A secure backend can later implement live providers without changing domain contracts, subject to ADR and threat model.

## Related documents

[Data flow](data-flow.md), [ADR-002](../adr/ADR-002-mock-runtime-before-live.md), [ADR-004](../adr/ADR-004-provider-abstraction.md), [Sprint runtime](../sprint-7/01-runtime.md).
