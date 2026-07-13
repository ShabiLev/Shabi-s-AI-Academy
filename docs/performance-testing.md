# Performance testing

Version 1.1.0-beta.1 adds smoke navigation for the complete beta route set. Catalogs are immutable and generated compactly, histories are bounded, there are no polling loops or background timers, feature pages are lazy-loaded, and React dependencies use a deterministic vendor chunk.

Lighthouse CI (`@lhci/cli` + `lighthouse`) is the lab-performance gate, run against a production build served by `vite preview` — never the Vite dev server.

## Architecture

Two audit paths, because of one real technical constraint (explained below):

1. **Public routes** — `lighthouserc.cjs` (desktop) and `lighthouserc.mobile.cjs` (mobile), both auditing `/login` via the standard `@lhci/cli` `collect`/`assert`/`upload` flow.
2. **Authenticated AI Workspace** — `quality/scripts/lighthouse-authenticated-flow.mjs`, auditing Dashboard (`/`), Search (`/search`), Assistant (`/assistant`), Workflow Builder (`/workflows/new`), and Analytics (`/analytics`) via Lighthouse's programmatic **User Flow** API (`startFlow`), run once for desktop and once for mobile viewport/throttling.

Both paths share one threshold source: `quality/config/lighthouseThresholds.cjs`.

### Why two paths — the puppeteerScript problem

Demo Login stores its session flag in `sessionStorage` (not cookies or `localStorage`), deliberately — so that closing the browser tab signs you out, matching the documented "local development simulation" behavior of Demo Login.

`@lhci/cli`'s standard authentication recipe (`collect.puppeteerScript`) does not work with this: the script gets its own Puppeteer page, performs the login, and that page is discarded before Lighthouse's actual audit navigation — verified empirically during this sprint (instrumented logging showed the session flag being set and read back successfully inside the script, then the real Lighthouse audit of `/` still landed on `/login?from=%2F`). `sessionStorage` does not survive to a new browser tab; cookies or `localStorage` would have, but changing Demo Login's storage mechanism just to make a test tool happy was rejected as changing real, working, tested application behavior for testing convenience.

The fix: Lighthouse's own **User Flow** API (`lighthouse`'s `startFlow`) keeps one real Puppeteer page/tab open for an entire multi-step session — log in once, then `flow.navigate()` each subsequent route on that same tab, so `sessionStorage` survives because it never leaves the tab. This was verified working end-to-end (real scores returned, `finalDisplayedUrl` stayed on the target route rather than bouncing to `/login`).

## Thresholds

| | Desktop | Mobile |
| --- | --- | --- |
| Performance | ≥ 0.85 | ≥ 0.75 |
| Accessibility | ≥ 0.90 | ≥ 0.90 |
| Best Practices | ≥ 0.90 | ≥ 0.90 |
| SEO | ≥ 0.80 (warn) | ≥ 0.80 (warn) |
| Largest Contentful Paint | ≤ 3000ms (warn) | ≤ 3000ms (warn) |
| Cumulative Layout Shift | ≤ 0.1 (warn) | ≤ 0.1 (warn) |
| Total Blocking Time | ≤ 400ms (warn) | ≤ 400ms (warn) |

Performance/accessibility/best-practices failures block; SEO and the Core Web Vitals metrics warn (configurable per `docs/quality-gates.md`'s gate-status model).

### Measured baseline (2026-07-11, this Windows dev machine, production build)

| Route | Device | Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- | --- |
| /login | desktop | 1.00 | 1.00 | 0.96 | 0.91 |
| /login | mobile | 1.00 | 1.00 | 0.96 | 0.91 |
| / (Dashboard) | desktop | 1.00 | 1.00 | 0.96 | 0.91 |
| / (Dashboard) | mobile | 1.00 | 1.00 | 0.96 | 0.91 |
| /qa (QA Center) | desktop | 1.00 | 1.00 | 1.00 | 0.91 |
| /qa (QA Center) | mobile | 1.00 | 1.00 | 1.00 | 0.91 |

This app is small (a single ~350KB JS bundle, no heavy third-party scripts), which is why both desktop and mobile profiles score similarly high even under Lighthouse's default mobile network/CPU throttling. These numbers reflect this specific machine's hardware and network conditions on this date — they are not equivalent to real-user field data, and CI hardware will very likely produce different absolute numbers (the thresholds above are set with margin for that).

## Commands

```bash
npm run test:performance          # build + collect + assert (desktop, mobile, public, authenticated)
npm run test:performance:collect  # build + collect only (no pass/fail assertion for the public routes)
npm run test:performance:assert   # assert against already-collected LHCI results
npm run test:performance:open     # open the desktop Login Lighthouse HTML report
```

`quality/scripts/run-lighthouse.mjs collect` runs `lhci collect` for both public-route configs, then the authenticated-flow script for both device profiles (which asserts its own thresholds inline and exits non-zero on failure, since it is collect+assert combined for that piece). `quality/scripts/run-lighthouse.mjs assert` runs `lhci assert` + `lhci upload` for the two public-route configs against whatever `.lighthouseci/` data the last collect run produced.

Generated reports (HTML + JSON, both public-route and authenticated) are written to `quality/generated/lighthouse/` — gitignored, never committed. A simplified `quality/generated/lighthouse-summary.json` (route, device, scores, thresholds, pass/fail, `generatedAt`) is produced by `npm run quality:collect` for the QA Center.

## What this is not

- Lab data, not real-user field data (no Chrome UX Report / RUM integration exists in this project).
- `e2e/specs/performance-smoke.spec.ts`'s lightweight Playwright checks (no failed requests, no unhandled errors, generous non-flaky interactivity bounds) complement this — they are not a Web Vitals substitute, and Lighthouse remains the actual performance gate.
- Local results vary by hardware; treat CI's numbers, once the pipeline runs there, as the comparison baseline for regressions — not this document's numbers, and not whatever a contributor's own laptop reports.
- Performance history/trending over time is not implemented — the QA Center shows only the latest result.

## Troubleshooting

- **"Timed out waiting for the server to start listening"** from `lhci collect`: cosmetic on Windows in this project — Vite's `➜ Local:` readiness line doesn't always reach `@lhci/cli`'s pattern matcher through the `npm run preview` wrapper process promptly, but the underlying HTTP health-check still succeeds and the audit proceeds normally. Confirmed via the actual collected results, not just the exit code.
- **Puppeteer/Chromium fails to launch in CI**: GitHub's `ubuntu-latest` runner images generally include the shared libraries headless Chrome needs; if this ever regresses, add the missing `apt-get` packages to the `performance` job in `.github/workflows/ci.yml` rather than disabling the check.
