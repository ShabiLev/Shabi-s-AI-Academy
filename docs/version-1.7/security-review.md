# Version 1.7 automated security and privacy review

Review date: 2026-07-26.

This document records the automated and code-level review. It does not replace
the mandatory independent human security review.

## Verdict

- No production-reachable Critical vulnerability was found.
- `npm audit --omit=dev` reports one High React Router advisory through two
  dependency nodes. The advisory applies to React Server Components action
  execution. This application is a Vite client-side SPA: it does not enable
  React Router RSC mode, server actions, action routes, or server-side request
  handlers. The vulnerable execution path is therefore not production
  reachable in this release. The installed version is the current published
  `react-router-dom@7.18.1`; the audit's proposed `7.11.0` downgrade exposes
  older advisories and is not an acceptable remediation.
- The full dependency audit reports 17 findings: 2 Low, 1 Moderate, and 14
  High. Apart from the React Router item above, they are confined to
  development-only ESLint, Lighthouse, coverage, and related CLI dependency
  trees. They are not included in the production browser bundle.
- Release remains blocked until the human security review is recorded and all
  other mandatory release gates pass.

## Controls verified in source and tests

| Area | Verified control | Evidence |
| --- | --- | --- |
| External content | XML entities are rejected; markup is normalized to bounded inert text; unknown instruction-like fields are discarded | `scripts/radar/ingestion.test.mjs`, `src/radar/records.test.ts` |
| XSS | Radar content uses React text rendering; no `dangerouslySetInnerHTML` sink exists under `src/` | static source scan and Radar E2E |
| URLs and source identity | HTTPS, exact allowlisted hosts, no credentials, redirect destination validation, canonical tracking-parameter removal | ingestion unit/integration tests and source registry |
| Payload and timestamp abuse | Streaming and browser response byte caps; bounded strings/arrays; invalid/future timestamp rejection | ingestion and record tests |
| Duplicate poisoning | Canonical identity, checksum, deduplication, clustering, diversity, and bounded feed/profile collections | ingestion and personalization tests |
| Import attacks | 512 KB cap, checksum, strict schema reconstruction, dangerous/secret-key rejection, preview, merge/replace, rollback | guest-profile unit tests and E2E |
| Consent/privacy | Analytics defaults off, explicit opt-in, opt-out/reset, private fields excluded; feedback remains bounded and local-only | workspace/guest/feedback tests and E2E |
| Client secrets | Fixed public source registry; no provider credential path in Radar UI; suspicious credential-pattern scan found no embedded credential | source scan and production-bundle inspection |
| Admin exposure | Anonymous and local/guest claims cannot satisfy `isVerifiedAdmin`; ingestion controls are workflow-side, not public UI actions | `adminAuthorization.test.ts` and guarded routes |
| Browser policy | CSP, frame denial, `nosniff`, restricted permissions, referrer policy, and same-origin form/base policy | `vercel.json` |

## Commands

```text
npm audit --omit=dev --json
npm audit --json
npm ls react-router react-router-dom @react-router/dev @react-router/node
rg -n -i "api[_-]?key|client[_-]?secret|private[_-]?key|authorization:\s*bearer|BEGIN [A-Z ]*PRIVATE KEY" src scripts config .github
rg -n "dangerouslySetInnerHTML|createStaticHandler|createRequestHandler|clientAction|serverAction|react-server" src package.json vite.config.ts
```

The production bundle must be rebuilt and scanned again at the final release
candidate SHA. Exact-SHA CI and deployed-header/network inspection remain
mandatory.

