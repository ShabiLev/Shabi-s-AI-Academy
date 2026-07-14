# Citation Policy

## Purpose

Required attribution fields for any generated content sourced from
research. This is the enforcement point for `research-policy.md`
principle 4 (attributable).

## Rule

No generated content item — Knowledge Base entry, lesson, prompt, agent,
workflow, radar entry, or any other type in `content-generation.md` — may
be created, reviewed, or published without a traceable citation trail.

## Required fields on every generated item

- `sourceIds` — one or more IDs referencing `research-source.schema.json`
  records (never a bare URL with no source record).
- Source URL(s)/reference(s), carried on the source record itself.
- `retrievalDate` — when the source was fetched/read.
- `publicationDate` — when the source itself was published (may be
  unknown/blank if genuinely unavailable, but the field must exist and be
  explicitly empty, not omitted).
- `confidence` — carried at the claim or item level, reflecting
  verification status.
- `reviewStatus` — see `review-workflow.md`.

## Format

Citations reference the source's `id`, not free-text descriptions;
free text (title, publisher, URL) is looked up from the source record so it
stays consistent if the record is corrected.

## Multiple sources

When an item draws on more than one source, all contributing `sourceIds`
are listed; do not collapse multiple sources into one citation or pick only
the highest-tier one for display while quietly relying on others.

## Related modules

`research-policy.md`, `research-claim.schema.json`, `content-generation.md`,
`knowledge-entry.schema.json`.
