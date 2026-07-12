# State Management Architecture

## Purpose

Define state ownership and prevent duplicated domain truth.

## Current state

Persistent feature state is exposed through typed contexts backed by validated storage modules. Page-local filters, dialogs, and drafts remain local component state.

## Decision and constraints

Choose the narrowest owner. Derived values are calculated, not separately persisted. Reducers or pure transition functions own multi-step runtime state.

## Dependency boundaries

Components depend on context interfaces; contexts depend on domain/storage APIs; built-in catalogs remain module constants.

## Anti-patterns

Mirrored state, effects that repair invalid models after render, direct mutation, and one global context for unrelated features.

## Testing impact

Test pure transitions and hydration corruption with Vitest; test persistence and cross-route behavior with Playwright.

## Future evolution

Sprint 7 runtime should use an explicit event-driven state machine and bounded history repository.

## Related documents

[Storage](storage.md), [data flow](data-flow.md), [runtime spec](../sprint-7/01-runtime.md).
