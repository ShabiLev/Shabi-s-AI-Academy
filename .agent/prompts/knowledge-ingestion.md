# Knowledge Ingestion Prompt

## Purpose

Frame the task of turning verified research into reviewable content
candidates, on top of the shared AOS knowledge-ingestion workflow.

## Task-specific checklist

- Only ingest claims already marked verified per
  `.agent/research/claim-verification.md`; do not promote an unverified
  claim to a candidate.
- Produce candidates in the content types defined by
  `.agent/research/content-generation.md`, each with the required
  metadata.
- Route every candidate into the human review queue per
  `.agent/research/review-workflow.md`; never mark a candidate published
  without that human step.
- Validate each candidate against its schema under `.agent/schemas/`
  (lesson, prompt, agent, workflow, or radar entry) before submission.
- Preserve citation fields from the source research per
  `.agent/research/citation-policy.md`.
- Flag duplicate or near-duplicate candidates before they enter the review
  queue.

## Shared workflow to load

Load `.agent/workflow/knowledge-ingestion.md` for the full process; this
file adds nothing to that process except task-specific framing.
