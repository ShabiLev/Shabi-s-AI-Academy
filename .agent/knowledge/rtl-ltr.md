# RTL/LTR

## Purpose

Give the concrete layout rule an agent needs when a component must work in
both Hebrew RTL and English LTR, beyond "translate the string."

## Authoritative source(s)

- [.codex/architecture/i18n.md](../../.codex/architecture/i18n.md)
- [.codex/adr/ADR-006-bilingual-rtl-ltr.md](../../.codex/adr/ADR-006-bilingual-rtl-ltr.md)
- [.codex/standards/i18n.md](../../.codex/standards/i18n.md)

## Project-specific interpretation

Direction is semantic and derived from the active language via
`LanguageContext`, then expressed through logical CSS properties
(`margin-inline-start`, not `margin-left`) rather than per-direction
component trees. There is exactly one component tree per page; RTL and LTR
are not two separate rendered layouts, they are the same layout mirrored by
the browser's `dir` attribute plus logical CSS. Non-directional icons
(checkmarks, stars used for favorites in `AgentsPage.tsx`) are not mirrored;
only genuinely directional icons (arrows implying reading-order navigation)
would be, and none of the current UI relies on such icons in a
direction-sensitive way.

## Constraints

- Never use `left`/`right` CSS properties for layout that should flip with
  direction — use logical properties.
- Never duplicate a component into an "RTL version" and an "LTR version";
  fix the shared component's CSS/semantics instead.
- Keyboard tab order and focus order must remain logical in both directions
  — verify, don't assume, when reviewing a new interactive layout.

## Known limitations

- No automated linter currently blocks a stray `margin-left`/`margin-right`
  from being introduced; RTL correctness is caught by Playwright/axe runs
  and manual review, not by a static rule.
- Mixed-direction content (e.g. an English code sample inside a Hebrew
  lesson) relies on the browser's own bidi algorithm plus any explicit
  `dir="ltr"` spans already present in lesson content; there is no
  project-wide bidi-isolation utility.

## Current implementation status

Shipped: language-driven `dir` attribute, logical-CSS-based layout across
existing pages, Playwright/axe coverage that exercises both directions on
representative routes. Not shipped: a static analysis rule that would fail
a build on a hard-coded `left`/`right` style.
