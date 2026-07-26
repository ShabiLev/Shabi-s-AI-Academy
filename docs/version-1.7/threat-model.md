# Version 1.7 threat model

Status: architecture baseline. Controls marked “required” are release
requirements and are not claims about current implementation.

## Assets

- Integrity and provenance of published Radar records.
- Availability of the reviewed fallback and last successful feed.
- Guest preferences, follows, favorites, read state, searches, recent views,
  consent, and feedback drafts.
- Source registry, publication policy, review decisions, correction history,
  and ingestion audit trail.
- Provider/source credentials and operational secrets, which must remain
  server-side.
- User trust in freshness, source health, recommendations, and privacy claims.

## Trust boundaries

1. External publishers to trusted ingestion infrastructure.
2. Trusted ingestion to quarantine/review/publication.
3. Published same-origin feed to untrusted browser runtime.
4. Imported JSON to the local guest-profile repository.
5. Browser feedback/analytics to a trusted endpoint.
6. Internal operations tooling to source/publication controls.

No source text, imported field, or feedback content crosses a boundary as
executable instructions.

## Existing controls

- React text rendering; no Radar use of unsafe HTML.
- HTTPS and hostname allowlists, bounded record strings/arrays/counts, checksum
  shape, date ordering, duplicate IDs, and unknown-field reconstruction.
- Same-origin feed fetch with a 1.5 MB response limit check when
  `Content-Length` is present.
- Reviewed fallback and bounded local history/favorites.
- Server-only environment-variable pattern in the reserved Vercel API.
- Import size limit, checksum, secret-shaped-key screening, prototype-key
  rejection, preview, explicit strategy, and rollback pattern.
- Vercel `nosniff`, referrer, permissions, and frame headers.

These controls are useful but do not complete the target threat model.

## Threats and required controls

| Threat | Example impact | Required prevention/detection | Required verification |
| --- | --- | --- | --- |
| Malicious RSS/Atom/JSON | Script markup, deceptive fields, parser crash | Fixed adapter registry; raw bytes cap before parse; parser isolation; strict known-field schemas; text-only normalization; quarantine | Malformed XML/JSON, entity expansion, control characters, nested/large inputs |
| Prompt injection | Story says to reveal secrets or change policy | Treat all content as inert text; never pass source text to shell/tool instructions; any optional model classifier receives a closed task and untrusted-data delimiter server-side | Prompt-like source fixtures remain text and cannot change classification/publication rules |
| XSS/dangerous HTML | Account/session or local-data compromise | No `dangerouslySetInnerHTML`; strip/discard HTML fields; React text nodes only; validated URLs; CSP | Script/event-handler/SVG/data-URL fixtures; static sink scan |
| Unsafe URLs | `javascript:`, credential URLs, malicious redirects | HTTPS only; canonical host/port policy; no credentials; validate every redirect hop and final URL; cap redirects; reject private/link-local destinations where server fetch permits arbitrary DNS | Scheme, Unicode/punycode, port, credential, redirect-chain, DNS rebinding/SSRF tests |
| Oversized payload | Memory/CPU denial of service | Byte limit while streaming, decompression ratio cap, item/string/array/depth limits, timeout and cancellation | Missing/lying `Content-Length`, compressed bomb, maximum-boundary tests |
| Duplicate poisoning | One event dominates the Radar or inherits trust | Canonical URL normalization, checksum, title/entities/window clustering, source diversity, reviewed merge/split rules, cluster caps | Near-duplicate, same-title/different-story, changed-URL, multi-language cases |
| Fake/future timestamps | Old cache shown as new; ranking manipulation | Parse full ISO timestamps, maximum future skew, source/retrieval/verification ordering, server receipt time, correction versioning | Future, invalid leap date, timezone edge, source clock skew, stale record tests |
| Source spoofing/takeover | False story presented as official | Owner-reviewed registry, exact hostname and retrieval method, TLS, source ID bound to adapter, health anomaly/quarantine, rapid disable | Host mismatch, redirect to unapproved host, changed feed identity, disable-source test |
| Feed takeover/publication tampering | Malicious records reach all clients | Least-privilege workflow, protected config review, immutable run manifests/checksums, explicit publication policy, signed/traceable artifact where available, rollback to last known good | Exact-SHA CI, artifact digest, unauthorized publication simulation |
| Partial-source failure | False completeness/freshness claims | Per-source result inventory; partial flag and counts; last success/failure; preserve reviewed cache; no empty overwrite | One/many/all sources fail; recovery run; cached-state truthfulness |
| Analytics privacy | Local ID or private behavior sent silently | Default denied; granular consent with policy version/time; allowlisted event schema; no prompts/imported docs/search text/profile data; opt-out/reset; retention | No network call before consent; revoke/reset; schema rejects extra/private fields |
| Feedback privacy/abuse | Private local state leaks; endpoint spam | Submit only explicit text and safe optional context; visible preview/privacy copy; size/rate limits; server validation; abuse controls; redacted logs | Extra-field rejection, oversized text, rapid submits, story-context allowlist |
| Browser push abuse | Persistent tracking or disruptive alerts | Not enabled by default; separate experimental ADR; explicit opt-in, minimal subscription data, unsubscribe, quiet hours, expiry | Permission denied/revoked, unsubscribe, quiet hours, endpoint deletion |
| Import-file attack | Prototype pollution, storage corruption, quota exhaustion | Guest-profile-only schema; byte/depth/item/string caps; reject unknown/dangerous structures; preview; snapshot transaction; post-write validation; rollback | Malformed, oversized, unknown keys, prototype keys, schema downgrade, quota failure |
| Denial of service | Exhausted source or publication infrastructure | Bounded concurrency, per-adapter timeout/retry/backoff/rate limit, run deadline, circuit/health state, payload caps, idempotent schedule | Slow/hung/retry-after/rate-limit/concurrent schedule tests |
| Dependency/supply chain | Compromised parser or build package | Prefer existing platform APIs; justify any parser dependency; lockfile review; advisories; pinned Actions; least privilege | `npm audit` when dependencies change, lockfile diff, workflow permission review |
| Admin control exposure | Public user disables source or approves record | No public admin UI; server-enforced authorization for any future tool; protected environment/review artifacts meanwhile | Anonymous/guest/client-role requests denied; audit event exists |
| Cache rollback/correction loss | Corrected story reverts to vulnerable/false text | Monotonic snapshot/version policy, append-only corrections, prior snapshot retention, rollback procedure | Older snapshot replay, corrected-record merge, cache corruption |

