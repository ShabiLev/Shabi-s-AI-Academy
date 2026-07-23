# Documentation

## Purpose

Define when and how docs, `CHANGELOG.md`, and AOS module descriptions must
be updated alongside a code change — documentation is not a separate,
deferrable task, it is part of Definition of Done per
[`.codex/standards/qa.md`](../../.codex/standards/qa.md).

## When to load

Load for `documentation` task type as the primary workflow, and as phase 14
of [`development.md`](development.md) for `feature` and `release` task
types whenever behavior changed.

## Prerequisites

- The behavior change (if any) is implemented and tested.
- The set of documentation surfaces potentially affected is known:
  `.codex/architecture/`, `.codex/standards/`, `AGENTS.md`, `CLAUDE.md`,
  `CHANGELOG.md`, `.agent/manifest.json`/`registry.json` descriptions, and
  in-app help/copy.

## Required actions

1. Identify every doc surface the change makes stale — do not assume "just
   the README." Check `.codex/architecture/overview.md` for structural
   changes, the relevant `.codex/standards/*.md` for rule changes, and
   in-app copy for user-facing text.
2. Update `CHANGELOG.md` per [`../release/changelog.md`](../release/changelog.md)
   Keep-a-Changelog conventions when the change is user-visible or affects
   the public API/behavior.
3. If the change adds, removes, or changes the purpose of an `.agent/`
   module, update its entry in [`../manifest.json`](../manifest.json) and
   any `taskTypes` list in [`../registry.json`](../registry.json) that
   should reference it — do not let the catalog drift from reality.
4. Run `npm run docs:check` (backed by
   `scripts/check-codex-docs.mjs`) to catch broken cross-references and
   stale `.codex/` documentation links.
5. For prompt/content changes, run `npm run catalog:check` (and
   `catalog:update`/`catalog:report` if the catalog itself needs
   regenerating) so the Prompt Library/Prompt Pack catalog stays in sync.
6. Translate every new or changed user-facing string into both Hebrew and
   English per [`../knowledge/i18n.md`](../knowledge/i18n.md) — a doc update
   that only updates one language is incomplete.
7. Keep documentation changes in the same commit/PR as the behavior change
   they describe wherever practical, so history stays reviewable per
   [`.codex/standards/git.md`](../../.codex/standards/git.md).

## Prohibited actions

- Shipping a behavior change without a corresponding doc/changelog update
  when the change is user-visible or affects the public contract.
- Editing `.codex/` standards or architecture files to describe behavior
  that was not actually implemented (documentation must describe shipped
  behavior, not aspirational behavior — see
  [`../knowledge/observability.md`](../knowledge/observability.md) on not
  fabricating unverified state).
- Duplicating workflow rules already defined in another AOS module instead
  of linking to it — see `master.md` §10 principle 4.
- Leaving `npm run docs:check` failing and reporting the task done anyway.

## Deliverables

- Updated `CHANGELOG.md` entry (when applicable).
- Updated `.codex/` doc(s) or `.agent/manifest.json`/`registry.json` entries
  that the change affects.
- Passing `npm run docs:check` (and `npm run catalog:check` when the prompt
  catalog is affected).

## Evidence requirements

Record the `npm run docs:check` (and, if run, `catalog:check`) result in
`quality/runtime/execution/latest/` via the evidence run per
[`../quality/evidence.md`](../quality/evidence.md) — both are part of the
`fast` and `full` evidence profiles in `scripts/run-quality-evidence.mjs`.

## Exit criteria

Every documentation surface identified in step 1 is updated, `npm run
docs:check` passes, and any catalog affected passes `npm run catalog:check`.
