# Trace and evidence

## Purpose

The trace reconstructs observable decisions and state transitions without
collecting hidden chain-of-thought. Evidence proves a criterion claim; a trace
records that the claim and evidence were processed.

## Trace schema

```ts
interface TraceEvent {
  schemaVersion: 1;
  id: string;
  runId: string;
  sequence: number;
  timestamp: string;
  actorType: "user" | "conductor" | "agent" | "evaluator" | "system";
  actorId: string;
  eventType: TraceEventType;
  summary: LocalizedText;
  evidenceIds: string[];
  metadata: SafeTraceMetadata;
}
```

`SafeTraceMetadata` is an allowlisted, bounded flat structure. It may contain
phase, status, permission label, gate, retry number, version/hash prefixes,
confidence, evidence type, and next action. It may not contain arbitrary nested
objects or user content.

## Required event properties

- Sequence is contiguous and unique within a run.
- Timestamp, actor, phase, event type, permission, gate, evidence references,
  retry, status, and next action are explicit when applicable.
- Input/output are represented by localized safe summaries and checksums, not
  raw private content.
- A failed, skipped, blocked, cancelled, or not-scored action remains visible.
- Events are append-only; correction adds a new event rather than editing one.

## Evidence model

Evidence is immutable, actor-scoped, checksummed, typed, bounded, deduplicated,
and linked to its source run and entity versions. Each finding cites evidence
IDs. Missing evidence is stored as a localized requirement, not a fabricated
placeholder record. Imported evidence remains uncertified until validated.

Certification verifies:

- evidence exists and checksum matches;
- actor/run ownership and source versions match;
- evidence type satisfies the criterion;
- evaluator is independent;
- confidence policy is met;
- no required evidence is missing;
- Reality Checker did not block.

## Viewer

Filters cover Agent/evaluator, phase, PASS/FAIL/partial/not-scored, permission,
retry, and evidence type. Tables expose headers, captions, scope, and
screen-reader summaries. Charts always have a text/table equivalent, sample
size, confidence, honest axes, and non-colour status.

## Exports

- JSON follows a versioned, validated safe schema.
- Markdown is escaped and treats stored text as inert.
- Printable HTML is allowed only when built from safe DOM/text APIs and a
  restrictive template; raw HTML injection is forbidden.
- Exports state `Academy deterministic evaluation`, versions, checksum,
  evidence limitations, and certification status.

No export includes hidden chain-of-thought, credentials, tokens, raw local
paths, private documents, raw Mission/prompts by default, analytics identifiers,
or connector secrets.

## Retention and analytics

Trace and evidence repositories apply independent item/byte/age limits and
quarantine corrupt entries. Retention must preserve active/certified references
or block with a clear recovery path; it must not silently orphan a result.
Analytics includes only allowlisted coarse events and excludes summaries,
evidence, IDs, hashes, content, paths, and private metadata.

