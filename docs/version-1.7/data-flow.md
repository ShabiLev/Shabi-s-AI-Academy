# Version 1.7 data flow

This document separates the confirmed Version 1.6 flow from the proposed
Version 1.7 flow. Dashed or target diagrams are architecture requirements, not
implemented behavior.

## Current Radar flow

```mermaid
flowchart TD
  TS[Bundled reviewedFeed.ts] --> Context[RadarDataProvider]
  History[localStorage Radar history] --> Context
  Favorites[localStorage favorites] --> Context
  Context --> Page[RadarPage]
  User[User selects Check for update] --> Provider[SameOriginRadarProvider]
  Provider --> Static[generated/ai-radar-feed.json in deployed app artifact]
  Static --> Validator[Runtime schema and URL allowlist]
  Validator -->|valid| Context
  Validator -->|invalid/offline| State[Truthful error code; current records preserved]
  Workflow[Six-hour GitHub Actions workflow] --> CheckedOut[Checked-out static feed]
  CheckedOut --> SourceHead[Source reachability HEAD requests]
  Workflow --> Artifact[Validation report artifact]
```

Important properties:

- The scheduled workflow does not change the feed.
- The browser refreshes only after user action.
- The online JSON and bundled TypeScript fallback are separate hand-maintained
  copies.
- Local history and favorites are not part of the full workspace export.
- The workflow and runtime use different source allowlists.

## Current guest and personalization flow

```mermaid
flowchart TD
  Landing[Landing page] -->|Start as Guest| Session[sessionStorage guest flag]
  Session --> Protected[ProtectedRoute allows Academy shell]
  Protected --> Onboarding[Onboarding profile by guest-user]
  Protected --> Profile[Separate local profile]
  Protected --> Experience[Separate experience preferences]
  Protected --> Workspace[Activity, notifications, analytics]
  Workspace --> Recent[Recent Items]
  Workspace --> Analytics[Local analytics page]
```

There is no unified anonymous guest identity. `guest-user` is a constant
authentication-shaped UI user, while profile, onboarding, experience, Radar,
workspace, and backup use independent storage models.

## Target ingestion and publication flow

```mermaid
flowchart TD
  Schedule[Trusted scheduled trigger] --> Run[Ingestion run with immutable run ID]
  Registry[Owner-reviewed source adapter registry] --> Run
  Run --> Fetch[Bounded concurrent retrieval]
  Fetch --> Limits[Timeout, retry/backoff, rate and payload limits]
  Limits --> Parser[Isolated adapter parser]
  Parser --> Normalize[Canonical URL, dates, language, title and inert text normalization]
  Normalize --> Validate[Strict schema and source-policy validation]
  Validate -->|unsafe or uncertain| Quarantine[Quarantine with reason]
  Validate -->|eligible| Dedupe[Checksum, canonical URL, title and entity clustering]
  Dedupe --> Score[Source, confidence, relevance and freshness scoring]
  Score --> Policy[Publication policy]
  Policy -->|pending/held/rejected| Review[Protected review artifact/tool]
  Policy -->|reviewed or trusted auto-publish| Snapshot[Immutable versioned feed snapshot]
  Snapshot --> Publish[Deployment-neutral feed publisher]
  Publish --> SameOrigin[Same-origin bounded feed for each deployment]
  Prior[Last successful reviewed snapshot] --> Publish
  Failure[Partial or total run failure] --> Health[Run/source health metadata]
  Failure --> Prior
```

The registry is trusted configuration, not client data. Disabling an adapter
changes trusted pipeline configuration and publication state without requiring
a client bundle change. It must not permit arbitrary runtime URLs or
user-submitted adapters.

## Target browser flow

```mermaid
flowchart TD
  Boot[Public Academy boot] --> Guest[Load or create versioned local guest profile]
  Boot --> Fallback[Load reviewed static fallback]
  Boot --> Fetch[Fetch same-origin published feed]
  Fetch --> Validate[Validate feed envelope and records as unknown]
  Validate -->|valid| Cache[Persist bounded last-success snapshot and health]
  Validate -->|partial| Merge[Merge eligible records; preserve fallback and prior cache]
  Validate -->|failed/offline| Preserve[Preserve prior cache and fallback]
  Fallback --> Repository[Radar repository]
  Cache --> Repository
  Merge --> Repository
  Preserve --> Repository
  Guest --> Rank[Local ranking service]
  Repository --> Rank
  Repository --> Latest[Non-personalized Latest]
  Rank --> Following[Following/recommended views with explanations]
  Repository --> Briefing[Daily briefing selector]
  Guest --> Briefing
  Repository --> Changed[What-changed comparator]
  Guest --> Changed
  Repository --> UI[Radar, briefing and notifications]
  Latest --> UI
  Following --> UI
  Briefing --> UI
  Changed --> UI
```

Feed refresh failure cannot write an empty snapshot over the last success.
Records are considered new only when publication/update/correction metadata is
newer than the profile’s last successful visit checkpoint and the feed snapshot
it came from is not stale.

## Target guest-profile flow

```mermaid
flowchart TD
  Adapter[GuestProfileRepository interface] --> Local[Versioned local adapter]
  Local --> Validate[Schema validation and migration]
  Validate -->|valid| Profile[Bounded GuestProfile]
  Validate -->|legacy| Migrate[Deterministic migration]
  Validate -->|corrupt| Recover[Safe defaults plus recoverable backup/report]
  Profile --> Onboarding[Optional interests]
  Profile --> State[Follows, favorites, read/dismissed, searches, recent views]
  Profile --> Consent[Consent and briefing preferences]
  Profile --> Export[Guest profile export]
  Import[User-selected JSON] --> Size[Size and JSON limits]
  Size --> Safety[Schema, keys, arrays, strings and prototype safety]
  Safety --> Preview[Diff preview]
  Preview -->|explicit merge/replace| Transaction[Snapshot, apply, verify]
  Transaction -->|failure| Rollback[Restore prior profile]
  Transaction -->|success| Local
```

## Ownership and trust boundaries

| Data | Owner | Storage/publisher | Browser may change? | May be transmitted? |
| --- | --- | --- | --- | --- |
| Source adapter registry | Academy operations | Trusted repository/service configuration | No | Not required |
| Raw source payload | External publisher; untrusted | Ephemeral trusted ingestion run | No | Retrieved server-side only |
| Quarantine/review record | Academy operations | Protected artifact/tool | No | Operational metadata only |
| Published Radar record | Academy publication pipeline | Same-origin feed plus reviewed fallback | No | Public |
| Feed health | Academy publication pipeline | Same-origin feed metadata | No | Public, non-sensitive |
| Guest profile | User on this device | Versioned local adapter | Yes | Only exported by the user; analytics ID only after consent |
| Feedback text | User | Local draft, then trusted endpoint on submit | Yes | Only after explicit submit |
| Analytics event | User consent boundary | Local queue or trusted endpoint | Reset/opt-out | Only after explicit consent |

## Truthful state model

The client health model must preserve these independent fields:

- `dataSource`: reviewed fallback, last-success cache, or current online feed;
- `refreshState`: idle, refreshing, succeeded, partial, failed, or offline;
- `generatedAt`, `retrievedAt`, `lastSuccessfulRefreshAt`, and
  `lastFailedRefreshAt`;
- per-source health and failed-source count;
- `stale` derived from explicit policy, not from network connectivity;
- snapshot/version/checksum used for new/updated/corrected comparisons.

The UI must not collapse these facts into one “online/offline” boolean.
