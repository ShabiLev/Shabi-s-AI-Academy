# Handoff Template

Use this structure for every handoff document. Do not omit a field — record
"none" or "not applicable" if a field genuinely does not apply, but never
delete it. See `.agent/handoff/handoff-policy.md` for when this template
must be used, and `.agent/schemas/handoff.schema.json` for the
machine-readable shape.

## Task

_[one-line description of the task being handed off]_

## Scope

_[what is and is not included in this task]_

## Branch

_[exact branch name]_

## Starting commit

_[commit hash the task began from]_

## Latest commit

_[commit hash as of this handoff]_

## Files changed

_[list of files touched, or a diff stat]_

## Tests executed

_[commands actually run and their pass/fail/not-available status]_

## Evidence path

_[path under quality/runtime/execution/latest/ or
quality/runtime/execution/runs/<RUN_ID>/ holding evidence for this task]_

## Open failures

_[any known failing test, broken build, or unresolved defect]_

## Warnings

_[anything the next agent should be cautious about: partial migrations,
flaky tests, unreviewed code, etc.]_

## Manual review

_[status of any required human review gate: UX, security, content — done,
pending, or not applicable]_

## Next action

_[the single next step the receiving role/agent should take]_

## Prohibited assumptions

_[anything the next agent must not assume — e.g. "do not assume the
migration ran in production", "do not assume this was reviewed for
security"]_

## Rules

- Every field must reflect actual, verified state — never a guess or a
  memory of an earlier plan.
- If a field is unknown, state that explicitly rather than leaving it
  blank.
