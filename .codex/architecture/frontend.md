# Frontend Architecture

## Purpose

Define React composition and browser-facing boundaries.

## Current state

Routes render pages inside the protected application shell; providers supply auth, language, course progress, prompt library, and agent library state.

## Decision and constraints

Keep pages thin, components accessible, contexts stable, and domain logic framework-independent. Lazy loading is optional when measured bundle value justifies it.

## Dependency boundaries

Pages may call context/domain APIs, never concrete storage or provider adapters. Components receive typed props and emit semantic events.

## Anti-patterns

Business rules inside JSX; global state for temporary form input; nested interactive controls; unbounded context rerenders.

## Testing impact

Test domain code with Vitest and route behavior with Testing Library/Playwright. Add axe for complex screens.

## Future evolution

A server-state layer may be adopted only with a backend ADR.

## Related documents

[Coding boundaries](coding-standards.md), [React standard](../standards/react.md), [Sprint playground](../sprint-7/04-playground.md).
