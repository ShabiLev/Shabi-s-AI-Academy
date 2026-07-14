# Duplicate Detection

## Purpose

How sources and claims are deduplicated before scoring, so the same source
or fact isn't counted twice (falsely inflating corroboration) or reviewed
twice.

## Source deduplication

- Match on canonical URL (strip tracking parameters, resolve redirects
  where feasible), or on a stronger identifier when available (DOI,
  repository owner/name + commit/tag, CVE ID).
- Use the `checksum` field on `research-source.schema.json` (e.g. a hash of
  normalized fetched content) to catch identical content re-supplied under
  a different URL.
- A source republished on a different domain (e.g. a mirrored article) is
  a duplicate of the original for corroboration purposes — it does not
  count as independent evidence (see `claim-verification.md`).

## Claim deduplication

- Two claims with materially the same statement, once normalized, are the
  same claim even if extracted from different sources — link the
  additional source as corroboration on the existing claim record rather
  than creating a new one.
- Near-duplicate claims that differ in a material qualifier (e.g. version
  number, scope) are kept as separate claims and cross-referenced.

## When in doubt

If it is unclear whether two records are duplicates, keep both and flag the
ambiguity in `notes` rather than merging or discarding either — merging
destroys attribution history, which violates `research-policy.md`.

## Related modules

`research-source.schema.json`, `research-claim.schema.json`,
`claim-verification.md`, `source-ranking.md`.
