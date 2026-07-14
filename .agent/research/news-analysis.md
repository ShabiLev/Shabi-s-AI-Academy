# News Analysis

## Purpose

How to classify and handle news/announcement sources: distinguishing what
kind of news item it is and recording the fields needed to judge how much
weight it deserves.

## News categories

Every news source is classified as one of:

- announcement
- release
- rumor
- analysis
- benchmark
- security incident
- funding
- regulation
- product launch
- research result

A single article can combine categories (e.g. a "release" that is also a
"security incident"); record all that apply.

## Required fields

- `what changed`
- `why it matters`
- `who is affected`
- `source quality` (tier, per `source-ranking.md`)
- `primary source` (the original announcement/filing/repo, if the article
  is reporting on something else)
- `secondary confirmation` (an independent source corroborating the
  primary source, if available)
- `date`
- `freshness window` (per `freshness-policy.md` news rules: current
  0–14d, aging 15–45d, stale >45d unless still relevant)
- `uncertainty` (what is confirmed vs. speculative — critical for `rumor`
  and early `security incident` items)
- `actionability` (does this require any action/response, or is it
  informational only)

## Rules

- A `rumor` is never promoted to `verified` status on its own; it requires
  the primary source (official announcement, filing, or repository change)
  before any claim derived from it can be verified (see
  `claim-verification.md`).
- A `security incident` item routes to `.agent/security/security-policy.md`
  handling in addition to standard research handling, and is always
  treated as critical content for review purposes (see
  `knowledge-ingestion.md`).
- Marketing-flavored "announcements" (e.g. a vendor's own press release)
  are recorded as Tier 4 for technical claims even though the fact "a
  vendor announced X" is itself verifiable (see `source-ranking.md`
  rule 8).
- Prefer linking to the primary source over a secondary report whenever
  both are available; if only a secondary report exists, say so explicitly
  rather than implying the primary was checked.

## Related modules

`source-ranking.md`, `freshness-policy.md`, `release-note-analysis.md`
(for release-category news tied to a specific software version),
`.agent/security/security-policy.md`.
