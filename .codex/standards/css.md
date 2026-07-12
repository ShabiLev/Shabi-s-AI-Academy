# CSS Standard

## Purpose

Deliver coherent responsive RTL/LTR layouts.

## Mandatory rules

Use shared tokens, logical properties, mobile-first constraints, visible focus, native controls, and ~44px touch targets.

## Recommended practices

Prefer grid/flex gap, minmax, content-driven wrapping, reduced-motion support, and component-scoped classes.

## Forbidden practices

Direction-specific hacks, unexplained offsets, negative-margin repairs, hidden overflow masking, and absolute native form internals.

## Example

Use margin-inline-start and gap instead of separate Hebrew/English margins.

## Review checklist

Review 320–1920 widths, zoom, long translations, focus, contrast, and both directions.

## Related validation

`Playwright responsive assertions, axe, visual tests`

## Exceptions process

Document the need, risk, smallest scope, owner, expiry or removal plan, and compensating tests. Material or durable exceptions require an accepted ADR and security/QA review.

Related: [Architecture overview](../architecture/overview.md), [QA handbook](qa.md), [Sprint 7](../sprint-7/00-master-spec.md).
