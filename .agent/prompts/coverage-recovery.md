# Coverage Recovery Prompt

## Purpose

Frame the task of recovering a coverage regression by adding real tests,
never by lowering a threshold, on top of the governing coverage policy.

## Task-specific checklist

- Identify exactly which files/branches caused the coverage drop using the
  actual coverage report, not an assumption.
- Treat any coverage threshold change as Critical risk per
  `.agent/loaders/task-classifier.md`; do not lower a threshold to "fix" a
  regression.
- Add tests that exercise the uncovered lines/branches with real
  assertions, not tests that merely execute code without checking outcomes.
- Re-run the coverage command and confirm the threshold is met by the
  actual report, not by rounding or partial output.
- If recovering coverage is genuinely not possible without a threshold
  change, stop and ask the user rather than silently adjusting the
  threshold or CI config.

## Shared workflow to load

Load `.agent/quality/coverage.md` for the full process; this file adds
nothing to that process except task-specific framing.
