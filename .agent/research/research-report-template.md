# Research Report Template

## Purpose

Required structure of a research report deliverable — the output of
`research-workflow.md` for a single research task.

## Required sections

1. **Title and scope** — what was researched and why (the task/question).
2. **Date** — report date, distinct from source dates.
3. **Sources consulted** — a table: source id, title, type
   (`source-types.md`), tier (`source-ranking.md`), publication date,
   retrieval date.
4. **Key findings** — the claims that answer the task's question, each
   tagged with its `verificationStatus` (`claim-verification.md`) and
   citing `sourceIds` (`citation-policy.md`).
5. **Conflicting information** — any disputed claims, both positions, and
   their source tiers/dates (do not silently resolve — see
   `source-ranking.md`).
6. **Freshness assessment** — freshness class of the key findings
   (`freshness-policy.md`), and whether any are time-sensitive.
7. **Confidence level** — an overall confidence statement for the report's
   conclusion, driven by the weakest load-bearing claim, not the
   strongest.
8. **Recommendations** — what this means for the current task, clearly
   separated from the factual findings above.
9. **Citations** — full reference list resolved from the sources table.
10. **Next steps** — e.g. suggested knowledge-ingestion candidates (see
    `knowledge-ingestion.md`) if this report should feed the content
    pipeline.

## Rules

- A report is not "done" if any key finding lacks a citation or a
  verification status.
- If any critical-content category is touched (see
  `knowledge-ingestion.md`), the report says so explicitly and flags it
  for human review rather than presenting it as ready-to-use guidance.

## Related modules

`research-workflow.md`, `citation-policy.md`, `claim-verification.md`,
`.agent/templates/research-report.md` (reusable document template
mirroring this structure).
