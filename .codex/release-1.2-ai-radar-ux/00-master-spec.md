# AI Radar and UX Hardening 1.2.0-beta.1

## Status

- Baseline: `7da232bb90016b8dc01fcb082ffa7590db79b63d`, Version `1.1.0-beta.1`
- Branch: `feature/1.2.0-ai-radar-ux`
- Target: `1.2.0-beta.1`
- Milestone: AI Radar & UX Hardening

## Objective

Replace the Radar placeholder with a useful, bilingual, source-based trends dashboard and stabilize the shared experience across direction, viewport, zoom, keyboard, focus, spacing, contrast, layering, and overflow. Every 1.1 capability and user-owned browser record remains available.

## Controlling modules

1. [Radar data and source policy](01-radar.md)
2. [UX hardening](02-ux-hardening.md)
3. [Testing](03-testing.md)
4. [Release](04-release.md)

## Invariants

- Hebrew and English provide complete semantic RTL/LTR experiences.
- Radar content is a bundled editorial snapshot, not a live feed.
- Every Radar claim links to an official first-party source and exposes its publication and verification dates.
- No browser fetch, scraping, tracking, provider connection, secret, or fabricated live state is introduced.
- Built-in catalogs remain immutable and separate from user-owned local stores.
- Existing routes, local data, Runtime modes, backup, BrowserRouter development, and HashRouter GitHub Pages deployment remain intact.
- Shared overlays use design-system layer tokens; keyboard focus is visible and restored predictably.

## Delivery contract

Use the commit sequence in [04-release.md]. Run focused checks with each implementation commit and `npm run validate:release` before the release commit. Do not push, merge, squash, amend, or force-push.
