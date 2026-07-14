# Source Ranking

## Purpose

Deterministic four-tier source quality model used to score every research
source before its claims can be used or cited.

## Tier 1 — Highest authority

- Official specifications and vendor/official documentation
- Peer-reviewed papers
- Official project repositories (the canonical repo of the technology or
  library in question)
- Standards bodies (e.g. W3C, IETF, ISO, ECMA)
- Official security advisories (CVE records, vendor security bulletins)

## Tier 2 — Recognized and reputable

- Recognized engineering organizations' technical blogs (e.g. a major
  vendor's engineering team, not its marketing team)
- Reputable research labs (non-peer-reviewed technical reports, preprints
  from established labs)
- Established technical publications with editorial standards
- Maintainer-authored articles (written by a named maintainer of the
  project being discussed, outside the official docs)

## Tier 3 — Independent and community

- Independent recognized experts writing outside an official channel
- Conference talks (recorded, attributable to a named speaker/organization)
- High-quality community documentation (e.g. curated wikis with visible
  maintenance)
- GitHub Discussions / well-substantiated GitHub Issues threads

## Tier 4 — Unverified

- General forum posts (Reddit, Stack Overflow answers without
  accepted/verified status, Discord/Slack logs)
- Social media posts
- Unverified tutorials / blog posts with no named, checkable author or
  organization
- Anonymous or unattributable content

## Rules

1. **Tier 4 alone cannot support a critical technical claim.** A claim that
   affects a security recommendation, an architecture decision, or a
   "this is safe/production-ready" judgment must have at least one Tier 1–3
   corroborating source before it can be marked verified (see
   `claim-verification.md`).
2. **Major claims need multiple sources when practical.** A claim that will
   drive generated content (`content-generation.md`) should be corroborated
   by more than one independent source unless only a single authoritative
   source exists (e.g. it's the only official spec).
3. **Conflicting sources must be documented, not silently resolved.** If two
   sources at the same or different tiers disagree, record both positions,
   their tiers, and their dates; do not pick a "winner" without saying why.
4. **Source dates are always recorded.** Publication date and retrieval
   date are required fields on every source record
   (`research-source.schema.json`); a ranking without dates is incomplete.
5. **Repository activity is checked** before a repo is used as evidence of
   "current best practice." See `repository-analysis.md` for the specific
   fields (last commit, release frequency, issue activity).
6. **Archived repositories are labelled** `archived: true` and downgraded in
   relevance regardless of tier — an archived Tier 1 official repo is still
   Tier 1 for authority but must be flagged as no longer maintained.
7. **Deprecated technology is labelled.** If the subject of a source is
   deprecated/superseded, the source's claims are historical, not current
   guidance, regardless of tier (see `freshness-policy.md`).
8. **Marketing claims are not verified technical evidence.** Vendor
   marketing copy, press releases, and promotional benchmarks are capped at
   Tier 4 for technical claims (a vendor's own performance/security claims
   are not self-verifying) even if the same vendor's official docs are
   Tier 1 for factual/API claims.

## Scoring

Each source additionally carries numeric `authorityScore`,
`freshnessScore`, `relevanceScore`, and `activityScore` (0–100) on
`research-source.schema.json`, derived from the tier and the rules above,
not a replacement for the tier.

## Related modules

`source-types.md` (which source type maps to which typical tier),
`freshness-policy.md`, `claim-verification.md`, `research-source.schema.json`.
