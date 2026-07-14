# Research Data

This directory holds the AOS research pipeline's working data. It is
explicit and file-based: nothing here is populated by autonomous crawling.
A human or an agent adds a source file one at a time; the scripts under
`scripts/research/` only validate, score, deduplicate, and transform data
that is already present on disk.

See [`.agent/research/research-policy.md`](../.agent/research/research-policy.md)
for the governing policy and [`.agent/schemas/`](../.agent/schemas/) for the
JSON Schemas each file type must satisfy.

| Directory | Contents | Schema |
| --- | --- | --- |
| `sources/` | One JSON file per research source (repo, paper, article, ...) | `research-source.schema.json` |
| `claims/` | Extracted claims, each linked back to a source ID | `research-claim.schema.json` |
| `candidates/` | Generated content candidates (lesson, prompt, agent, ...) awaiting review | `lesson-candidate.schema.json` etc. |
| `reviews/` | Human review decisions on candidates | `review-record.schema.json` |
| `published/` | Approved candidates that graduated to published content | matches the corresponding candidate schema plus a `publishedDate` |
| `reports/` | Generated research reports (output of `scripts/research/build-report.mjs`) | `research-report-template.md` structure |

## Pipeline scripts

```
node scripts/research/validate-source.mjs      # schema-shape check on every sources/*.json
node scripts/research/deduplicate-sources.mjs  # reports (does not auto-merge) likely-duplicate sources
node scripts/research/score-source.mjs         # computes deterministic authority/freshness/relevance/activity scores
node scripts/research/check-freshness.mjs      # classifies every source by freshness-policy.md rules
node scripts/research/generate-candidates.mjs  # turns verified claims into pendingReview candidates
node scripts/research/build-report.mjs         # writes a summary report to reports/
```

No script in this directory performs network requests, executes source
content, or installs anything. Candidates never move to `published/`
automatically — that requires a review record with `decision: "approved"`.
