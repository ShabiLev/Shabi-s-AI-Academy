# Controlled experiment runtime

## Execution mode

The only executable beta.1 mode is **Academy deterministic evaluation**. It
uses frozen local data and deterministic Academy algorithms. It is not a real
provider comparison, does not invoke tools, and does not establish real-world
model quality.

## Lifecycle

```text
draft
  -> validate setup
  -> ready
  -> freeze snapshots
  -> running competitor/repetition/evaluator steps
  -> cross-compare
  -> completed (certified or explicitly uncertified)
     | needs-evidence
     | paused
     | blocked
     | cancelled
```

Invalid transitions return a localized domain error and do not mutate stored
state. Start is idempotent for the same transition token. Restart creates a new
run ID and never overwrites the previous run.

## Setup invariants

- Exactly one immutable Mission snapshot and fixed Context Pack.
- 2–5 distinct compatible competitors.
- One immutable rubric version and at least one independent evaluator.
- Bounded integer repetitions and stop conditions.
- Non-empty bounded seed and explicit mutation policy.
- Equal execution level, time/size limits, and evidence policy for competitors.
- No evaluator owns or implemented the competitor/result it evaluates.

## Determinism

Canonical serialization excludes presentation order and mutable timestamps from
input identity. A stable hash covers the Mission, Context Pack, competitor,
prompt, team, rubric, evaluator, seed, repetition, limits, and runtime schema.
Deterministic IDs/timestamps come from injected clocks/ID factories in tests.
Identical canonical input must produce the same result checksum and trace event
sequence apart from explicitly excluded display timestamps.

## Processing order

1. Validate and persist frozen setup.
2. For each competitor in stable order, run each repetition with the same
   frozen constraints.
3. Persist output checksum and safe summary before evaluation.
4. For each evaluator in stable order, emit criterion findings with evidence.
5. Cross-compare only commensurable, sufficiently evidenced findings.
6. Run independent Reality Check.
7. Certify, mark needs evidence, or block with explicit reasons.

The runtime never fills missing output, evidence, or score to complete a chart.

## Pause, reload, and continue

Pause persists the exact competitor, repetition, evaluator, criterion,
transition counter, snapshot references, and fingerprint. Reload reconstructs
the same state from the repository. Continue:

1. revalidates every referenced checksum/version;
2. compares the stored fingerprint;
3. resumes the next uncommitted atomic step only when equal;
4. otherwise blocks and offers a new fork/run.

Completed step tokens make replay idempotent. A changed competitor, rubric,
evaluator, Mission, Context Pack, runtime schema, or policy never enters the
existing run.

## Stop, cancel, retry, and failure

- Stop conditions are evaluated at deterministic boundaries and recorded.
- Cancel preserves existing evidence and marks unfinished criteria
  `not-scored`; it does not calculate a partial winner.
- Retry creates a trace event and bounded attempt; it cannot erase the failure.
- Exceeding retry, storage, time, or size bounds blocks explicitly.
- Corrupt or missing snapshots quarantine the record and prevent continuation.

## Certification output

A certification record includes exact compared versions/hashes, rubric,
criterion findings, evaluator versions, evidence coverage, confidence,
disagreements, missing evidence, Reality Checker decision, result checksums, and
timestamps. It is immutable and visibly distinguishes Academy simulation from
provider evidence.