## Implementation resolution status

The Version 1.7 implementation aligns browser/workflow source identity,
validates redirect destinations, enforces byte caps after retrieval even when
`Content-Length` is missing, rejects invalid/future dates, keeps the reviewed
fallback independent from online publication, defaults analytics consent to
denied, validates the isolated guest-profile import domain transactionally,
and configures deployment security headers including CSP.

Existing client admin routes remain deliberately outside the ingestion
authorization boundary. Source enablement and publication are controlled by
the reviewed repository registry and trusted workflow. A future write-capable
admin service requires separate server-enforced authorization.

The automated security review and dependency reachability assessment are
recorded in [security-review.md](security-review.md). Independent human
security approval and deployed-header inspection remain release gates.

## Security requirements by slice

- **Slice 1:** guest schema, migration/corruption/import/rollback, consent
  default, secret/private-data exclusion.
- **Slice 2:** SSRF/redirect controls, payload/parser isolation, registry
  integrity, quarantine, publication provenance, source disable, audit trail,
  cache preservation.
- **Slice 3–5:** safe source links, bounded local state, recommendation
  transparency, correction/newness accuracy, inert summaries.
- **Slice 6:** feedback/analytics minimization, consent, rate limits, redacted
  logs, opt-out/reset.
- **Slice 7:** dependency scan if scope warrants, secret scan, CSP review,
  exact-SHA artifacts, production header/network inspection, rollback drill,
  human security review.

## Logging policy

Operational logs may include run ID, adapter/source ID, record/cluster ID,
non-sensitive checksums, status transitions, bounded error category, duration,
attempt, and counts. They must not include provider credentials, auth/session
values, anonymous profile IDs without consent, raw feedback, complete source
payloads, private local state, prompts, imported documents, or full free-text
searches.

## Release verdict rule

Any open Critical or High security finding blocks the release. Automated checks
cannot mark the repository’s human security checklist as passed.
