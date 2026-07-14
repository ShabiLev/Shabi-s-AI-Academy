# Decision Memory

## Categories covered

Architecture and process decisions.

## Where it's recorded

This file records lightweight, AOS-process decisions. Significant
architectural decisions that constrain future implementation are recorded
as ADRs under `.codex/adr/` — this file cross-references them rather than
duplicating their content.

## What belongs here

- A short record of a decision and its rationale, for decisions not
  significant enough to warrant a full ADR (e.g. "we chose test utility
  pattern X over Y").
- A cross-reference entry pointing to each accepted ADR relevant to
  ongoing work, so agents don't have to re-scan `.codex/adr/` from scratch
  every session.

## What doesn't belong here

- A full ADR — those live in `.codex/adr/` with their own accepted
  process; this file does not replace or duplicate them.
- A convention that's already settled and routine (see
  `.agent/memory/project-memory.md`).
- A rejected approach (see `.agent/memory/failure-memory.md` — a decision
  entry records what was chosen and why; a rejected approach records what
  was tried and abandoned).

## Example entry shape

_(placeholder structure — not real project data)_

```
### [YYYY-MM-DD] _[decision title]_
- Decision: _[what was decided]_
- Rationale: _[why, in one or two sentences]_
- Alternatives considered: _[brief list]_
- Related ADR: _[.codex/adr/ADR-XXX.md, or "none"]_
- Status: _[active | superseded by <entry>]_
```

## Update rule

Append new entries; mark superseded ones rather than deleting them. If a
decision here later becomes significant enough to need a full ADR, write
the ADR and update this entry to point to it.
