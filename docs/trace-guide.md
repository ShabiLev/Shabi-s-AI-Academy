# Evaluation trace guide

## What the trace contains

The trace records observable events: timestamp, sequence, phase, actor, safe
input/output summary, permission, gate, evidence references, retry, status, and
next action. It is append-only and tied to exact run/entity versions.

The trace does **not** expose hidden chain-of-thought. It also excludes
credentials, tokens, raw local paths, private documents, and raw Mission content
from analytics.

## Investigation workflow

1. Confirm the run and competitor versions.
2. Filter by phase or Agent/evaluator.
3. Inspect failures, partial and `not-scored` findings before PASS.
4. Follow evidence IDs to immutable evidence and verify confidence.
5. Inspect permission/gate events for self-approval or bypass.
6. Inspect retries and the next action around the first divergence.
7. Compare the stored input/result checksums when version drift is suspected.

A trace event is evidence that a state transition occurred; it is not proof that
the evaluated claim is correct. The linked evidence and evaluator finding
provide that proof.

## Accessible reading

Use the semantic event/result tables and text alternatives rather than relying
only on charts. Status is communicated by text/icon as well as colour. Filters,
disclosures, pagination, and exports must be keyboard operable with visible
focus and correct RTL/LTR direction.

## Export

JSON and Markdown exports are versioned, validated, escaped, and checksummed.
Printable HTML is supported only through a safe fixed template. Every export
states Academy deterministic evaluation, certification status, versions,
evidence limitations, and omissions. Treat exported content as potentially
private local data.

