# ADR-007: Playwright Quality Platform

- Status: Accepted
- Date: 2026-07-12

## Context

Browser fidelity is needed for protected routes, persistence, responsiveness, accessibility, and visuals.

## Decision

Use Playwright projects for functional, full-browser, axe, responsive, and reviewed visual coverage; Lighthouse remains complementary.

## Alternatives considered

Manual-only release testing; Cypress migration; unit tests for browser behavior.

## Consequences

One coherent platform and reusable fixtures; suite duration must be managed.

## Risks

Flakiness and snapshot misuse.

## Follow-up work

Preserve isolation, accessible locators, no arbitrary waits, and shard only with evidence.

## Related documents

[Architecture overview](../architecture/overview.md), [security](../standards/security.md), [Sprint 7 master specification](../sprint-7/00-master-spec.md).
