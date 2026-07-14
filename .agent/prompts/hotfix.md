# Hotfix Prompt

## Purpose

Frame an urgent, production-impacting fix. A hotfix follows the same
debugging discipline as a bugfix under tighter time pressure — pressure that
must never lower the bar on root-cause analysis, evidence, or authorization.

## Task-specific checklist

- Confirm this genuinely requires urgent handling (production breakage,
  data risk, security exposure) rather than being a normal bugfix labeled
  urgent.
- Scope the fix to the minimum change that resolves the urgent issue; defer
  broader cleanup to a follow-up task.
- Branch per `.agent/git/branch-strategy.md`'s hotfix convention; never
  commit directly to `main`.
- Still reproduce the issue and identify the root cause — urgency does not
  permit a guess-and-ship fix.
- Add a regression test even under time pressure; if a full test run cannot
  complete before the fix must ship, say so explicitly rather than skipping
  evidence silently.
- Confirm a rollback path exists per `.agent/release/rollback.md`.
- Never skip the push/merge authorization requirement, even for an urgent
  fix.

## Shared workflow to load

Load `.agent/workflow/debugging.md` for the full process; this file adds
nothing to that process except task-specific framing and urgency-handling
notes.
