# Knowledge Ingestion Pipeline

## Purpose

The 26-step pipeline from verified research to published content, and the
review statuses that track an item through it. This is the operational
core of the `knowledge ingestion` task type (see `.agent/registry.json`).

## Non-negotiable rule

**No content becomes `published` automatically.** Every step from 17
onward produces a *candidate*, never a finished, live piece of content. A
candidate reaches `published` only after a human review decision recorded
in `review-record.schema.json` (see `review-workflow.md`).

## Critical content — always human-reviewed

Regardless of confidence or source quality, the following categories
always require human review before publish, and can never be
auto-approved by tooling or agent judgment alone:

- Security guidance
- Legal/regulatory content
- Authentication architecture
- Data privacy content
- Production deployment guidance
- Destructive tools/actions
- Write-capable MCP tools

## The 26 steps

1. **Discover sources** — intake explicitly supplied sources only (see
   `research-policy.md`; no autonomous crawling).
2. **Deduplicate** — apply `duplicate-detection.md` before a source/claim
   enters the pipeline.
3. **Rank source quality** — apply `source-ranking.md`.
4. **Extract claims** — pull discrete statements into
   `research-claim.schema.json` records; status `extracted`.
5. **Verify claims** — apply `claim-verification.md`; status `verified`
   once sufficient.
6. **Record publication date** — on the source record.
7. **Record retrieval date** — on the source record.
8. **Assess freshness** — apply `freshness-policy.md`.
9. **Assess technical relevance** — does this apply to this project's
   stack/context; record why.
10. **Generate summary** — a concise English summary of the verified
    finding.
11. **Generate bilingual summary** — Hebrew (`summaryHe`) companion per
    `.agent/knowledge/i18n.md`; status `translated` once both exist.
12. **Link related concepts** — cross-reference existing glossary/knowledge
    concepts.
13. **Link related lessons** — cross-reference existing lesson content.
14. **Link related prompts** — cross-reference existing Prompt Pack/Prompt
    Library content.
15. **Link related agents** — cross-reference existing Starter Agent
    definitions.
16. **Link related workflows** — cross-reference existing workflow
    templates.
17. **Generate glossary candidates** — see `content-generation.md`.
18. **Generate lesson candidates** — new lessons or lesson updates; see
    `lesson-candidate.schema.json`.
19. **Generate Prompt Pack candidates** — packs and individual prompts; see
    `prompt-candidate.schema.json`.
20. **Generate Starter Agent candidates** — see `agent-candidate.schema.json`.
21. **Generate AI Radar candidates** — see `radar-entry.schema.json`.
22. **Generate documentation candidates** — How To pages, documentation
    pages, FAQ entries, release-impact notes, security/deprecation
    warnings; see `content-generation.md`.
23. **Route to human review** — every candidate enters `pendingReview`
    (see `review-workflow.md`); critical content is flagged as such.
24. **Publish approved content** — only candidates with an `approved`
    review record move to `published`.
25. **Track expiration** — published content carries a freshness status;
    monitor for drift into `stale`/`deprecated`.
26. **Re-review stale content** — content that becomes `stale`,
    `deprecated`, or is superseded is routed back through review, never
    silently left live and unflagged.

## Review statuses

`discovered` → `extracted` → `verified` → `translated` → `pendingReview` →
`approved` → `published`, with `warning`, `stale`, and `deprecated` as
post-publish states, and `rejected` as a terminal non-publish outcome from
`pendingReview`.

- `discovered` — source intake recorded (steps 1–2).
- `extracted` — claims pulled from a verified-quality source (step 4).
- `verified` — claim passed `claim-verification.md` (step 5).
- `translated` — bilingual summary complete (step 11).
- `pendingReview` — candidate generated, awaiting a human decision
  (step 23).
- `approved` — a human reviewer approved the candidate
  (`review-record.schema.json`).
- `published` — approved content is live (step 24).
- `warning` — published content has a flagged issue but is not yet
  stale/deprecated.
- `stale` — freshness has degraded past the threshold in
  `freshness-policy.md`.
- `deprecated` — the underlying subject is deprecated; content is
  historical.
- `rejected` — a human reviewer declined the candidate; it does not
  publish.

## Related modules

`research-policy.md`, `source-ranking.md`, `claim-verification.md`,
`duplicate-detection.md`, `freshness-policy.md`, `content-generation.md`,
`review-workflow.md`, `citation-policy.md`, all `schemas/*.schema.json`
files.
