# Evaluation architecture

## System boundary

Version 1.9 is a browser-local deterministic evaluation system. It does not add
a backend, a provider SDK, browser credentials, connector execution, cloud
sync, or background work. A future real-provider implementation requires a
separate server-boundary architecture and security review.

## Layering

1. **Catalog:** immutable built-in rubrics, evaluators, and reviewed Failure
   Case examples.
2. **Domain:** schemas, bounds, safe IDs, state transitions, scoring,
   certification, version comparison, checksums, and redaction.
3. **Repositories:** actor-scoped local persistence, quarantine, retention,
   migration, backup/import, independent reset, and immutable snapshots.
4. **Runtime:** deterministic competitor execution, evaluator passes,
   cross-comparison, certification, pause/continue, and trace emission.
5. **Application:** typed contexts/selectors coordinate routes and user actions.
6. **Presentation:** accessible pages and components; no storage/provider logic.

Domain and repository modules must not import React. UI components must not read
or write localStorage directly.

## Core records

```ts
interface EvaluationExperiment {
  schemaVersion: 1;
  id: string;
  name: string;
  missionSnapshotId: string;
  competitorIds: string[];
  rubricId: string;
  evaluatorIds: string[];
  repetitionCount: number;
  seed: string;
  status:
    | "draft"
    | "ready"
    | "running"
    | "paused"
    | "needs-evidence"
    | "completed"
    | "cancelled"
    | "blocked";
  resultIds: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
```

Every run additionally freezes `VersionedEntityRef` values for Mission,
Context Pack, competitors, prompts, teams, rubric, and evaluators and records
canonical input/result hashes.

## Repository domains

- `shabis-ai-academy:evaluation-rubrics:v1:<actorId>`
- `shabis-ai-academy:evaluation-experiments:v1:<actorId>`
- `shabis-ai-academy:evaluation-runs:v1:<actorId>`
- `shabis-ai-academy:evaluation-suites:v1:<actorId>`
- `shabis-ai-academy:failure-library:v1:<actorId>`
- `shabis-ai-academy:entity-versions:v1:<actorId>`
- `shabis-ai-academy:connected-previews:v1:<actorId>`

Each repository has explicit item/byte/string/depth limits, safe-key checks,
checksums, stable ordering, deduplication, corruption quarantine, and
domain-only reset. Exact limits belong in implementation constants and tests;
they must not be silently raised to accept malformed input.

## Snapshot and consistency model

- Start performs validate → canonicalize → hash → freeze → persist atomically.
- Snapshots are immutable and deduplicated by actor plus checksum.
- A run references versions and snapshot hashes, never mutable live objects.
- Pause records phase, competitor/repetition/evaluator indices, transition
  counter, and state fingerprint.
- Continue recomputes the fingerprint. Drift blocks or offers an explicit fork;
  it never merges changed versions into the run.
- Certified results cannot be edited, deleted by ordinary domain actions, or
  re-certified with different evidence.

## Migration and backup

Version 1.9 creates new domains without rewriting Version 1.8 Mission records.
Migration is idempotent and non-destructive; invalid records are quarantined
with a redacted reason. Backup preview validates every new domain, quotas,
checksums, actor ownership, and cross-references before a transactional apply.
Any failure restores the pre-import snapshot. Older clients reject unknown
domains rather than partially applying them.

## Observability

The authoritative user-visible record is the safe trace plus referenced
evidence. Analytics is consent-gated and allowlisted, excludes content/IDs, and
cannot reconstruct a Mission. Runtime logs are local and redacted. No internal
reasoning or chain-of-thought is collected.

## Performance design

Collections use bounded indexes and summaries; trace views paginate or
virtualize safely; derived comparison data is memoized by immutable hashes.
The release test matrix includes 100+ runs, long traces, version histories,
suites, backup, and mobile rendering. A feature must not evade bounds by
splitting one logical payload into unlimited child records.
