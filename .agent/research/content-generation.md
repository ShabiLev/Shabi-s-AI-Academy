# Content Generation

## Purpose

Every content type the knowledge-ingestion pipeline can produce as a
candidate, and the metadata every generated item must carry regardless of
type.

## Content types

- Knowledge Base entries
- Lessons
- Lesson updates
- Glossary entries
- Prompt Packs
- Individual Prompts
- Starter Agents
- Workflow templates
- AI Radar entries
- How To pages
- Documentation pages
- FAQ entries
- Release-impact notes
- Security warnings
- Deprecated-content warnings

Every one of these is generated as a *candidate* first (see
`knowledge-ingestion.md` steps 17–22) and only becomes live content after
`review-workflow.md` approval — none of them is an exception to that rule,
including low-stakes-looking types like FAQ entries or glossary entries.

## Required metadata (every generated item)

- `sourceIds` — traceable to `research-source.schema.json` records (see
  `citation-policy.md`).
- Source URLs/references — carried on the referenced source records.
- `retrievalDate`
- `publicationDate`
- `confidence`
- `reviewStatus` — one of the statuses in `knowledge-ingestion.md`.
- `freshnessStatus` — one of the classes in `freshness-policy.md`.
- Language status (`translationStatus`) — whether a bilingual
  (Hebrew/English) counterpart exists, per `.agent/knowledge/i18n.md`.
- Generated-by metadata (`generatedBy`) — which agent/process produced the
  candidate, and when.
- Human-review metadata (`humanReviewedBy` / linked
  `review-record.schema.json`) — populated once reviewed, null/absent
  while `pendingReview`.
- `version` — so updates to a published item are tracked, not silently
  overwritten.

## Type-specific schemas

`lesson-candidate.schema.json`, `prompt-candidate.schema.json`,
`agent-candidate.schema.json`, `workflow-candidate.schema.json`, and
`radar-entry.schema.json` each carry the common fields above plus a small
number of type-specific fields (see each schema). Knowledge Base entries
use `knowledge-entry.schema.json`. How To pages, documentation pages, FAQ
entries, release-impact notes, and warnings currently share the
`knowledge-entry.schema.json` shape (tagged by `tags`/category) until/unless
a dedicated schema is warranted.

## Rules

- A generated item never claims a `publishedDate` before it has an
  `approved` review record.
- Security warnings and deprecated-content warnings are always critical
  content (see `knowledge-ingestion.md` — always human-reviewed)
  regardless of how mechanical their generation seems.
- Release-impact notes cite the release note analysis that produced them
  (see `release-note-analysis.md`).

## Related modules

`knowledge-ingestion.md`, `review-workflow.md`, `citation-policy.md`, all
candidate schemas under `.agent/schemas/`.
