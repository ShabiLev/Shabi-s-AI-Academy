# Version 1.7 test strategy

## Principles

- Prove domain behavior with deterministic clocks, IDs, source fixtures, and
  network adapters before exercising UI flows.
- Test the reviewed fallback and failure paths as first-class behavior.
- Every external input starts as `unknown`; negative tests must prove rejected
  fields are not retained or executed.
- Hebrew RTL and English LTR, desktop/mobile, keyboard, screen reader, offline,
  partial, empty, loading, failure, retry, corruption, and reset states are
  release dimensions.
- Exact command results are recorded as passed, failed, or `notAvailable`.
  Planned scripts are not reported as existing until they are added.
- Visual baselines are never auto-updated. Candidate images require human
  review.

## Baseline evidence

The architecture stage ran:

| Command | Result |
| --- | --- |
| `npm run docs:check` | Passed |
| `npm run test:radar` | Passed, 6 tests |
| `npm run radar:validate` | Passed for the checked-out static feed |

These results validate the baseline only. They do not satisfy Version 1.7
release gates.

## Test pyramid

### Unit/domain

- Guest profile parsing, random ID creation, migrations, corruption recovery,
  retention, limits, merge/replace plans, export envelope, import validation,
  rollback, and consent defaults.
- Adapter registry validation, canonical URLs, redirect policy, source types,
  enable/disable, schedule/timeout/retry/rate policy, health transitions.
- RSS/Atom/JSON adapters, payload limits, normalized dates/timezones, language,
  title/text sanitization, discarded unknown fields, and checksums.
- Deduplication and clustering using canonical URL, normalized title,
  publisher, entities, time window, checksum, and reviewed rules.
- Topic classification, source/confidence/relevance/freshness/Israel scoring,
  publication state transitions, quarantine, correction history.
- Local ranking, diversity, important-news inclusion, explanations, Latest
  invariance, briefing selection, what-changed comparison, and cached-data
  newness rules.
- Saved searches, follows, read/dismissed/recent views, notifications, quiet
  hours, analytics allowlist, feedback payload minimization.

### Component/integration

- Guest repository with profile/onboarding/experience/Radar contexts.
- Feed repository combining current, last-success, and reviewed fallback.
- Ingestion pipeline with multiple adapters, partial failures, idempotent
  scheduled runs, cache preservation, publication/quarantine/correction flows.
- Radar filters/views/cards, related coverage, source indicators, actions, and
  local persistence.
- Briefing and what-changed sections against actual feed fixtures.
- Import preview, merge/replace, quota/write failure, rollback, and reload.
- Consent changes controlling analytics/feedback network adapters.
- In-app notifications generated from followed topics, briefing readiness,
  corrections, source outages, and product updates.

### End-to-end

- First visit reaches core public value with no login/session modal.
- First-visit walkthrough starts only after onboarding readiness, supports Start/Not now, resumes the exact step after refresh, completes once, restarts from Help/Settings, and opens mobile navigation through an explicit action.
- Shared Playwright fixtures seed `first-visit-v1` as completed by default. Only dedicated first-visit scenarios remove that actor-scoped record; visual and unrelated regression suites must never inherit a surprise welcome dialog.
- Optional onboarding completion and skip; choices remain editable.
- Follow topic/source/keyword, save, read/unread, dismiss, read later, recent
  view, saved search rename/run/delete/reset.
- Daily briefing and what changed use current records only.
- Reviewed fallback on offline startup; partial source warning; stale state;
  total outage; recovery without lost favorites/history.
- Guest-profile export, invalid import, preview, merge, replace, rollback, and
  reset.
- Analytics consent denied by default, opt-in, opt-out, reset; feedback submit
  without local/private fields.
- Hebrew and English on desktop, tablet, and mobile; direct route and refresh
  parity on BrowserRouter and HashRouter deployments.

### Security

- Malformed XML/JSON, oversized and compressed payloads, excessive depth,
  control characters, unknown fields, prompt injection, unsafe HTML, malicious
  URL schemes, credential URLs, redirect abuse, private-network targets,
  duplicate poisoning, future dates, stale records, source spoofing, rate
  limiting, import prototype keys, and quota failure.
- Static scans for unsafe HTML/code execution/dynamic untrusted imports and
  secret-shaped additions.
- CSP and security-header inspection on a deployed preview.

### Quality and operations

