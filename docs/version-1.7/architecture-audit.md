# Version 1.7 architecture audit

Audit date: 2026-07-26

Repository baseline: `7512321d0c50901dafbf2ba7472e73a3ea9aa920`

Baseline version: `1.6.0-beta.1`

Target: `1.7.0-beta.1`

## Scope and evidence

This is a read-through of the current repository, not a claim about production
runtime state. The audit covered routing/authentication, Radar domain code,
reviewed and generated feeds, source validators and allowlists, Radar workflow,
browser storage, backup/import, onboarding, profile, recent items,
notifications, analytics, AOS scheduler/event bus/capability registry, research
pipeline, Vercel API boundary, deployment configuration, ADRs, tests, and
current runtime evidence.

Confirmed baseline checks:

| Command | Result |
| --- | --- |
| `npm run docs:check` | Passed; 149 Markdown files and 13 ADRs checked |
| `npm run test:radar` | Passed; 6 tests |
| `npm run radar:validate` | Passed against the checked-out three-record feed |

The ignored AOS runtime state and quality evidence found in this checkout refer
to older branches and SHAs. They are historical local artifacts, not current
evidence for this audit or Version 1.7.

## Current architecture map

| Area | Confirmed implementation | Version 1.7 implication |
| --- | --- | --- |
| Public entry | `LandingPage` offers “Start as Guest,” then creates a `sessionStorage` guest session and navigates to onboarding. | No account is required, but core routes are not directly public; a new visitor cannot open `/radar` without first creating the session flag. |
| Route protection | Nearly every Academy route, including `/radar`, `/onboarding`, `/profile`, and `/settings`, is nested under `ProtectedRoute`. | Public-beta routes must not depend on an authentication-shaped session gate. |
| Optional cloud auth | Supabase authentication, registration, recovery, callback, and account-only routes already exist behind `authService`. | Authentication expansion is explicitly out of scope. New 1.7 domains must not depend on `AcademyUser` or cloud account IDs. |
| Radar UI | `RadarPage` renders search, category/source/date filters, timeline/compact/favorites views, provenance fields, confidence, freshness, source link, refresh, and bilingual copy. | Reusable card/filter/accessibility foundations exist, but most requested views and state do not. |
| Radar domain | `RadarRecord`, `RadarFeed`, validators, provider adapters, retention, grouping helper, favorites/history storage, and context exist under `src/radar/`. | Useful base, but the record and repository contracts need a versioned expansion. |
| Reviewed fallback | Three records exist both in `src/radar/reviewedFeed.ts` and `public/generated/ai-radar-feed.json`. Initial context combines stored history with the TypeScript fallback. | Failure preserves a fallback, but duplicated hand-maintained representations can drift and need a single generated/reviewed source. |
| Same-origin refresh | `SameOriginRadarProvider` fetches `generated/ai-radar-feed.json` using `document.baseURI`, validates it, and only replaces state when a valid feed exists. Refresh is manual. | The trust boundary is reusable. There is no automatic client refresh, cache metadata repository, background polling, or service worker. |
| Workflow | `.github/workflows/update-ai-radar.yml` runs every six hours, validates the checked-out feed and source reachability, runs Radar tests, and uploads an artifact. It has read-only contents permission. | It does not retrieve source feeds, parse new records, cluster stories, publish a changed feed, or manage source health. Its name overstates its current behavior. |
| AOS scheduler | `AosScheduler` is a bounded in-memory scheduler. `AosCoreProvider` registers Radar metadata whose handler intentionally does nothing in the browser. | It is a status/simulation surface, not the ingestion runtime. Scheduled work must stay in trusted infrastructure. |
| AOS research | File-based explicit source records support validation, scoring, freshness, duplicate reports, candidates, and human review. The governing policy forbids autonomous crawling. | Schemas and review concepts are reusable. Fixed scheduled adapters require a new accepted policy/ADR; they cannot be slipped into the current research workflow. |
| Vercel server boundary | `api/live-provider.mjs` demonstrates method/origin/body/consent/size validation and server-only environment variables, but deliberately ships no provider adapter. | It proves a serverless boundary is possible. It is not a Radar ingestion or publication service. |
| Profile/onboarding | Separate local profile, experience, and onboarding adapters exist. Interests are bounded and user-scoped where a user ID is present. | There is no unified anonymous profile ID, schema migration framework, consent model, retention metadata, corruption report, or profile repository abstraction. |
| Recent items | `WorkspaceProvider` records selected route activity and `RecentItems` displays up to 25 of 200 retained activities. | Radar is not currently an activity entity, so Radar recent views and “what changed” cannot use this as-is. |
| Notifications | Local bounded notifications support read/delete/clear and accessible dialog behavior. | No producer creates Radar/briefing/correction/source-health notifications and there are no quiet-hour preferences. |
| Analytics | Local events are bounded to 1,000 and exclude content-shaped keys. Route navigation is recorded automatically. `analyticsEnabled` defaults to `true`. | This violates the Version 1.7 explicit-consent default and lacks the requested event taxonomy and consent provenance. |
| Backup/import | Workspace JSON export has a size cap, checksum, secret-shaped-key filter, prototype-key protection, preview, merge/replace/skip, and best-effort rollback. | Strong reusable mechanics, but guest profile, Radar favorites/history, onboarding, experience, profile, and consent are absent from the exported domain list. Imported known domains are not strictly validated by their domain schema before write. |
| IndexedDB/offline worker | No IndexedDB, Cache API, or service-worker implementation was found. | Version 1.7 may remain on bounded `localStorage`, but the choice and capacity limits must be explicit; “offline” currently means bundled/static fallback plus prior local history. |
| Admin/reviewer | Existing `/admin` routes depend on optional cloud roles and are client UI foundations. | They are not an approved server-enforced ingestion administration surface. Use protected internal tooling or generated review artifacts. |

