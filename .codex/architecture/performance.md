# Performance Architecture

## Purpose

Keep primary workflows responsive as catalogs and runtime history grow.

## Current state

The app bundles only curated catalogs and performs local search over bounded datasets. Vite produces static assets; Lighthouse validates representative routes.

## Decision and constraints

Measure before adding dependencies. Bound histories, memoize only demonstrated hotspots, avoid complete external datasets, and keep normal workflows network-independent.

## Dependency boundaries

Pages consume compact domain views; parsers and reports belong in developer tooling rather than startup.

## Anti-patterns

Premature memoization, unbounded DOM lists, synchronous parsing of huge inputs, route-wide rerenders, or hiding regressions by lowering thresholds.

## Testing impact

Build-size review, Lighthouse desktop/mobile, interaction smoke tests, and large-local-data cases accompany relevant changes.

## Future evolution

Route splitting or virtualization may be added when measurements justify complexity.

## Related documents

[Performance standard](../standards/performance.md), [runtime](runtime.md), [Sprint tests](../sprint-7/07-tests.md).
