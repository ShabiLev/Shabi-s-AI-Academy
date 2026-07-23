# Performance Gate

## Purpose

The Lighthouse-based performance gate mapped to the real `test:performance`
scripts and `quality/config/lighthouseThresholds.cjs`, for use by
[`../workflow/performance.md`](../workflow/performance.md). See also
[`test-selection.md`](test-selection.md) and
[`../knowledge/performance.md`](../knowledge/performance.md).

## Real scripts

| Script | What it does |
| --- | --- |
| `npm run test:performance` | `npm run build && node quality/scripts/run-lighthouse.mjs collect && node quality/scripts/run-lighthouse.mjs assert` — builds production output, collects Lighthouse metrics, then asserts them against thresholds. |
| `npm run test:performance:collect` | Build + collect only, no assertion. |
| `npm run test:performance:assert` | Assert only, against a previously collected run. |
| `npm run test:performance:open` | Opens the generated Lighthouse HTML report for the login-desktop audit locally. |

`quality/scripts/run-lighthouse.mjs` orchestrates both audit paths:
`lighthouserc.cjs` / `lighthouserc.mobile.cjs` (LHCI-config-based, audits
the public `/login` route) and `lighthouse-authenticated-flow.mjs`
(Lighthouse's User Flow API, audits Dashboard, Search, Assistant, Workflow
Builder, and Analytics as an authenticated user) — see
`quality/README.md`'s `scripts/` section and
`docs/performance-testing.md`.

## Thresholds

Single source of truth: `quality/config/lighthouseThresholds.cjs`.

```
desktop: { performance: 0.85, accessibility: 0.9, bestPractices: 0.9, seo: 0.8 }
mobile:  { performance: 0.75, accessibility: 0.9, bestPractices: 0.9, seo: 0.8 }
metrics: { largestContentfulPaintMs: 3000, cumulativeLayoutShift: 0.1, totalBlockingTimeMs: 400 }
```

The file's own header documents a measured baseline (2026-07-11, this
Windows dev machine, production build via `vite preview`): Login desktop
~1.00 perf / 1.00 a11y / 0.96 best-practices / 0.90 seo; authenticated
Dashboard/QA Center desktop ~0.99–1.00 across the board. Mobile was not
separately hardware-profiled, so the mobile performance floor (0.75) is
intentionally more conservative than the desktop floor (0.85) rather than
derived from a measured mobile baseline. **CI hardware will differ from
this dev machine** — the threshold file's own comment warns of this; do not
assume a passing local run guarantees a passing CI run, or vice versa.

## In the evidence system

`test:performance` is command id `performance` in the `full` evidence
profile, rolling up into the `Performance` row of
`quality/runtime/execution/latest/summary.md`. In a real observed run on this
branch, `Performance` failed (1 failure) in ~12s
(`quality/runtime/execution/latest/summary.md`, `Performance` row) — check
`quality/runtime/execution/runs/<RUN_ID>/performance.log` for which specific
Lighthouse category or metric missed its threshold before assuming a real
regression versus environment/hardware variance.

## Changing thresholds

Unlike coverage thresholds (see [`coverage.md`](coverage.md)),
`lighthouseThresholds.cjs` is not explicitly classified Critical-risk in
`.agent/loaders/task-classifier.md`, but treat any change to it with the
same caution: it is a policy decision about what "fast enough" means for
this app, not a routine tuning knob. Do not lower a threshold to make a
specific failing run pass without first confirming the regression is
either a false positive (hardware variance) or has been deliberately
accepted and documented.

## Required when

`feature` and `release` tasks, per `.agent/manifest.json`'s
`quality.performance` / `workflow.performance` entries — particularly when
a change touches a Lighthouse-audited route (login, Dashboard, Search,
Assistant, Workflow Builder, Analytics).
