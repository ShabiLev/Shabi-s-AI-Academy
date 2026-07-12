# Testing Architecture

## Purpose

Define the automated quality platform and evidence flow.

## Current state

Vitest covers domain and component behavior; Playwright covers functional, responsive, accessibility, and visual flows; Lighthouse covers performance; quality scripts collect honest gate results.

## Decision and constraints

Tests are deterministic, isolated, accessible-locator-first, and layered by risk. Generated artifacts are ignored unless reviewed baselines are intentionally versioned.

## Dependency boundaries

Feature code exposes pure seams; tests may use supported storage helpers, never implementation-only production backdoors.

## Anti-patterns

Arbitrary sleeps, order dependence, blanket axe suppression, automatic snapshot approval, weakened assertions, or claiming manual checks ran.

## Testing impact

Every behavior change maps to the smallest reliable layer plus user-visible regression coverage. Release uses npm run validate:release.

## Future evolution

Future provider contract tests remain deterministic and must not call billable services in standard CI.

## Related documents

[QA handbook](../standards/qa.md), [testing standard](../standards/testing.md), [ADR-007](../adr/ADR-007-playwright-quality-platform.md), [Sprint tests](../sprint-7/07-tests.md).
