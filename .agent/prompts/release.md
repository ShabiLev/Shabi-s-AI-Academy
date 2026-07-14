# Release Prompt

## Purpose

Frame the task of preparing a release, on top of the governing release
checklist and quality gates.

## Task-specific checklist

- Confirm the release version and Conventional Commit scope match the
  active `.codex/release-*/` specification.
- Run the full evidence profile (`quality:evidence:full`) rather than the
  fast profile used for routine changes.
- Walk every quality gate in `.agent/quality/release-gates.md`; record any
  waived gate with an explicit reason, never silently.
- Update `CHANGELOG.md` per `.agent/release/changelog.md` and confirm
  versioning per `.agent/release/versioning.md`.
- Confirm manual review gates (UX, security, content) are genuinely
  completed by a human, not marked passed by automation.
- Produce the release report per `.agent/release/release-report.md`.
- Do not push, merge, or tag the release without explicit user
  authorization in the current session.

## Shared workflow to load

Load `.agent/release/release-checklist.md` for the full process; this file
adds nothing to that process except task-specific framing.
