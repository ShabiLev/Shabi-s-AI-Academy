# Knowledge Ingestion

## Purpose

Define how to run the candidate-generation pipeline that turns verified
research into review-queue candidates for the Knowledge Base, Prompt
Library, Starter Agents, or AI Radar — never directly into published
content.

## When to load

Load for the `knowledge ingestion` task type, always after
[`research.md`](research.md) has produced verified, cited findings.

## Prerequisites

- A completed research report exists per
  [`research.md`](research.md), with claims verified and cited.
- [`../research/knowledge-ingestion.md`](../research/knowledge-ingestion.md)
  (the 26-step pipeline) has been read in full — this module sequences it,
  it does not restate every step.

## Required actions

1. Confirm the research input is verified and cited per
   [`../research/claim-verification.md`](../research/claim-verification.md)
   and [`../research/citation-policy.md`](../research/citation-policy.md)
   before starting ingestion — ingestion does not re-verify claims, it
   consumes already-verified ones.
2. Run the pipeline described in
   [`../research/knowledge-ingestion.md`](../research/knowledge-ingestion.md)
   from source discovery through candidate generation, in its documented
   step order.
3. Determine which content type(s) the pipeline should produce using
   [`../research/content-generation.md`](../research/content-generation.md)
   (Knowledge Base entry, lesson, prompt, agent, workflow, or radar entry)
   and validate each candidate against its schema in
   [`../schemas/`](../schemas/) (`knowledge-entry.schema.json`,
   `lesson-candidate.schema.json`, `prompt-candidate.schema.json`,
   `agent-candidate.schema.json`, `workflow-candidate.schema.json`,
   `radar-entry.schema.json`).
4. Route every generated candidate into the human review workflow per
   [`../research/review-workflow.md`](../research/review-workflow.md) — a
   candidate is never self-published by the pipeline or the agent.
5. Produce the handoff to human review using
   [`../handoff/research-to-content.md`](../handoff/research-to-content.md)
   and the operational role in
   [`../agents/knowledge-curator.md`](../agents/knowledge-curator.md).
6. Record a `review-record` per candidate using
   [`../schemas/review-record.schema.json`](../schemas/review-record.schema.json)
   once a human reviewer has made a decision — the agent does not fill in
   an approval decision on a human's behalf.

## Prohibited actions

- Publishing a generated candidate directly to the Knowledge Base, Prompt
  Library, or Starter Agents catalog without passing through
  [`../research/review-workflow.md`](../research/review-workflow.md).
- Generating a candidate from an unverified or uncited claim.
- Marking a `review-record` as approved without an actual human decision.
- Skipping schema validation for a generated candidate before handoff.

## Deliverables

- One or more schema-valid candidates (Knowledge Base entry, lesson,
  prompt, agent, workflow, or radar entry) in the review queue.
- A completed handoff document per
  [`../handoff/research-to-content.md`](../handoff/research-to-content.md).

## Evidence requirements

Candidate generation itself produces content artifacts, not test evidence;
if the pipeline's own code changed, that change follows the normal
[`testing.md`](testing.md) and [`../quality/evidence.md`](../quality/evidence.md)
requirements like any other code change.

## Exit criteria

Every generated candidate validates against its schema, is attributed back
to verified research, and sits in the human review queue in `pending`
status — none are marked published by the agent itself.
