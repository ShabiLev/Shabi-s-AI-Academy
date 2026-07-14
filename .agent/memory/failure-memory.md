# Failure Memory

## Categories covered

Known failures, and rejected approaches.

## Where it's recorded

This file, `.agent/memory/failure-memory.md`, under `## Known Failures`
and `## Rejected Approaches` headings.

## What belongs here

- A known failing test, flaky behavior, or unresolved defect that persists
  across sessions, so a new agent doesn't waste time rediscovering it.
- An approach that was tried and explicitly rejected (with a reason), so
  it isn't proposed again without new information.

## What doesn't belong here

- A failure that was fixed — remove or mark it resolved once addressed;
  this file tracks what's still true, not a changelog of every past bug.
- A decision about what was chosen instead (see
  `.agent/memory/decision-memory.md` — that file records the chosen path;
  this one records the abandoned path and why).
- Fabricated or assumed failures — only record a failure that was
  actually observed by running the relevant command or test.

## Example entry shape

_(placeholder structure — not real project data)_

```
### [YYYY-MM-DD] _[short failure or rejected-approach title]_
- Type: _[known failure | rejected approach]_
- Description: _[what fails, or what was tried]_
- Evidence: _[command/test run and its actual output or path to evidence]_
- Reason (if rejected approach): _[why it was abandoned]_
- Status: _[open | resolved on <date> | permanently rejected]_
```

## Update rule

Mark an entry resolved (with date) rather than deleting it when a known
failure is fixed — this preserves a short history of what used to be
broken. Never record a failure that wasn't actually reproduced.
