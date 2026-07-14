# Implementation

## Purpose

Govern how a code change is actually made once a plan exists: small,
reversible, scoped edits that match
[`.codex/standards/coding.md`](../../.codex/standards/coding.md), not a
general coding style guide. This is phase 8 of
[`development.md`](development.md).

## When to load

Load for `feature`, `bugfix`, `hotfix`, and `refactor` task types, after
[`planning.md`](planning.md) (or, for bugfix/hotfix, after
[`debugging.md`](debugging.md) has established a root cause).

## Prerequisites

- A stated plan or root cause exists.
- The current branch is a task branch, not `main`
  (see [`../git/branch-strategy.md`](../git/branch-strategy.md)).
- `git status` has been checked so unrelated local changes are not
  clobbered.

## Required actions

1. Make the smallest change that satisfies the stated scope — resist
   drive-by improvements outside it.
2. Keep TypeScript strict; do not introduce avoidable `any` per
   [`.codex/standards/coding.md`](../../.codex/standards/coding.md).
3. Isolate domain/business logic in pure, testable functions; keep JSX free
   of business logic per the same standard.
4. Reuse existing focused components and hooks before adding new ones —
   check [`../knowledge/react.md`](../knowledge/react.md) and
   [`../knowledge/state-management.md`](../knowledge/state-management.md)
   for the conventions already in use in `App.tsx` and its providers.
5. Preserve user-authored work and existing storage shapes; do not change a
   storage schema without also handling legacy/malformed data, per
   [`../knowledge/storage.md`](../knowledge/storage.md).
6. Add or update translations for every new user-facing string in both
   Hebrew and English, and use semantic RTL/LTR markup, not hard-coded
   `left`/`right`, per [`../knowledge/rtl-ltr.md`](../knowledge/rtl-ltr.md).
7. Add explicit return types at module/API boundaries and validate input
   early, per the coding standard's recommended practices.
8. Update or add the smallest reliable test alongside the change — do not
   defer tests to a later pass (see [`testing.md`](testing.md)).
9. Re-run `git status` and `git diff` periodically during implementation to
   confirm the change matches the stated scope.

## Prohibited actions

- Duplicated domain rules, business logic in JSX, speculative abstractions,
  or unrelated refactors — all explicitly forbidden by
  [`.codex/standards/coding.md`](../../.codex/standards/coding.md).
- Silent error swallowing; failures must surface, per the same standard and
  `master.md` §10 principle 12.
- Introducing a new secret, credential, or connection string into source —
  see [`../security/secrets.md`](../security/secrets.md).
- Calling an external provider directly from a UI component instead of
  through an existing typed boundary, per `AGENTS.md`.
- Changing a coverage threshold, CI gate, or test-weakening shortcut to make
  a change pass — that is a `Critical`-risk action per
  [`../loaders/task-classifier.md`](../loaders/task-classifier.md) and
  requires stopping, not silently doing it.

## Deliverables

- A diff scoped to the stated plan, with tests updated alongside it.
- Any new/changed translation strings in both languages.

## Evidence requirements

Implementation itself produces no evidence file, but every change made here
must be covered by the test run recorded in [`testing.md`](testing.md) and
the evidence capture in [`../quality/evidence.md`](../quality/evidence.md)
before the task is reported done.

## Exit criteria

The diff matches the stated scope, compiles/lints cleanly (`npm run lint`,
`npm run build`), preserves existing behavior outside the stated change, and
has at least the minimum test coverage described in
[`testing.md`](testing.md).
