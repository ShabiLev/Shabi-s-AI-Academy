# Sprint 7 Roadmap Screen Specification

## Purpose

Expose a truthful, bilingual product-version timeline inside the protected application without pretending to query GitHub or deployment systems.

## Route and data

Protected route: `/roadmap`. Data is a version-controlled typed static module in 0.7.0.

Each release record requires stable ID/version, state `completed | inProgress | planned`, bilingual title/summary/highlights, optional completed release date supported by repository evidence, optional quality metrics with source/timestamp, and relevant internal/external documentation links.

Populate releases 0.1.0 through 1.0.0 consistently with [engineering releases](../roadmap/releases.md). 0.7.0 is In Progress until the release commit is complete; the implementation/release process must then deliberately mark it Completed and supply only verified metrics/date. Planned content is intent, not promise.

## UX and honesty

- Filters or grouped sections for Completed, In Progress, Planned.
- Desktop timeline and equivalent semantic list; mobile uses stacked cards/list.
- Links to root CHANGELOG and available How To/release documentation.
- Quality metrics display gate source and “not available” rather than placeholders.
- No “live,” “synced,” or GitHub-status language unless a future imported data source exists.
- Status uses text plus icon/color; headings and links remain keyboard accessible.

## Acceptance and tests

Vitest validates unique semantic versions, legal states, chronological order, completion-date rules, translated fields, safe links, and no fabricated metrics. Playwright covers protection, state groups, CHANGELOG link, map/list/mobile behavior, both directions, keyboard, axe, visual baseline, and Lighthouse.

Related: [roadmap](../roadmap/roadmap.md), [versioning](../standards/versioning.md), [Learning Journey](05-learning-journey.md), [release](08-release.md).
