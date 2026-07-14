# Research Workflow

## Purpose

Step-by-step process for running a single research task end to end, from
an explicitly supplied source to a reviewable report. This file sequences
the other `research/` modules; it does not restate their rules.

## Preconditions

- The task is classified `research` (see `.agent/loaders/task-classifier.md`).
- One or more sources have been explicitly supplied by the user or the
  current instruction (see `research-policy.md` — no autonomous discovery).

## Steps

1. **Intake** — record what was supplied: URL/reference, and why it's
   being researched.
2. **Type the source** — classify it using `source-types.md`.
3. **Rank it** — assign a quality tier and scores per `source-ranking.md`.
4. **Type-specific analysis** — if the source is a repository, paper, news
   item, or release note, apply the matching required-fields checklist:
   `repository-analysis.md`, `paper-analysis.md`, `news-analysis.md`,
   `release-note-analysis.md`.
5. **Check for duplicates** — before adding a new source or claim record,
   run `duplicate-detection.md`.
6. **Extract claims** — pull out discrete, checkable statements; record
   them against `research-claim.schema.json`.
7. **Verify claims** — apply `claim-verification.md`; do not mark a claim
   verified on a single Tier 4 source.
8. **Assess freshness** — apply `freshness-policy.md` to the source and to
   any date-sensitive claim.
9. **Cite** — every claim and every report section must carry attribution
   per `citation-policy.md`.
10. **Produce the report** — use `research-report-template.md`.
11. **Hand off (optional)** — if the task also requires generating
    candidate content, continue into `knowledge-ingestion.md` (a distinct
    task type: `knowledge ingestion`).

## Stop conditions

Stop and ask rather than guessing when: a source cannot be typed or ranked,
a claim cannot be verified and is load-bearing for the report's conclusion,
or two sources conflict on a material point (document the conflict per
`source-ranking.md` instead of picking a side silently).

## Related modules

`research-policy.md` (governing rules), `.agent/agents/research-agent.md`
(operational role), `.agent/prompts/research.md` (task prompt).
