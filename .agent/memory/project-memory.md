# Project Memory

## Categories covered

Stable project facts, and accepted conventions.

## Where it's recorded

This file, `.agent/memory/project-memory.md`, appended to directly. Entries
are organized under `## Stable Facts` and `## Accepted Conventions`
headings.

## What belongs here

- Facts about the project that are true regardless of the current task:
  stack choices, supported languages/locales, deployment target, the fact
  that the app is local-first with optional cloud sync, etc.
- Conventions the team/agents have agreed to follow that aren't already
  captured in `.codex/standards/` (e.g. a naming pattern adopted
  mid-project, a preferred library for a recurring problem).

## What doesn't belong here

- Anything that changes with the current task (see
  `.agent/memory/task-memory.md`).
- A one-off architectural decision with a rationale and alternatives
  considered (see `.agent/memory/decision-memory.md` — this file records
  the resulting convention, not the decision trail).
- Any secret, credential, or raw environment value (see
  `.agent/memory/memory-policy.md`).

## Example entry shape

_(placeholder structure — not real project data)_

```
### [YYYY-MM-DD] _[short fact or convention title]_
- Category: _[stable fact | accepted convention]_
- Statement: _[one or two sentence statement of the fact/convention]_
- Source: _[task, ADR, or discussion this came from]_
- Status: _[active | superseded by <entry>]_
```

## Update rule

New entries are appended, not inserted out of order. A superseded entry is
marked `Status: superseded by <new entry date/title>` rather than deleted,
so history remains traceable.
