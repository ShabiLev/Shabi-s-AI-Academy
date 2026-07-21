# UI Validation

## Purpose

Require actual browser execution of a UI change before it is reported
done — code review of JSX is not evidence that a component renders,
responds to input, or avoids console/page errors.

## When to load

Load for `feature`, `bugfix`, and `UX review` task types whenever the
change affects rendered output, interaction, or navigation. This is phase
11 of [`development.md`](development.md).

## Prerequisites

- The change builds (`npm run build`) and the dev server can run
  (`npm run dev`) or the existing Playwright suite can target it.
- Affected routes/components/viewports are identified from the plan in
  [`planning.md`](planning.md).

## Required actions

1. Run the standard fast E2E project: `npm run test:e2e` (Desktop Chromium
   only) for the affected specs, or `npm run test:e2e:full` for
   cross-browser coverage on release-scale changes.
2. Run the targeted quality specs relevant to the change: `npm run
   test:click-audit` for interactive-element coverage, `npm run
   test:route-crawl` for navigation/route integrity, `npm run test:forms`
   for form behavior, `npm run test:overlays` for dialogs/menus/toasts, and
   `npm run test:responsive:interactions` for touch/viewport interaction.
3. Execute the change at the viewport matrix required by
   [`.codex/standards/qa.md`](../../.codex/standards/qa.md): 320×568,
   360×800, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080 — at minimum
   for any changed layout, dialog, or navigation surface.
4. Confirm no horizontal overflow, no unhandled console/page errors, and no
   broken focus order at any tested viewport.
5. For interactive/headed manual observation, use `npm run test:e2e:headed`
   or `npm run test:ux:headed` to actually watch the flow execute rather
   than relying on headless pass/fail alone.
6. Check both Hebrew RTL and English LTR renderings of any changed screen,
   per [`../knowledge/rtl-ltr.md`](../knowledge/rtl-ltr.md).
7. Record findings against
   [`../quality/ui-validation.md`](../quality/ui-validation.md)'s manual
   browser execution requirements.

## Prohibited actions

- Reporting a UI change "verified" from reading code or types alone, with
  no browser execution.
- Using brittle CSS selectors or arbitrary waits instead of accessible
  locators and observable state — forbidden by
  [`.codex/standards/testing.md`](../../.codex/standards/testing.md).
- Skipping the viewport matrix for a change that touches responsive layout,
  dialogs, or navigation.
- Marking `manualUxReview` as passed automatically — it can only be updated
  by a human reviewer per
  [`../quality/manual-review.md`](../quality/manual-review.md) and the
  `quality/runtime/execution/latest/manual-review.md` record.

## Deliverables

- Passing runs of the relevant `test:e2e*` and targeted quality specs
  (click-audit, route-crawl, forms, overlays, responsive-interactions) for
  the affected surface.
- A short note on which viewports and both language directions were
  actually exercised.

## Evidence requirements

Test run output feeds `quality/runtime/execution/latest/` via
[`../quality/evidence.md`](../quality/evidence.md). The `manualUxReview`
gate in `quality/runtime/execution/latest/manual-review.md` stays `notRun` until an
actual human completes it — automated UI execution does not substitute for
it, per [`../quality/manual-review.md`](../quality/manual-review.md).

## Exit criteria

The affected UI surface has been executed in a real browser (headless or
headed) across the required viewports and both language directions, with
no unhandled console/page errors, before the change is reported as UI-
verified.
