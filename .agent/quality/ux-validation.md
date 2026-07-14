# UX Validation

## Purpose

Journey-based UX checks mapped to the real `test:journeys` / `test:ux`
scripts and their component specs, for use by
[`../workflow/ux-review.md`](../workflow/ux-review.md). See also
[`test-selection.md`](test-selection.md), [`ui-validation.md`](ui-validation.md),
and [`manual-review.md`](manual-review.md) for the human review this
automation cannot replace.

## Real scripts

| Script | Config / spec | What it checks |
| --- | --- | --- |
| `npm run test:journeys` | `playwright.journeys.config.ts` | End-to-end realistic user journeys (task completion across multiple steps/pages). |
| `npm run test:journeys:headed` | same config, `--headed` | Same journeys, visible browser — used by the evidence runner's `headed` profile (`journeys-headed`, `criticality: "manual"`). |
| `npm run test:ux` | `playwright.ux.config.ts` | The broader UX quality project. |
| `npm run test:ux:headed` | same config, `--headed` | Visible-browser variant for manual observation. |
| `npm run test:click-audit` | `e2e/specs/system-click-audit.spec.ts` | Every interactive control does something real. |
| `npm run test:route-crawl` | `e2e/specs/route-crawler.spec.ts` | Every route is reachable and renders. |
| `npm run test:forms` | `e2e/specs/forms-quality.spec.ts` | Form UX (validation, error messaging, submission). |
| `npm run test:overlays` | `e2e/specs/overlays-quality.spec.ts` | Modal/overlay UX. |
| `npm run test:responsive:interactions` | `e2e/specs/responsive-interactions.spec.ts` | Cross-breakpoint interaction UX. |
| `npm run test:keyboard` | `e2e/specs/keyboard-journeys.spec.ts` | Keyboard-only task completion. |
| `npm run test:copy` | `e2e/specs/copy-quality.spec.ts` | Copy/wording quality checks. |
| `npm run test:errors` | `e2e/specs/error-recovery.spec.ts` | Error-state recovery UX. |

## How the evidence runner uses these

In `scripts/run-quality-evidence.mjs`, the `full` profile's `UX` rollup
(`statusFor(commands, ["click-audit", "route-crawl", "forms", "overlays",
"responsive", "keyboard", "copy", "errors", "ux"])`) reports as a single
`UX` row in `quality/execution/latest/summary.md`; `Journeys` is a separate
row covering `journeys`/`journeys-headed`. A failure in any one of these
component specs marks the whole `UX` (or `Journeys`) row `failed` — check
the individual `.log` files (see [`evidence.md`](evidence.md)) to find
which specific spec regressed.

## What automation cannot judge

Automated UX specs verify *mechanics* (does the flow complete, does the
control respond, does the route render) — not *quality* (is this the
obvious path, does the wording make sense to a new user, does this feel
trustworthy). Automation cannot self-approve subjective UX; per
`quality/checklists/manual-ux-review.json`, the manual UX review scope
explicitly includes: new user comprehension, page orientation, navigation
clarity, visual hierarchy, wording and primary-action clarity, mobile
usability, Hebrew quality, English quality, terminology and complexity,
overlap and clipping, dark-mode controls, and overall trust. That checklist
starts `status: "notRun"` and only a human reviewer may change it — see
[`manual-review.md`](manual-review.md).

## When this module is required

Any task classified as `UX review`, and any `feature` task with a visible
UI surface, per `.agent/manifest.json`'s `quality.ux-validation` and
`workflow.ux-review` entries.
