# Review Workflow

## Purpose

Human review states and who/what can move a candidate to published.
Defines the state machine that `knowledge-ingestion.md` steps 23–26
operate against.

## States

See `knowledge-ingestion.md` for the full status list (`discovered` …
`rejected`). This file governs the review-specific transitions:
`pendingReview` → `approved` | `rejected` | `needsRevision`, and
`published` → `warning` | `stale` | `deprecated` → back to `pendingReview`
on re-review.

## Who can do what

- **Agents** (`agents.knowledge-curator`, `agents.research-agent`) may
  move an item from `discovered` through `pendingReview`. They cannot
  self-approve.
- **A human reviewer** is required to move any item from `pendingReview`
  to `approved`, `rejected`, or `needsRevision` — recorded in
  `review-record.schema.json`.
- **Publish** (`pendingReview`-approved → `published`) happens only after
  an `approved` review record exists; an agent may perform the mechanical
  publish step but only against an existing approval, never in place of
  one.
- **Critical content** (see `knowledge-ingestion.md`'s critical-content
  list) requires a human reviewer explicitly identified by name/handle,
  not a generic "reviewed" flag.

## Re-review

Content that degrades to `stale`, `deprecated`, or is flagged `warning` is
routed back to `pendingReview` for a fresh human decision — it is never
quietly kept `published` unflagged, and it is never auto-unpublished
without a review record either.

## Rejection handling

A `rejected` candidate is kept (not deleted) with the reviewer's notes, so
future research on the same topic can see why a prior candidate was
declined (see `.agent/memory/failure-memory.md`).

## Related modules

`knowledge-ingestion.md`, `content-generation.md`,
`review-record.schema.json`, `.agent/agents/knowledge-curator.md`.
