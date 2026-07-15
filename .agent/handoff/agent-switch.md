# Agent Switch

## Purpose

Defines the exact sequence an agent follows when resuming a task handed off
by a different agent family — Codex to Claude Code, or Claude Code to
Codex — so no context is lost and no completed work is repeated.

## Resume sequence: Codex hands off to Claude Code (or vice versa)

1. Read `.agent/master.md`.
2. Read the active task prompt (the relevant file under `.agent/prompts/`
   for the task type).
3. Read `.agent/state/current-task.json`, `current-progress.json`,
   `known-issues.json`, `quality-status.json`, `research-progress.json`,
   `latest-handoff.json`, and `next-actions.json`.
4. Read the latest handoff document and `quality/execution/latest/summary.md`.
5. Verify the actual Git state (`git status`, current branch, current
   commit) against what the handoff claims.
6. Verify the actual changed files against the handoff's file list.
7. Re-run focused tests for the affected area to confirm the handoff's
   reported state still holds.
8. Continue the task without repeating already-completed work
   unnecessarily.
9. Preserve existing commits — do not amend, rebase, or rewrite history
   left by the other agent.
10. If stopping again before the task is complete, produce a new handoff
    document per `.agent/handoff/handoff-template.md`.

## Reverse direction

The same 10 steps apply, in the same order, when Claude Code hands off to
Codex. Neither direction gets a shortcut: the resuming agent — whichever
family it is — always re-verifies real state (steps 5–7) rather than
trusting the handoff document alone, because state may have drifted
between when the handoff was written and when it is read.

## Rules

- Do not skip steps 5–7 even if the handoff looks complete and recent —
  verification is what makes cross-agent handoff safe.
- Do not fabricate a "no changes needed" result for step 7 without actually
  running the tests.
- If verification (steps 5–7) contradicts the handoff, stop and reconcile
  the discrepancy before continuing — treat it as a stop condition per
  `.agent/master.md` §9, not something to silently paper over.
