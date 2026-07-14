# Knowledge ingestion pipeline

The 26-step pipeline in
[`../../.agent/research/knowledge-ingestion.md`](../../.agent/research/knowledge-ingestion.md)
that takes verified research and turns it into published content —
Knowledge Base entries, lessons, Prompt Pack candidates, Starter Agent
candidates, AI Radar entries, and documentation candidates — with a human
review gate before anything goes live.

## Non-negotiable rule

**No content becomes `published` automatically.** From step 17 onward, every
step produces a candidate, never a finished, live piece of content. A
candidate reaches `published` only after a human review decision recorded
via `review-record.schema.json` — see
[`../../.agent/research/review-workflow.md`](../../.agent/research/review-workflow.md).

## Always human-reviewed, regardless of confidence

Security guidance, legal/regulatory content, authentication architecture,
data privacy content, production deployment guidance, destructive
tools/actions, and write-capable MCP tools can never be auto-approved by
tooling or agent judgment alone.

## The pipeline, in stages

1. **Intake (steps 1–3)** — discover explicitly supplied sources, deduplicate
   (`duplicate-detection.md`), rank source quality (`source-ranking.md`).
2. **Extraction and verification (steps 4–9)** — extract claims, verify them
   (`claim-verification.md`), record publication/retrieval dates, assess
   freshness (`freshness-policy.md`) and technical relevance.
3. **Summarization and linking (steps 10–16)** — generate an English summary,
   a bilingual Hebrew companion (`summaryHe`, per
   [`../../.agent/knowledge/i18n.md`](../../.agent/knowledge/i18n.md)), and
   cross-link related concepts, lessons, prompts, agents, and workflows.
4. **Candidate generation (steps 17–22)** — glossary, lesson, Prompt Pack,
   Starter Agent, AI Radar, and documentation candidates, per
   [`../../.agent/research/content-generation.md`](../../.agent/research/content-generation.md)
   and the matching `.agent/schemas/*-candidate.schema.json` files.
5. **Review and publish (steps 23–26)** — route to human review
   (`pendingReview`), publish only `approved` candidates, track expiration,
   and re-review content that drifts into `stale`/`deprecated`.

## Review status lifecycle

`discovered` → `extracted` → `verified` → `translated` → `pendingReview` →
`approved` → `published`, with `warning`, `stale`, `deprecated` as
post-publish states and `rejected` as a terminal non-publish outcome.

## Who does this work

The `agents.research-agent` role discovers, ranks, and verifies sources;
the `agents.knowledge-curator` role routes verified research into content
candidates and human review — see
[`../../.agent/agents/research-agent.md`](../../.agent/agents/research-agent.md)
and
[`../../.agent/agents/knowledge-curator.md`](../../.agent/agents/knowledge-curator.md).
The handoff contract between them is
[`../../.agent/handoff/research-to-content.md`](../../.agent/handoff/research-to-content.md) —
see [`handoffs.md`](handoffs.md).

## Related

[`research-system.md`](research-system.md) for the upstream intake rules,
[`../../.agent/research/content-generation.md`](../../.agent/research/content-generation.md)
for candidate metadata requirements, and `/aos/research` for the in-app
view of ingested items and their review state.
