# ADR-014: Scheduled bounded Radar ingestion and artifact publication

- Status: Accepted
- Date: 2026-07-26
- Supersedes: ADR-013 for the Version 1.7 scheduled publication path

## Context

ADR-013 deliberately limited Radar publication to reviewed pull requests. The
Version 1.7 public beta requires fresh output without changing React source,
while preserving the same-origin, no-browser-secret, reviewed-fallback
boundary.

## Decision

Trusted GitHub Actions infrastructure may retrieve a fixed owner-reviewed
registry of RSS and Atom endpoints. It must fetch sources sequentially with
timeouts, bounded retry/backoff and response-size limits; validate the final
redirect host; reject XML entities; parse each source in isolation; normalize
inert text, URLs and dates; quarantine invalid items; deduplicate and cluster;
and publish only records allowed by the source's explicit publication policy.

The workflow builds and deploys the generated feed inside the GitHub Pages
artifact. It does not commit changing news data. A total or partial source
failure preserves the previous reviewed/generated cache and is represented
truthfully in feed metadata and source-health artifacts.

The registry is not a crawler seed. Outbound discovery, arbitrary user feeds,
HTML scraping and following links to discover sources remain prohibited.

## Consequences

- A scheduled cycle can produce new same-origin feed output without a React
  code change or a client credential.
- Current news remains an immutable workflow/deployment artifact rather than
  fabricated committed evidence.
- Redirects, rate limits and source format drift can degrade one source
  without deleting usable cache.
- Adding or enabling a source remains a reviewed code change.

## Verification

`npm run test:radar-ingestion`, `npm run radar:ingest`,
`npm run radar:validate`, exact-SHA CI and deployed feed inspection.

## Related documents

[ADR-013](ADR-013-radar-pages-artifact-publication.md),
[Version 1.7 data flow](../../docs/version-1.7/data-flow.md),
[Radar threat model](../../docs/version-1.7/threat-model.md).
