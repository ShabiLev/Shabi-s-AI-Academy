# Test Selection

## Purpose

Which real npm scripts (from `package.json`) apply to a given task type —
focused/fast vs. full — so an agent runs the right amount of testing instead
of guessing. This module is consumed by
[`../workflow/testing.md`](../workflow/testing.md) and by the evidence
runner's `fast`/`full`/`pages`/`headed` profiles in
`scripts/run-quality-evidence.mjs` (see [`evidence.md`](evidence.md)). For
release-time selection specifically, see [`release-gates.md`](release-gates.md)
and [`../release/release-checklist.md`](../release/release-checklist.md).

## Principle

Every substantial change gets focused tests for the change itself, then the
full suite for the affected area — never only one or the other (AOS master,
§5). "Full" does not mean "run everything always"; it means running every
script relevant to the domains actually touched.

## Task type → applicable scripts

| Task type | Focused / fast scripts | Full / broader scripts | Notes |
| --- | --- | --- | --- |
| Feature (UI-facing) | `npm run lint`, `npm run test:run`, `npm run build`, `npm run test:e2e` | `npm run test:e2e:full`, `npm run test:journeys`, `npm run test:ux`, `npm run test:a11y`, `npm run test:visual` | Add `test:performance` if the change touches a budgeted route (see [`performance.md`](performance.md)). |
| Feature (non-UI / logic only) | `npm run lint`, `npm run test:run`, `npm run build` | `npm run test:coverage`, `npm run test:e2e` | UX/visual/a11y suites are not required if no UI surface changed. |
| Bugfix | `npm run lint`, `npm run test:run` (with a regression test for the bug), `npm run build` | `npm run test:e2e` scoped to the affected area; `npm run test:e2e:full` if the fix touches shared/core code | See [`../workflow/debugging.md`](../workflow/debugging.md) for root-cause requirements. |
| Hotfix | `npm run lint`, `npm run test:run`, `npm run build` | `npm run test:e2e` (fast project only) | Minimum viable regression coverage; do not skip lint/unit even under time pressure. |
| Refactor | `npm run lint`, `npm run test:run`, `npm run build` | `npm run test:coverage` (regression check — no lowering thresholds), `npm run test:e2e:full` | Behavior must be provably unchanged; see [`../workflow/refactoring.md`](../workflow/refactoring.md). |
| Testing task (adding/expanding tests) | `npm run test:run`, `npm run test:evidence` | `npm run test:coverage` | `test:evidence` (`node --test scripts/evidence-utils.test.mjs`) covers the evidence runner's own helpers. |
| Coverage recovery | `npm run test:coverage` before and after | `npm run test:run` | Never edit `quality/config/coverageThresholds.cjs` to pass — see [`coverage.md`](coverage.md). |
| UX review | `npm run test:journeys`, `npm run test:ux` | `npm run test:click-audit`, `npm run test:route-crawl`, `npm run test:forms`, `npm run test:overlays`, `npm run test:responsive:interactions`, `npm run test:keyboard`, `npm run test:copy`, `npm run test:errors` | See [`ux-validation.md`](ux-validation.md). |
| Accessibility review | `npm run test:a11y` | — | Playwright `Accessibility` project; see [`accessibility.md`](accessibility.md). |
| Visual regression work | `npm run test:visual` | `npm run test:visual:review`, `npm run test:visual:update` only with explicit reason | See [`visual-regression.md`](visual-regression.md) — snapshot updates are never routine. |
| Documentation-only | `npm run docs:check` | — | No app code changed; still verify docs build/lint if applicable. |
| Deployment (GitHub Pages) | `npm run build:pages` | `npm run test:e2e:pages` | See [`../knowledge/github-pages.md`](../knowledge/github-pages.md). |
| Release | See [`release-gates.md`](release-gates.md) | `npm run validate:release` (full chain) | This is the only task type that runs the entire `validate:release` chain. |

## Fast vs. full at a glance

- **Fast/focused** commands finish in seconds to low minutes and are safe to
  run on every substantial change: `lint`, `test:run`, `test:evidence`,
  `build`, `docs:check`, `test:e2e` (Desktop Chromium project only).
- **Full** commands are expensive (multi-minute Playwright matrices,
  Lighthouse, full coverage) and are reserved for release candidates, UX/
  accessibility/performance review tasks, or when the change plausibly
  affects a wide surface: `test:e2e:full`, `test:coverage`, `test:journeys`,
  `test:ux` and its component specs, `test:a11y`, `test:visual`,
  `test:performance`, `test:release-candidate`, `test:release-candidate:pages`,
  `validate:release`.

## Mapping to evidence profiles

`scripts/run-quality-evidence.mjs` encodes this same focused/full split as
reusable profiles — `fast` runs `docs:check`, `test:evidence`, `lint`,
`test:run`, `build`; `full` runs the entire release-candidate chain plus
`validate:release`. Use `npm run quality:evidence:fast` for everyday changes
and `npm run quality:evidence:full` (or `:pages` / `:headed` as needed) at
release time. Full detail in [`evidence.md`](evidence.md).
