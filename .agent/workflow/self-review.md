# Self-Review

## Purpose

Define the checklist an agent runs against its own change, on the actual
diff, before producing a final report. This is phase 16 of
[`development.md`](development.md) and the module backing the
`self-review` status field that already exists in
`quality/runtime/execution/latest/self-review.md`.

## When to load

Load for `feature`, `bugfix`, `hotfix`, `refactor`, and `release` task
types, always after testing/evidence capture and before
[`final-report.md`](final-report.md).

## Prerequisites

- Implementation, testing, and evidence capture (phases 8–15 of
  `development.md`) are complete.
- `git diff` / `git diff --cached` for the actual change is available to
  review — this checklist runs against the real diff, not a description of
  intended changes.

## Required actions

1. **Scope check.** Re-read the plan from [`planning.md`](planning.md) and
   confirm the diff matches it — no unrelated files, no drive-by changes.
2. **Code review.** Apply the review checklist from
   [`.codex/standards/coding.md`](../../.codex/standards/coding.md): scope,
   boundaries, error paths, translations, tests, docs, clean diff.
3. **Security review.** Apply
   [`../security/security-policy.md`](../security/security-policy.md) and
   [`../security/secrets.md`](../security/secrets.md) against the diff —
   no secrets, no new unsafe HTML/dynamic execution surfaces per
   [`../security/frontend-security.md`](../security/frontend-security.md).
4. **Accessibility check.** Confirm any changed complex screen/state passed
   [`accessibility.md`](accessibility.md) — do not skip because the change
   "looks purely visual."
5. **Documentation check.** Confirm [`documentation.md`](documentation.md)
   actions were completed for anything the change makes stale.
6. **Test check.** Confirm the focused and full test commands from
   [`testing.md`](testing.md) actually ran and their real results (not
   assumed results) are recorded.
7. **Failure/warning disclosure.** Compile every failure or warning
   encountered into a form suitable for
   `quality/runtime/execution/latest/failures.md` and
   `quality/runtime/execution/latest/warnings.md` — a failure is never silently
   dropped, per `master.md` §10 principle 12.
8. **Diff hygiene.** Run `git status` and `git diff --cached --stat` to
   confirm only intended files are staged, per
   [`.codex/standards/git.md`](../../.codex/standards/git.md).
9. **Update the self-review record.** Set the status in
   `quality/runtime/execution/latest/self-review.md` to reflect that this
   structured review actually happened (it defaults to `notRun` and must
   not be left there once the review is done), following
   [`../templates/self-review.md`](../templates/self-review.md).

## Prohibited actions

- Writing `passed`/complete into `quality/runtime/execution/latest/self-review.md`
  without having actually walked through steps 1–8 against the real diff.
- Treating self-review as a formality that can be summarized without
  reading the diff.
- Omitting a known failure or warning from the record to make the change
  look more complete than it is.
- Running self-review before evidence capture (phase 15) — self-review
  needs the real test/evidence results to check against, not the intended
  ones.

## Deliverables

- An updated `quality/runtime/execution/latest/self-review.md` reflecting the
  actual review performed (not the default `notRun` placeholder), per
  [`../templates/self-review.md`](../templates/self-review.md).

## Evidence requirements

Self-review output is itself evidence and lives under
`quality/runtime/execution/latest/self-review.md` — see
[`../quality/evidence.md`](../quality/evidence.md) for how this fits the
rest of the evidence bundle, and
[`../quality/reporting.md`](../quality/reporting.md) for how it rolls up
into `summary.md`/`summary.json`.

## Exit criteria

Every checklist item above has been walked against the real diff, every
known failure/warning is disclosed, and
`quality/runtime/execution/latest/self-review.md` reflects a completed review, not
the default `notRun` state.
