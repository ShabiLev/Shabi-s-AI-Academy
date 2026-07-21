# Visual Regression

## Purpose

Visual snapshot review/update rules mapped to the real `test:visual` family
of scripts. See also [`test-selection.md`](test-selection.md) and
[`ui-validation.md`](ui-validation.md).

## Real scripts

| Script | What it does |
| --- | --- |
| `npm run test:visual` | `cross-env PW_REPORT_NAME=visual playwright test --project="visual-chromium"` — runs the visual-snapshot Playwright project and compares against committed baseline screenshots. |
| `npm run test:visual:review` | `node quality/scripts/generate-quality-artifacts.mjs` — generates reviewable quality artifacts (including visual diff material) from the latest run. |
| `npm run test:visual:update` | `node quality/scripts/require-visual-update.mjs && playwright test --project="visual-chromium" --update-snapshots` — regenerates the committed baseline screenshots. Gated by `require-visual-update.mjs`, which exists specifically to stop this from being run casually. |
| `npm run test:visual:report` | `playwright show-report` — opens the last HTML report. |

## In the evidence system

`test:visual` is command id `visual` in the `full` evidence profile,
rolling up into the `Visual` row of `quality/runtime/execution/latest/summary.md`.
Failed visual comparisons produce `*-diff.png` files, which
`copyHeavyArtifacts()` in `scripts/run-quality-evidence.mjs` sorts into
`quality/runtime/execution/runs/<RUN_ID>/visual-diffs/` (matched by filename suffix
`-diff.png`) alongside `screenshots/`, `traces/`, and `videos/` — all local/
gitignored, never committed (see [`evidence.md`](evidence.md)). In a real
observed run on this branch, `Visual` failed with 1 failure out of 25
results in ~80s (`quality/runtime/execution/latest/summary.md`, `Visual` row) —
check `quality/runtime/execution/runs/<RUN_ID>/visual.log` and the corresponding
`visual-diffs/` entry to see exactly which snapshot regressed before
deciding whether it's a real regression or an intended change.

## Snapshot updates are never routine

A failing `test:visual` run means the rendered output changed from the
committed baseline. The default assumption is that this is a **regression
to investigate**, not baseline drift to accept:

1. Open the diff (`visual-diffs/` in the run archive, or
   `npm run test:visual:report`) and confirm whether the visual change was
   an intended part of this task.
2. If unintended, fix the code — do not update the snapshot to match a bug.
3. If intended (a deliberate UI change that is part of the task), running
   `npm run test:visual:update` to refresh baselines requires the change to
   already be reviewed/approved as intended — this is exactly what
   `require-visual-update.mjs` gates. Do not run `test:visual:update`
   speculatively "to make the suite pass" without that review; treat it
   with the same care as changing a coverage threshold (see
   [`coverage.md`](coverage.md)) — it silently redefines what "correct"
   looks like for every future run.
4. Document any accepted baseline change in the task's self-review and
   final report (see [`../workflow/self-review.md`](../workflow/self-review.md),
   [`../workflow/final-report.md`](../workflow/final-report.md)).

## Required when

`UX review` and `feature` tasks with a visible UI surface, per
`.agent/manifest.json`'s `quality.visual-regression` entry.
