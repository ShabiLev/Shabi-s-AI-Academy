# UX Review

## Purpose

Define the task-completion and journey-based UX inspection process — does a
real user actually accomplish the thing, not just "does the component
render." This is phase 12 of [`development.md`](development.md) and the
primary workflow for the `UX review` task type.

## When to load

Load for `UX review` task type, and for `feature` task type whenever a
change introduces or alters a user-facing journey (onboarding, navigation,
a multi-step flow).

## Prerequisites

- The change is implemented and passes [`ui-validation.md`](ui-validation.md).
- The specific user journey(s) affected are named (e.g. "first-run
  onboarding," "switch to Advanced mode," "sign in via Supabase").

## Required actions

1. Run `npm run test:journeys` (Playwright config
   `playwright.journeys.config.ts`) covering realistic, end-to-end
   task-completion flows.
2. Run `npm run test:ux` (Playwright config `playwright.ux.config.ts`) for
   broader UX-quality coverage; use `npm run test:ux:headed` to visually
   observe a specific flow.
3. Run `npm run test:copy` for wording/terminology consistency and
   `npm run test:errors` for error-recovery behavior on the affected
   journey.
4. Walk the journey end to end as a new user would: orientation, navigation
   clarity, visual hierarchy, primary-action clarity, and task completion —
   the same scope enumerated in `quality/runtime/execution/latest/manual-review.md`
   under `manualUxReview`.
5. Check both Hebrew and English quality of the copy encountered along the
   journey, and both RTL and LTR layout, per
   [`../knowledge/i18n.md`](../knowledge/i18n.md) and
   [`../knowledge/rtl-ltr.md`](../knowledge/rtl-ltr.md).
6. Check mobile usability and dark-mode controls for the same journey — both
   are explicit scope items for the manual UX gate.
7. Record concrete findings (what broke task completion, what confused
   orientation) rather than a pass/fail with no detail.
8. Hand the findings to a human reviewer to actually complete
   `manualUxReview` in `quality/runtime/execution/latest/manual-review.md` — the
   agent's automated walk-through informs but does not replace this.

## Prohibited actions

- Marking `manualUxReview` as `passed` from automated test output —
  per [`../quality/manual-review.md`](../quality/manual-review.md) only a
  human reviewer may change that record, and only after actually completing
  the review.
- Reviewing only the happy path when the journey has failure, retry, or
  cancellation states relevant to task completion.
- Treating a passing `test:journeys`/`test:ux` run as sufficient without
  also walking the journey for orientation/comprehension issues automation
  cannot catch (wording clarity, visual hierarchy, trust signals).
- Reporting UX review "complete" while `manualUxReview` is still `notRun`.

## Deliverables

- Passing `npm run test:journeys` and `npm run test:ux` for the affected
  journey(s).
- A findings note covering the `manualUxReview` scope items, ready for a
  human reviewer to act on.

## Evidence requirements

Automated results feed `quality/runtime/execution/latest/` via
[`../quality/evidence.md`](../quality/evidence.md). The manual gate stays in
`quality/runtime/execution/latest/manual-review.md` as `notRun` until a named human
reviewer updates it — never promoted by automation, per
[`../quality/manual-review.md`](../quality/manual-review.md).

## Exit criteria

`test:journeys`, `test:ux`, `test:copy`, and `test:errors` all pass for the
affected journey, findings are documented for the human reviewer, and the
task report explicitly states `manualUxReview` is still pending human
completion (not silently omitted).
