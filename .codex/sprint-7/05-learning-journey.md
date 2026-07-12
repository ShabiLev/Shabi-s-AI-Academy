# Sprint 7 Learning Journey Foundation

## Purpose

Add a visual and non-visual learning path that explains progression without restricting existing lessons.

## Journey model

Ordered stages:

1. AI Foundations
2. Prompt Engineering
3. Context
4. Verification
5. Tools
6. Memory
7. Agents
8. MCP
9. Automation
10. Multi-Agent
11. Production

Each typed stage includes stable ID, bilingual title/description, status mapping, optional lesson IDs, optional recommended prerequisites, help link, and future marker. Display states are `completed`, `current`, and `planned`.

## Version 0.7.0 behavior

Protected route: `/learning-journey`. Derive completed/current state from existing course progress without changing its schema or completion rules. The first incomplete stage with available lessons is current; later stages are planned. Future concepts may be displayed as planned educational context.

Prerequisites are recommendations, not locks. Users can open every currently available lesson exactly as in 0.6.1. The map must not reset, rewrite, or inflate course progress.

## UX and accessibility

- Map view uses semantic groups and text/icon status, not color alone.
- Equivalent ordered list is always available and contains the same names, statuses, descriptions, lesson links, and prerequisite notes.
- Keyboard order follows learning order; map connectors are decorative.
- A progress summary announces completed stages without claiming course certification.
- Hebrew RTL and English LTR layouts, translated copy, mobile cards/timeline, 200% zoom, reduced motion, and no overflow are required.

## Acceptance and tests

Vitest covers stage schema/order, progress derivation, no-lock policy, unknown lesson IDs, empty/corrupt progress, and translation completeness. Playwright covers route protection, map/list equivalence, lesson navigation, existing lesson accessibility, progress refresh/reset integration, both directions, mobile/desktop, keyboard, axe, representative visual baselines, and Lighthouse smoke.

Related: [state management](../architecture/state-management.md), [i18n](../architecture/i18n.md), [roadmap](06-roadmap.md), [tests](07-tests.md).