## Storage inventory

The application currently uses many independent `localStorage` adapters plus
two authentication-shaped `sessionStorage` flags. Important Version 1.7 inputs
are:

| Storage area | Current key or pattern | Bound/recovery behavior |
| --- | --- | --- |
| Radar favorites | `shabis-ai-academy:radar-favorites:v1` | Deduplicated, validated IDs; maximum 500; malformed JSON becomes empty |
| Radar history | `shabis-ai-academy:radar-history:v1` | Maximum 250; record validation; seven-day retention except saved items |
| Workspace | `shabis-ai-academy:workspace:v1` | 1.5 MB maximum; activities 200, preferences 500, notifications 100, analytics 1,000 |
| Onboarding | `shabis-ai-academy:onboarding:v1[:userId]` | Schema-1 normalization; bounded known interests; legacy fallback |
| Experience | `shabis-ai-academy:experience:v1[:userId]` | Schema-1 normalization; beginner default |
| Local profile | `shabis-ai-academy-profile-v1` | Bounded names/goals; malformed data resets silently |
| Language | `shabis-ai-academy-language` | `he`/`en` |
| Guest session | `shabis-ai-academy-guest-session` and legacy demo flag in `sessionStorage` | Session lifetime; represents route access, not durable guest identity |
| Full workspace backup | Selected keys in `backupDomainKeys` | 8 MB input cap, preview, checksum, merge/replace/skip, rollback |

Many other domain keys exist for courses, prompts, agents, projects, knowledge,
workflows, runtime, playgrounds, Assistant, search, commands, QA, guidance, and
motion. Version 1.7 must not reset or migrate those unrelated domains while
creating the guest profile.

## Source validation and allowlists

Three separate source lists currently exist:

1. `src/radar/catalog.ts` allows five legacy catalog hosts.
2. `src/radar/records.ts` allows nine runtime record hosts.
3. `scripts/radar/validate-public-feed.mjs` allows three published-feed hosts.

They are not derived from one registry. The checked-out public feed contains
`hakaveret.education.gov.il`, which the workflow validator accepts but the
runtime `parseRadarRecord` allowlist does not. Therefore:

- `npm run radar:validate` can pass;
- the same checked-out feed can be rejected by the browser provider as an
  invalid response;
- the bundled TypeScript fallback still renders because it is typed directly
  and does not pass through the runtime parser.

This is a confirmed validation-boundary defect and a Slice 2 blocker. One
server-side registry must generate the publication allowlist and a client-safe
source projection; feed validation and browser validation must share the same
contract tests.

The current workflow follows redirects and only verifies the original hostname
before the request. It does not validate the final redirect URL. Redirect
destination enforcement is required before external retrieval is trusted.

## Demo, legacy, and placeholder data

- `src/radar/catalog.ts`, `src/radar/types.ts`, and `src/radar/radar.ts` form a
  legacy eight-item catalog used only by its own unit test. The active Radar
  page uses `RadarRecord` data instead. This duplicate model is not a valid
  personalization seed and must be removed or explicitly migrated.
- The three-record reviewed feed is static release data dated 2026-07-22. It is
  a reviewed fallback, not proof of a live or continuously current Radar.
