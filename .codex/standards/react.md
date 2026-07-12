# React Standard

## Purpose

Define predictable component, hook, and context practices.

## Mandatory rules

Use function components, semantic elements, stable keys, controlled ownership, Rules of Hooks, and accessible names. Effects synchronize external systems only.

## Recommended practices

Prefer composition, local state, derived values, focused contexts, and event handlers named for intent.

## Forbidden practices

State mutation, effects for pure derivation, nested interactive elements, index keys for mutable lists, and monolithic contexts.

## Example

Derive filteredRows with a pure function; do not copy it into state with an effect.

## Review checklist

Review ownership, rerender scope, loading/error/empty states, keyboard flow, and cleanup.

## Related validation

`lint, Vitest/Testing Library, Playwright, axe`

## Exceptions process

Document the need, risk, smallest scope, owner, expiry or removal plan, and compensating tests. Material or durable exceptions require an accepted ADR and security/QA review.

Related: [Architecture overview](../architecture/overview.md), [QA handbook](qa.md), [Sprint 7](../sprint-7/00-master-spec.md).
