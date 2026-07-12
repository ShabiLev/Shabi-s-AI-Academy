# Design System Architecture

## Purpose

Preserve the Jarvis-inspired visual language while standardizing accessible primitives.

## Current state

Shared CSS tokens cover color, spacing, typography, radii, focus, and approximately 44px controls. Common components provide cards, buttons, headers, status badges, dialogs, and empty states.

## Decision and constraints

Use semantic HTML first, logical properties, native controls where suitable, and status text in addition to color. Variants remain finite and purpose-based.

## Dependency boundaries

Feature styles depend on shared tokens; primitives must not import feature domains.

## Anti-patterns

One-off negative margins, absolute-positioned form internals, color-only statuses, low-contrast decoration, or generic components with dozens of flags.

## Testing impact

Visual regression, axe, keyboard checks, responsive bounding boxes, and contrast review are required for changed primitives.

## Future evolution

Tokens may evolve incrementally; a replacement component library requires an ADR and migration plan.

## Related documents

[CSS standard](../standards/css.md), [accessibility](../standards/accessibility.md), [ADR-006](../adr/ADR-006-bilingual-rtl-ltr.md).
