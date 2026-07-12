# Testing Standard

## Purpose

Create deterministic evidence at the lowest reliable layer.

## Mandatory rules

Test domain rules with Vitest and user-visible critical flows with Playwright. Isolate storage, fail on page/console errors, and use accessible locators.

## Recommended practices

Use builders, fixed clocks/IDs, boundary cases, focused fixtures, and explicit negative assertions.

## Forbidden practices

Arbitrary waits, test order dependence, brittle CSS selectors, network reliance, weakened expectations, blanket retries, and skipped defects.

## Example

Await a visible state transition instead of waitForTimeout.

## Review checklist

Review independence, failure signal, malformed data, directions, viewport, and regression mapping.

## Related validation

`test:run, test:e2e/full, test:a11y, test:visual`

## Exceptions process

Document the need, risk, smallest scope, owner, expiry or removal plan, and compensating tests. Material or durable exceptions require an accepted ADR and security/QA review.

Related: [Architecture overview](../architecture/overview.md), [QA handbook](qa.md), [Sprint 7](../sprint-7/00-master-spec.md).
