# Source Types

## Purpose

Catalog of supported source types and where each is typically handled.
This file maps a source to its typical tier (`source-ranking.md`) and to
any type-specific analysis checklist; it does not restate ranking or
freshness rules.

## Catalog

| Source type | Typical tier | Type-specific analysis |
|---|---|---|
| Official specification / vendor doc | 1 | — |
| Peer-reviewed paper | 1 | `paper-analysis.md` |
| Official project repository | 1 | `repository-analysis.md` |
| Standards body publication | 1 | — |
| Security advisory (CVE, vendor bulletin) | 1 | — |
| Recognized engineering org blog | 2 | — |
| Research lab report / preprint | 2 | `paper-analysis.md` |
| Established technical publication | 2 | `news-analysis.md` (if reporting news) |
| Maintainer-authored article | 2 | — |
| Independent expert writing | 3 | — |
| Conference talk | 3 | — |
| Community documentation (curated wiki) | 3 | — |
| GitHub Discussion / substantiated Issue | 3 | `repository-analysis.md` context |
| Forum post (Reddit, unaccepted SO answer) | 4 | — |
| Social media post | 4 | — |
| Unverified tutorial | 4 | — |
| Anonymous content | 4 | — |
| News article / announcement | 2–4 (source-dependent) | `news-analysis.md` |
| Release note / changelog | 1 (if official) | `release-note-analysis.md` |
| Benchmark publication | tier of publisher | `paper-analysis.md` or `news-analysis.md` |
| Marketing material | capped at 4 for technical claims | see `source-ranking.md` rule 8 |

## Handling notes

- A single source can require more than one checklist (e.g. a paper
  announced via a news article: `news-analysis.md` for the announcement,
  `paper-analysis.md` for the paper itself).
- Type is recorded on `research-source.schema.json` as `sourceType` and
  drives which downstream checklist an agent applies.
- When a source's type is ambiguous, record the closest match and note the
  ambiguity rather than guessing a tier.

## Related modules

`source-ranking.md`, `repository-analysis.md`, `paper-analysis.md`,
`news-analysis.md`, `release-note-analysis.md`.
