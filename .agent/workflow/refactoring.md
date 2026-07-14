# Refactoring

## Purpose

Define behavior-preservation rules and the regression coverage a `refactor`
task must have before and after the change — a refactor that changes
observable behavior is not a refactor, it is an undeclared feature or bug.

## When to load

Load for every `refactor` task type, after
[`planning.md`](planning.md) and before
[`implementation.md`](implementation.md).

## Prerequisites

- A plan exists stating exactly what internal structure changes and, more
  importantly, what observable behavior must stay identical.
- Existing tests for the code being refactored have been located; if
  coverage is thin, that gap must be closed *before* refactoring, not after.

## Required actions

1. **Establish a behavior baseline first.** Run the existing test suite for
   the affected area (`npm run test:run`, plus any relevant Playwright specs)
   and confirm it passes before making any change — this is the contract
   the refactor must not break.
2. **Add missing coverage before restructuring** if the current tests do not
   actually exercise the behavior being preserved (see
   [`../knowledge/testing.md`](../knowledge/testing.md) for existing test
   utilities to reuse rather than duplicate).
3. **Change structure, not contracts.** Keep public function signatures,
   component props, storage shapes, and route behavior stable unless the
   task explicitly includes changing them — if it does, that is no longer a
   pure refactor and should be reclassified.
4. **Refactor in the smallest reversible steps** — prefer several small,
   verifiable moves over one large rewrite, so a regression can be isolated
   to a specific step.
5. **Re-run the same baseline suite after each step** to confirm behavior
   parity before moving to the next step.
6. **Check for duplicated logic the refactor was meant to remove** and
   confirm it is actually consolidated, not just moved.
7. **Update tests that asserted on internal structure** (not behavior) where
   the refactor legitimately changes that structure — but never weaken a
   behavioral assertion to make it pass.

## Prohibited actions

- Changing observable behavior, public APIs, storage shapes, or route
  contracts under the label "refactor" without reclassifying the task per
  [`../loaders/task-classifier.md`](../loaders/task-classifier.md).
- Proceeding without a green baseline test run first — you cannot prove
  behavior was preserved if you never captured the "before" state.
- Bundling unrelated feature work into a refactor commit — forbidden by
  [`.codex/standards/coding.md`](../../.codex/standards/coding.md)
  ("unrelated refactors" is itself forbidden in the other direction: no
  refactors hidden inside feature/bugfix commits, and no feature work hidden
  inside a refactor commit).
- Reducing test coverage or deleting tests to make the refactor "simpler"
  without an equivalent replacement.

## Deliverables

- A before/after description of what structurally changed and confirmation
  that no behavior changed.
- A green baseline test run captured before the refactor began, and a green
  run of the same suite after.

## Evidence requirements

The before/after test runs feed [`testing.md`](testing.md) and
[`../quality/evidence.md`](../quality/evidence.md) exactly as any other code
change; the distinguishing evidence for a refactor is that the *same* suite
was run twice with an unchanged pass set (same tests passing, not just "all
green").

## Exit criteria

The baseline suite passes identically before and after, no public
contract changed unintentionally, no unrelated behavior changed, and any
coverage gap discovered during step 2 was closed rather than carried
forward.
