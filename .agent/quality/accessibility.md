# Accessibility Gate

## Purpose

The axe-based accessibility gate mapped to the real `test:a11y` script, for
use by [`../workflow/accessibility.md`](../workflow/accessibility.md). See
also [`test-selection.md`](test-selection.md) and
[`../knowledge/accessibility.md`](../knowledge/accessibility.md) for
project-specific known limitations.

## Real script

- **Command:** `npm run test:a11y` →
  `cross-env PW_REPORT_NAME=a11y playwright test --project="Accessibility"`.
- Uses `@axe-core/playwright` (a devDependency) to run automated
  accessibility scans as part of the Playwright `Accessibility` project.
- Allowlisted, typed exceptions live in `quality/config/a11yAllowlist.ts`
  (empty by default) — any exception added there is a deliberate,
  documented decision, not a way to silence a real violation.

## In the evidence system

`test:a11y` is command id `a11y` in `scripts/run-quality-evidence.mjs`'s
`full` profile, rolling up into the `Accessibility` row of
`quality/runtime/execution/latest/summary.md`. In a real observed run on this
branch, `Accessibility` passed with 55 results and 0 failures in ~65s
(`quality/runtime/execution/latest/summary.md`, `Accessibility` row).

## Severity data in the collected report

`quality/scripts/collect-quality-results.mjs` separately parses
`axe-*.json` attachment files under `test-results/` to compute violation-
severity counts for `quality/generated/latest-quality-report.json`. Per
`quality/README.md`'s documented limitation: `test-results/` is overwritten
per Playwright run, so these severity counts reflect only the most recent
accessibility run's attachments — not a historical accumulation. Re-run
`test:a11y` immediately before relying on this breakdown.

## What this gate does and does not cover

- **Covers:** automated axe rule violations (contrast, ARIA misuse, missing
  labels, landmark structure, etc.) across the routes/components the
  `Accessibility` Playwright project visits.
- **Does not cover on its own:** full manual screen-reader walkthroughs,
  or subjective usability for assistive-technology users. Automated axe
  scans catch a meaningful subset of accessibility issues, not all of them
  — treat a clean `test:a11y` run as a floor, not a ceiling. Manual
  screen-reader/keyboard verification for high-risk flows still belongs in
  the [`ui-validation.md`](ui-validation.md) manual-execution step and the
  keyboard journeys covered by `npm run test:keyboard` (see
  [`ux-validation.md`](ux-validation.md)).

## Required when

`accessibility review` tasks, and any `feature` task with a UI surface, per
`.agent/manifest.json`'s `quality.accessibility` / `workflow.accessibility`
entries.