- Axe on every complex state in both languages.
- Manual keyboard, focus, screen-reader, zoom, copy, and cognitive review.
- Cross-browser Chromium/Firefox/WebKit plus configured mobile projects.
- Representative stable visual states; human-reviewed Linux/Windows baselines.
- Lighthouse and bundle impact for landing, Radar, briefing, onboarding,
  profile/settings, and authenticated legacy routes that remain supported.
- Exact-SHA CI manifests, schedule idempotency, artifact digests, storage
  retention, source-health artifacts, rollback, Vercel smoke, and GitHub Pages
  parity.

## Slice gates

| Slice | Minimum focused coverage | Broader gates |
| --- | --- | --- |
| 1 Guest profile | Guest schema/migration/import/export tests and affected component/E2E journeys | `npm run lint`, `npm run test:run`, `npm run test:coverage`, `npm run build`, `npm run test:e2e`, `npm run test:a11y`, `npm run docs:check` |
| 2 Ingestion | Adapter/registry/pipeline/dedup/publication/security tests and static feed validator | Previous gates plus integration suite, `npm run radar:validate`, schedule idempotency, artifact/Pages build checks |
| 3 Radar state/views | Radar unit/component tests and core Radar E2E | Full functional/cross-browser, accessibility and visual tests |
| 4 Ranking | Ranking/diversity/explanation deterministic tests | Radar E2E and performance regression |
| 5 Briefing/changed | Briefing selection/newness/correction/timezone tests | Bilingual responsive E2E, a11y, visual and performance |
| 6 Feedback/analytics | Consent/event/payload/rate-limit tests | Network privacy E2E, security review and deployment boundary checks |
| 7 Hardening | All focused suites | Complete release and evidence gates, manual reviews, exact-SHA CI, production smoke |

## Required release commands

Use repository scripts that actually exist:

```text
npm run docs:check
npm run aos:check
npm run test:aos
npm run test:evidence
npm run test:quality-summary
npm run test:release
npm run memory:check
npm run lint
npm run test:run
npm run test:coverage
npm run build
npm run build:pages
npm run catalog:check
npm run quality:inventory
npm run test:e2e:functional
npm run test:e2e:cross-browser
npm run test:journeys
npm run test:ux
npm run test:a11y
npm run test:visual
npm run test:performance
npm run quality:collect
npm run quality:analyze
npm run quality:system-report
npm run test:e2e:pages
npm run retention:verify
npm run quality:baseline-integrity
npm run validate:release
npm run quality:evidence:full
git diff --check
```

Dedicated Version 1.7 scripts may be added during implementation, but the
master release command must include them before release. Missing scripts are
`notAvailable`; they are not silently substituted.

## Deterministic fixture matrix

At minimum, fixtures must cover:

- zero records, one record, 250 records, and one-over-limit;
- one healthy source, mixed healthy/failing sources, all failing, disabled
  source, rate limited, timeout, retry success, and retry exhaustion;
- same URL, redirected URL, tracking parameters, title-only duplicate,
  multi-language duplicate, false-positive similar title, correction, and
  cluster split;
- now, future skew boundary, excessive future date, stale, timezone/date
  rollover, last-visit exactly equal/newer/older;
- no interests, one interest, conflicting interests, source diversity,
  dismissed/favorite/read feedback, and major-news override;
- storage unavailable, malformed legacy schema, migration chain, quota error,
  oversized import, unknown structure, merge conflict, and rollback;
- walkthrough actor isolation, malformed/oversized records, legacy in-progress
  migration without completion leakage, refresh resume, dismissal, completion,
  language direction, missing target, focus return, and mobile drawer action;
- consent absent, denied, granted, revoked, reset, and policy-version change.

## Manual validation

Automation cannot certify:

- source/editorial accuracy, Hebrew translation quality, and recommendation
  usefulness;
- screen-reader comprehension, keyboard journey quality, and cognitive load;
- visual baseline acceptance;
- security/privacy/content review;
- real production source behavior, Vercel/Pages publication, or rollback.

Those statuses remain `notRun` until a human reviewer records the decision.

## Exit criteria

Version 1.7 is not release-ready unless all required automated gates pass on the
exact candidate SHA, every required manual review is recorded, the deployed
commit matches that SHA, the production smoke matrix passes, source failure
states are truthful, and rollback has a verified target and procedure.
