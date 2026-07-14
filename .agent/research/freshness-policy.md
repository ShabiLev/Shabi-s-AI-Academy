# Freshness Policy

## Purpose

Freshness classes and the specific per-source-type staleness rules used to
judge whether a source or claim is still current.

## Freshness classes

- **current** — reflects the present state of the subject; safe to cite
  as-is.
- **aging** — still broadly accurate but old enough to double-check before
  relying on it for a critical decision.
- **stale** — old enough that it should not be used as sole evidence
  without re-verification.
- **deprecated** — the subject itself (a technology, API, or practice) has
  been officially deprecated; the source is historically accurate but not
  current guidance.
- **superseded** — better/more recent evidence exists that changes or
  replaces the finding, independent of the source's own age.
- **historical** — retained for context/provenance only; explicitly not to
  be used as current guidance.

## Per-source-type rules

### News

- **current**: 0–14 days old.
- **aging**: 15–45 days old.
- **stale**: more than 45 days old, unless the story is still demonstrably
  relevant (e.g. it describes an ongoing/unresolved situation) — if so,
  keep as `aging`/`current` and note why in the source record.

### Framework / library documentation

- **current**: documents the latest supported major version of the
  framework/library.
- Anything documenting a version older than the latest supported major is
  `aging` or `stale` depending on how far behind it is and whether that
  version is still supported upstream.
- **deprecated**: documents a version or API explicitly marked deprecated
  upstream.

### Repositories

- Freshness is judged by releases, commit activity, and issue activity (see
  `repository-analysis.md` for exact fields): a repo with recent releases
  and recent commits is `current`; long gaps push it to `aging`/`stale`; an
  archived repo is `deprecated` regardless of how good its last release
  was.

### Papers

- **Do not mark a paper stale solely because of its age.** A paper's
  findings remain valid evidence of what was measured/shown when it was
  published.
- Mark a paper **superseded** when a later, better-evidenced paper or
  result contradicts or improves on it — record the superseding source's
  ID.
- Track peer-review status and date separately (see `paper-analysis.md`);
  an old, well-corroborated peer-reviewed result is not "stale."

### Standards

- Track the standard's version number and its effective/publication date
  explicitly.
- A standard is `current` while it is the latest ratified version; a
  superseded version becomes `historical` once officially replaced, but
  remains valid for describing systems still built against it.

## Fields

Every source and claim carries `freshnessScore` (0–100,
`research-source.schema.json`) and a `freshnessStatus` enum on generated
content (`knowledge-entry.schema.json` and the candidate schemas) matching
the six classes above.

## Re-review

Content marked `stale`, `deprecated`, or `superseded` is routed back
through `review-workflow.md` for re-review, never silently left published
un-flagged.

## Related modules

`source-ranking.md`, `repository-analysis.md`, `paper-analysis.md`,
`news-analysis.md`, `knowledge-ingestion.md` (step: assess freshness),
`review-workflow.md`.
