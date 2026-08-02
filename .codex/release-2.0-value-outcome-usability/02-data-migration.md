# Version 2.0 data and migration contract

## Storage plan

The Outcome domain is actor-scoped at
`shabis-ai-academy:outcomes:v2:<normalized-actor-id>`. Projects, workflows,
knowledge and course progress retain their Version 1 storage keys for backward
read compatibility while their envelopes move to schema 2. Backup schema moves
to 3 and includes Outcomes.

## Migration matrix

| Domain | V1.9 input | V2 output | Preservation rule |
| --- | --- | --- | --- |
| Outcomes | absent | empty actor-scoped schema 2 store | no synthetic completion claims |
| Projects | schema 1 | schema 2 with outcome/team/mission/workflow/evidence/deliverable/decision/risk fields | preserve IDs, timestamps, notes and unknown project fields |
| Workflows | schema 1 runs | schema 2 Run Reports | old runs become `Simulated`, retain events and validation codes |
| Knowledge | schema 1 documents | schema 2 documents and context links | preserve content/hash/project links; no RAG claim |
| Course progress | schema 1 click completion | schema 2 evidence-aware progress | prior completion retained as legacy/unverified, not promoted to verified mastery |
| Backup | schema 1 or 2 | schema 3 | validate checksum, preview, transactional rollback |

## Required behavior

- Migration is deterministic and idempotent; a second run is a no-op.
- Invalid records are quarantined or skipped with an explicit diagnostic; valid
  siblings remain available.
- Duplicate IDs are de-duplicated deterministically without merging ownership.
- Orphan references remain visible as unresolved references and never create a
  fabricated entity.
- Actor IDs are normalized and cross-actor import requires an explicit ownership
  transfer decision.
- Partial import failure rolls back every domain written in that transaction.
- A backup is created before destructive replacement or cleanup.
- Unknown fields, original timestamps and stable IDs are retained when safe.

## Rollback

Version 2.0 writes new Outcome data only to the v2 actor-scoped key. Existing
Version 1 keys are not removed. A Version 1.9 backup can therefore be restored
after removing only the Version 2 Outcome key and importing the pre-migration
backup. No automated rollback may silently discard Version 2 outcomes.
