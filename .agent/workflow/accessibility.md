# Accessibility

## Purpose

Define the keyboard, screen-reader, and axe-based accessibility validation
process required for any new or changed complex screen/state. This is phase
of [`development.md`](development.md) folded into UI validation for
`feature`/`bugfix`, and the primary workflow for the `accessibility review`
task type.

## When to load

Load for `accessibility review` task type, and for `feature` task type
whenever a new or materially changed complex screen or interactive state is
introduced (dialogs, forms, navigation, custom widgets).

## Prerequisites

- The change is implemented and passes [`ui-validation.md`](ui-validation.md).
- [`../knowledge/accessibility.md`](../knowledge/accessibility.md) has been
  read for known limitations already accepted in this project.

## Required actions

1. Run `npm run test:a11y` (Playwright project `Accessibility`, using
   `@axe-core/playwright`) against every new or changed complex
   screen/state.
2. Run `npm run test:keyboard` (`e2e/specs/keyboard-journeys.spec.ts`) to
   verify the affected flow is fully keyboard-operable, including visible
   focus at each step.
3. Manually tab through the changed screen/dialog/menu to confirm focus
   order is logical and nothing is a keyboard trap, since axe automation
   does not catch every focus-order defect.
4. Verify accessible names/labels/roles are correct in **both** Hebrew and
   English — a translated string that breaks the accessible name is a
   defect, not just a copy issue, per
   [`.codex/standards/qa.md`](../../.codex/standards/qa.md) "Required
   coverage dimensions."
5. Confirm dialogs/overlays trap focus appropriately and return focus to a
   sensible element on close (`npm run test:overlays` covers overlay
   behavior more broadly and is a useful companion run here).
6. Record any known, accepted accessibility limitation only if it already
   exists in [`../knowledge/accessibility.md`](../knowledge/accessibility.md)
   — do not introduce a new limitation without documenting it there.

## Prohibited actions

- Globally disabling or narrowing axe rules to make `test:a11y` pass instead
  of fixing the underlying defect — forbidden by
  [`.codex/standards/qa.md`](../../.codex/standards/qa.md) ("no ... global
  axe disables to hide defects").
- Shipping a new complex screen/state without running `test:a11y` against
  it at least once.
- Treating keyboard operability as "probably fine" without actually tabbing
  through the flow.
- Marking accessibility review complete while a known regression exists
  undocumented.

## Deliverables

- A passing `npm run test:a11y` run for the affected screen(s)/state(s).
- A passing `npm run test:keyboard` run for the affected flow.
- Confirmation of focus order and accessible names in both languages.

## Evidence requirements

`test:a11y` output feeds `quality/execution/latest/` via
[`../quality/evidence.md`](../quality/evidence.md) and
[`../quality/accessibility.md`](../quality/accessibility.md). Do not report
an accessibility gate as passed unless the command was actually run and
green.

## Exit criteria

`npm run test:a11y` and `npm run test:keyboard` both pass for the affected
surface, keyboard operability was manually confirmed, and no new,
undocumented accessibility limitation was introduced.
