# Task Memory

## Categories covered

Current task state, and pending reviews.

## Where it's recorded

This file records the pattern; the actual current-task state for an
in-flight task lives in that task's handoff document
(`.agent/handoff/handoff-template.md`), not duplicated here. This file is a
lightweight cross-task index of what's currently open, not a second copy of
task detail.

## What belongs here

- A short index entry per currently open task: what it is, which branch,
  and where its live handoff document is.
- Pending reviews awaiting a human (UX, security, content, architecture)
  that haven't yet been resolved, so they aren't lost between sessions.

## What doesn't belong here

- Full task detail — that belongs in the task's own handoff document, not
  duplicated into this index.
- Completed tasks — once a task is done and reported, remove its entry
  here (the record of what happened lives in Git history and the final
  report, not in this index).
- Durable facts that outlive the task (see
  `.agent/memory/project-memory.md`).

## Example entry shape

_(placeholder structure — not real project data)_

```
### _[task short name]_
- Branch: _[branch name]_
- Status: _[in progress | blocked | awaiting review]_
- Handoff: _[path to the latest handoff document]_
- Pending review: _[none | UX | security | content | architecture — with
  who/what is needed]_
```

## Update rule

Add an entry when a task goes multi-session; remove it once the task is
complete and reported. This index must never be the only record of a
pending review — the underlying handoff document is authoritative if the
two ever disagree.
