# Versioning, regression, failures, and learning

## Immutable entity versions

```ts
interface VersionedEntityRef {
  entityId: string;
  version: string;
  contentHash: string;
}
```

Agent templates, user Agents, prompts, team presets, and rubrics create
immutable versions. Each version stores bounded content, parent reference,
author/source, changelog, creation time, status, and canonical content hash.
Activating or deprecating a version changes a separate pointer, not history.
Rollback creates a new version from an older one.

Version comparison shows field-level changes as inert text, exact hashes,
provenance, and Missions/evaluations using each version. No destructive
overwrite or silent migration is allowed.

## Regression suites

```ts
interface EvaluationSuite {
  schemaVersion: 1;
  id: string;
  name: string;
  missionSnapshotIds: string[];
  rubricId: string;
  baselineEntityRefs: VersionedEntityRef[];
  status: "draft" | "ready" | "running" | "completed" | "blocked";
  createdAt: string;
  updatedAt: string;
}
```

A suite freezes all case inputs, rubric/evaluator versions, and baseline refs.
Runs preserve per-case evidence and previous outcomes. Comparison classifies
`improvement`, `regression`, `no-change`, or `not-comparable`, with criterion
and evidence rationale. A critical regression blocks publication.

Establishing or replacing a baseline requires an explicit reviewed action,
records the prior baseline and reason, and creates a new suite version. A test
failure, missing evidence, or changed scale never triggers automatic baseline
replacement.

## Failure Library

```ts
interface FailureCase {
  schemaVersion: 1;
  id: string;
  title: LocalizedText;
  category: FailureCategory;
  symptom: LocalizedText;
  rootCause: LocalizedText;
  missedSignal: LocalizedText;
  correctiveAction: LocalizedText;
  reusableRule: LocalizedText;
  evidenceIds: string[];
  sourceRunIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

Allowed categories cover requirement gaps, hallucinated capability, masking
fixtures, stale context, scope creep, self-approval, permission violation,
accessibility/security/performance regression, repository hygiene, and
deployment mismatch. System examples are reviewed immutable catalog records.
User cases remain actor-scoped and are never published automatically.

Creating a Failure Case requires explicit review of source evidence and a
redacted preview. Root cause may be marked unconfirmed; it is never invented.

## Adaptive Skill Map evidence

- Visits and time spent add no skill evidence.
- Failed runs may create inspectable practice evidence.
- `demonstrated` requires high-confidence independent evidence.
- `mastered` requires repeated demonstrated evidence across distinct eligible
  runs; one result never suffices.
- Every evidence item identifies source/version, is inspectable, and can be
  removed without rewriting the source run.
- Recommendations show strengths, gaps, recurring failures, practice Mission,
  relevant lesson, evaluator, confidence, freshness, and limitations.
- No opaque personality, employability, or psychological profile is produced.

## Team recommendations

Recommendations are computed only across comparable local runs and clearly
label source. They show run count, success rate, retry average, common failures,
confidence, freshness, and limitations. Low sample sizes are explicitly low
confidence. Community-derived labels describe provenance, not measured local
performance.

