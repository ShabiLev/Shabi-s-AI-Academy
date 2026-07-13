# AI Radar & UX Hardening Handoff

## Release state

- Baseline: `7da232bb90016b8dc01fcb082ffa7590db79b63d`
- Branch: `feature/1.2.0-ai-radar-ux`
- Application version: `1.2.0-beta.1`
- Scope: bilingual source-based AI Radar, profile-menu accessibility and collision hardening, responsive/RTL stabilization, regression coverage, documentation, and GitHub Pages verification
- Push status: local only; pushing still requires explicit user authorization

## Radar policy

The Radar is a curated, static release snapshot. It contains eight bilingual records from first-party OpenAI, Anthropic, Google DeepMind, Hugging Face, and NIST pages. Each record stores its source URL, publisher, publication date, verification date, category, horizon, summary, and practical implication. Validation rejects non-HTTPS or non-allowlisted sources, invalid or future dates, verification dates earlier than publication, and incomplete translations. It does not claim to be a live feed, fetch remote content at runtime, use browser telemetry, or infer provider connectivity.

## UX and accessibility

The profile menu now renders through a portal with viewport-aware logical alignment: right-edge anchoring in Hebrew RTL, left-edge anchoring in English LTR, and a full-width mobile sheet. A backdrop prevents interaction with navigation behind it. Outside click, Escape, Tab, Home/End, and arrow-key behavior are covered; focus enters the menu and returns to the trigger. The menu follows scrolling without being clipped by the sidebar, safely wraps long labels, and uses the design-system z-index scale.

## Validation evidence

`npm run validate:release` passed on 2026-07-13:

- Lint, TypeScript production build, catalog check, documentation check, and `git diff --check`: passed
- Vitest: 257 passed, 0 failed
- Coverage: statements 76.23%, branches 76.95%, functions 70.79%, lines 76.23%
- Full Playwright matrix: 117 passed, 0 failed
- Dedicated axe accessibility suite: 46 passed; 0 critical, serious, moderate, or minor violations
- Visual regression suite: 46 passed, including four open-profile-menu baselines and the Radar baseline
- Authenticated Lighthouse desktop: 1.00 for performance, accessibility, best practices, and SEO on all five routes
- Authenticated Lighthouse mobile: performance 0.93-1.00, accessibility 1.00, best practices 0.96-1.00, SEO 1.00
- Quality analyzer: `readyWithWarnings`; no failed gates, with only the manual checklist marked `notRun`

GitHub Pages was verified separately:

- `npm run build:pages`: passed base-path, hashed-asset, metadata, and safety validation
- `npm run test:e2e:pages`: 2 passed, covering a public route and protected-route login redirect through HashRouter

## Manual follow-up

Automated tests cover 320x568, 390x844, 768x1024, and 1440x900 layouts, both directions, sidebar scrolling, keyboard operation, overflow, clipping, and repeated menu behavior. Before production promotion, a person must still complete the versioned QA Center checklist, including 200% browser zoom and screen-reader/manual assistive-technology checks. The inability to run the optional `agent-browser` CLI was handled with the repository's Playwright suites and inspected screenshots.

## Commit sequence

1. `b2ffddd docs(release): define AI Radar and UX hardening`
2. `95d1dc5 feat(radar): add bilingual source-based AI Radar`
3. `f24d577 fix(ux): harden profile menu and shared layouts`
4. `4ce07b7 test(ux): expand responsive and visual regression coverage`
5. `a834e11 docs(radar): document sources and freshness model`
6. `chore(release): prepare 1.2.0-beta.1` (contains versioning, final baselines, release notes, and this handoff)

## Stop condition

Leave the completed local feature branch unpushed. After review, the authorized push command is:

```powershell
git push -u origin feature/1.2.0-ai-radar-ux
```
