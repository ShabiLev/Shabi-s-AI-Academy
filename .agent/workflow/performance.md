# Performance

## Purpose

Define the Lighthouse collection/assertion workflow and performance budget
rules so performance-affecting changes are measured, not guessed at.

## When to load

Load for `feature` task type when the change affects a primary route,
bundle size, or render-blocking resources, and for `release` task type as a
required gate.

## Prerequisites

- The change builds successfully (`npm run build`).
- [`../knowledge/performance.md`](../knowledge/performance.md) has been
  read for the current Lighthouse budgets and any already-known constraints.

## Required actions

1. Run `npm run test:performance`, which builds
   (`npm run build`), then runs `quality/scripts/run-lighthouse.mjs
   collect` and `quality/scripts/run-lighthouse.mjs assert` against the
   thresholds in `quality/config/lighthouseThresholds.cjs`.
2. To iterate without re-asserting each time, run
   `npm run test:performance:collect` alone, then
   `npm run test:performance:assert` once changes settle.
3. Inspect a failing report locally via
   `npm run test:performance:open` (opens
   `quality/generated/lighthouse/login-desktop/index.html`) to see which
   metric regressed before attempting a fix.
4. If a metric regresses, identify the concrete cause (new dependency,
   unlazy-loaded route, render-blocking asset) rather than adjusting the
   threshold to pass.
5. Re-run `npm run test:performance` after the fix to confirm the budget is
   met again.

## Prohibited actions

- Weakening a value in `quality/config/lighthouseThresholds.cjs` to make a
  regressed change pass instead of fixing the regression — this is the
  same class of action as lowering a coverage threshold and is
  `Critical`-risk per
  [`../loaders/task-classifier.md`](../loaders/task-classifier.md); it
  requires stopping and asking, not doing it silently.
- Reporting a performance gate as passed without having run
  `npm run test:performance` (or `:collect` + `:assert`) against the actual
  change.
- Ignoring a regression because "it's probably noise" without re-running to
  confirm.

## Deliverables

- A passing `npm run test:performance` run (or a documented, approved
  exception) for the affected route(s).

## Evidence requirements

Lighthouse collect/assert output feeds
[`../quality/performance.md`](../quality/performance.md) and
`quality/execution/latest/` via
[`../quality/evidence.md`](../quality/evidence.md) as part of the `full`
evidence profile in `scripts/run-quality-evidence.mjs`.

## Exit criteria

`npm run test:performance` passes against the current thresholds in
`quality/config/lighthouseThresholds.cjs`, or any deviation is explicitly
documented as an approved, time-bound exception per
[`.codex/standards/qa.md`](../../.codex/standards/qa.md) exceptions process.
