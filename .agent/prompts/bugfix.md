# Bugfix Prompt

## Purpose

Frame a bug-fix task around finding and fixing the root cause, not the
symptom, on top of the shared AOS debugging workflow.

## Task-specific checklist

- Reproduce the bug before touching code; record the exact repro steps and
  the expected vs. actual behavior.
- Identify the root cause, not just the line where the symptom surfaces; do
  not patch around a failing assertion or silence an error.
- Check whether the same defect pattern exists elsewhere in the affected
  module.
- Add a regression test that fails before the fix and passes after it.
- Confirm the fix does not touch unrelated code — no incidental refactors.
- If the bug affects user-authored data, load `.agent/knowledge/storage.md`
  before changing anything.
- State the affected risk domain (UI, storage, auth, sync) so the correct
  security/knowledge module is loaded alongside this one.

## Shared workflow to load

Load `.agent/workflow/debugging.md` for the full process; this file adds
nothing to that process except task-specific framing.
