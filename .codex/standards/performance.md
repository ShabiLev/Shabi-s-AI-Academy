# Performance Standard

## Purpose

Protect startup and interaction performance with evidence.

## Mandatory rules

Keep catalogs bounded, histories capped, normal flows offline, dependencies justified, and expensive work outside render.

## Recommended practices

Measure bundles and Lighthouse; debounce only when needed; paginate/virtualize only after profiling.

## Forbidden practices

Bundling full external datasets, unbounded rendering, premature memoization, repeated parsing, and lowering thresholds to pass.

## Example

Normalize catalog records once at module/build time, not per keystroke.

## Review checklist

Review bundle delta, render counts, large local data, mobile performance, and memory bounds.

## Related validation

`build size output, Lighthouse, performance smoke tests`

## Exceptions process

Document the need, risk, smallest scope, owner, expiry or removal plan, and compensating tests. Material or durable exceptions require an accepted ADR and security/QA review.

Related: [Architecture overview](../architecture/overview.md), [QA handbook](qa.md), [Sprint 7](../sprint-7/00-master-spec.md).
