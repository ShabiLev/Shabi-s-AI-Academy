# Refactor Prompt

## Purpose

Frame a refactor as a behavior-preserving structural change on top of the
shared AOS refactoring workflow.

## Task-specific checklist

- State explicitly what the refactor does and does not change in behavior
  before starting.
- Confirm regression test coverage exists for the code being restructured
  before changing it; add coverage first if it's missing.
- Keep the change reversible and scoped — do not combine a refactor with a
  feature or bugfix in the same task.
- Re-run the full existing test suite for the affected area after the
  refactor and confirm identical outcomes, not just identical test names.
- Check for any ADR or coding standard that constrains the target structure
  (`.codex/adr/`, `.codex/standards/coding.md`).
- Do not change public interfaces, exported types, or storage schemas as a
  side effect unless that is the explicit purpose of the task.

## Shared workflow to load

Load `.agent/workflow/refactoring.md` for the full process; this file adds
nothing to that process except task-specific framing.