- Research content under `research/**/seed/` is explicitly seed/demo material
  and must never auto-publish into Radar.
- The AOS scheduler Radar handler is intentionally a no-op browser simulation.
- `UnavailableRadarProvider` and the reserved live-provider API are honest
  capability placeholders; neither performs ingestion.

No hardcoded interest choices should be promoted into a guest profile. Existing
onboarding defaults (`learn`, `beginner`, empty interests) are presentation
defaults, not observed personalization.

## Current offline and partial behavior

Confirmed strengths:

- Initial Radar data is available from the bundled reviewed TypeScript cache.
- A failed refresh does not clear current records or local favorites/history.
- Provider states distinguish cached, online, offline, unavailable, and
  partial, with stable safe error codes.
- Feed and history sizes are bounded.

Current gaps:

- A response marked `partial` carries only one boolean; there is no per-source
  success/failure inventory or last successful refresh timestamp.
- “cached” does not identify bundled fallback versus last successful online
  cache.
- The online feed is not automatically loaded on first visit.
- Feed age and source outage information are not persisted as a repository
  health snapshot.
- There is no stale-feed threshold in the active `RadarRecord` path, correction
  timeline, or protection against future-dated records.
- There is no offline browser cache/service worker. Previously stored Radar
  history is only a bounded local record list.

## Requested capabilities not currently implemented

- Source adapter registry, source disable/health/owner/review policy, and
  multi-source ingestion.
- Bounded retrieval concurrency, retry/backoff/rate limiting at source level,
  parser isolation, language detection, sanitization, quarantine, scoring
  pipeline, and audit trail.
- Story clustering with primary/additional coverage, first/latest dates, and
  correction state. `groupRadarRecords` only groups an already supplied ID and
  is not used by the UI.
- Read/unread, followed topics/sources/keywords, dismissed state, read later,
  saved searches, following views, Israel-first view, and related stories.
- Inspectable local ranking, diversity rules, and recommendation explanations.
- Daily briefing and “what changed since last visit.”
- Unified guest profile ID, profile retention/migrations, guest-profile-only
  export/import/reset, and migration-ready repository.
- Consent-first analytics, feedback submission, privacy explanation, and beta
  measurements.
- Radar notification producers, briefing preferences, or quiet hours.
- Protected ingestion/reviewer operations.

## Release blockers and decisions

| Severity | Blocker | Required decision/action |
| --- | --- | --- |
| High | No ingestion or publication pipeline; current schedule only validates static data | Accept an ADR for fixed-registry scheduled ingestion and deployment-neutral feed publication |
| High | Conflicting allowlists allow CI success and runtime rejection | Generate validation from one source registry and add contract tests |
| High | Core routes still depend on a session-shaped guest gate | Define a public Academy route boundary independent of authentication |
| High | Analytics defaults on | Require explicit consent before any Version 1.7 analytics event is recorded or transmitted |
| High | No guest profile repository or transactional domain import | Accept the local profile/storage ADR and implement schema/migration/rollback tests |
| Medium | Reviewed feed exists in TypeScript and JSON copies | Establish one reviewed source and deterministic generated projections |
| Medium | Legacy Radar model/data is test-only and disconnected | Remove after migration coverage or mark archived; never use as fake personalization |
| Medium | Current redirect checks do not constrain the final URL | Validate every redirect hop/final host and impose response limits |
| Medium | Existing workspace backup excludes 1.7 guest state | Add a separate profile export contract or safely extend the backup with versioned domain validation |
| Medium | No CSP is configured in `vercel.json` or application HTML | Define and verify a deployable CSP compatible with Vite assets and required same-origin endpoints |

No Critical finding was confirmed in the current architecture audit. The High
items block implementation or release readiness until their named design gate
is resolved.

## Reusable Version 1.6 foundations

- Typed React/domain separation and same-origin `RadarProvider`.
- Bounded unknown-input feed validation that reconstructs known fields.
- Reviewed fallback preservation, local favorites/history, stable error codes,
  and inert React text rendering.
- Bilingual Radar card/filter structure and accessible notification/recent
  components.
- AOS event bus, scheduler metadata, capability registry, exact-SHA CI, and
  immutable artifacts.
- Research source schema, tiering, freshness, deduplication report, checksum,
  candidate review, and prompt-injection policy.
- Workspace backup preview, import size cap, dangerous-key rejection, explicit
  strategies, and rollback pattern.
- Reserved Vercel serverless boundary and `/api` rewrite exclusion.

These are starting points, not evidence that the Version 1.7 acceptance
criteria are already met.
