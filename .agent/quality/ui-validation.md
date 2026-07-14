# UI Validation

## Purpose

Manual and automated UI execution checks required before an agent reports a
UI-facing change as done. This is the quality-domain reference behind
[`../workflow/ui-validation.md`](../workflow/ui-validation.md); see also
[`test-selection.md`](test-selection.md), [`ux-validation.md`](ux-validation.md),
and [`evidence.md`](evidence.md).

## Principle

A UI change is not verified by reading the diff. It must actually be
exercised — either by an automated Playwright suite that drives the real
browser, or, where automation cannot judge subjective quality, by a human
looking at the running app. Both are required for user-facing changes; one
does not substitute for the other.

## Automated UI execution (real scripts)

| Script | What it drives |
| --- | --- |
| `npm run test:e2e` | Fast Playwright pass, Desktop Chromium project only. |
| `npm run test:e2e:full` | Full Playwright project matrix. |
| `npm run test:e2e:headed` | Desktop Chromium, headed (visible browser) — useful when an agent needs to actually watch the run. |
| `npm run test:e2e:ui` | Playwright's interactive UI runner, for local debugging only — not an evidence-producing command. |
| `npm run test:click-audit` | `e2e/specs/system-click-audit.spec.ts` — every clickable control resolves to a real action. |
| `npm run test:route-crawl` | `e2e/specs/route-crawler.spec.ts` — every route in the app renders without error. |
| `npm run test:forms` | `e2e/specs/forms-quality.spec.ts` — form validation and submission behavior. |
| `npm run test:overlays` | `e2e/specs/overlays-quality.spec.ts` — modals/dialogs/overlays open, close, and trap focus correctly. |
| `npm run test:responsive:interactions` | `e2e/specs/responsive-interactions.spec.ts` — interaction behavior across breakpoints. |
| `npm run test:keyboard` | `e2e/specs/keyboard-journeys.spec.ts` — keyboard-only navigation of key flows. |
| `npm run test:copy` | `e2e/specs/copy-quality.spec.ts` — visible text/copy checks. |
| `npm run test:errors` | `e2e/specs/error-recovery.spec.ts` — error states are recoverable, not dead ends. |

These are the concrete commands that make up the `full` evidence profile's
UX block in `scripts/run-quality-evidence.mjs` (ids `click-audit`,
`route-crawl`, `forms`, `overlays`, `responsive`, `keyboard`, `copy`,
`errors`, `ux`) and roll up into the `UX` row of
`quality/execution/latest/summary.md`.

## Manual UI execution

Some things automated Playwright specs cannot judge: whether a layout looks
right, whether spacing/alignment reads as broken, whether a control is
discoverable at a glance, whether dark mode looks intentional. For any
change with a visible UI surface:

1. Run the app locally (`npm run dev` or `npm run preview`) and actually
   look at the changed screen(s) in both light and dark mode, and (if the
   change touches bilingual UI) both Hebrew (RTL) and English (LTR) — see
   [`../knowledge/i18n.md`](../knowledge/i18n.md) and
   [`../knowledge/rtl-ltr.md`](../knowledge/rtl-ltr.md).
2. Exercise the exact flow the task changed, not just an adjacent one.
3. Record what was checked in the self-review
   ([`../workflow/self-review.md`](../workflow/self-review.md)) — manual UI
   inspection is not itself a file under `quality/execution/latest/`; it
   feeds the human judgment behind `self-review.md` and the manual UX gate
   in [`manual-review.md`](manual-review.md).

## What this does not replace

This module is about *execution* — did anyone actually drive the UI. It is
distinct from:

- [`ux-validation.md`](ux-validation.md) — task-completion/journey-level UX
  quality.
- [`accessibility.md`](accessibility.md) — axe-based and keyboard
  accessibility compliance.
- [`visual-regression.md`](visual-regression.md) — pixel-level snapshot
  comparison.
