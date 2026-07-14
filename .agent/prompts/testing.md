# Testing Prompt

## Purpose

Frame a task whose deliverable is new or expanded automated tests, on top of
the shared AOS testing workflow.

## Task-specific checklist

- Identify the specific behavior or regression the new test(s) must cover;
  do not add tests that merely inflate count without asserting real
  behavior.
- Prefer the narrowest test level (unit, then integration, then end-to-end)
  that can catch the target regression.
- Reuse existing test utilities and fixtures per
  `.agent/knowledge/testing.md` rather than creating parallel helpers.
- Confirm the new tests fail against the pre-change code path where
  applicable, to prove they test the right thing.
- Do not weaken existing assertions or skip/disable a test to make a suite
  pass.
- Record which npm test script(s) now cover the new behavior for future
  reference.

## Shared workflow to load

Load `.agent/workflow/testing.md` for the full process; this file adds
nothing to that process except task-specific framing.
