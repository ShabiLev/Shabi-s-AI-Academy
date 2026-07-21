# quality/

Support code for the Quality Engineering platform (see `docs/quality-gates.md` and `docs/qa-center.md`). Nothing here is a duplicate test suite — it collects and analyzes results the real tools (Vitest, Playwright, Lighthouse, ESLint, git) already produced.

```text
quality/
  config/       Committed configuration — thresholds, allowlists. Small, stable, reviewed like any code change.
  scripts/      Node scripts (.mjs/.cjs) that generate and analyze quality/generated/*.json
  generated/    Output of the scripts above. Gitignored — never committed.
  execution/    Frozen historical Version 1.4 evidence retained for compatibility.
  runtime/      Ignored local execution evidence and CI manifest staging.
```

## config/

- `coverageThresholds.cjs` — the single source of truth for Vitest coverage thresholds, imported by both `vite.config.ts` (enforcement) and `collect-quality-results.mjs` (reporting).
- `lighthouseThresholds.cjs` — same idea for Lighthouse, imported by `lighthouserc.cjs`, `lighthouserc.mobile.cjs`, and `lighthouse-authenticated-flow.mjs`.
- `a11yAllowlist.ts` — typed, empty-by-default accessibility exceptions (see `docs/accessibility-testing.md`).

## scripts/

- `write-build-metadata.mjs` — writes `quality/generated/build-metadata.json` (version, commit SHA, branch, build timestamp, deployment environment, and public URL) from safe package, git, and Vercel metadata. Consumed by `collect-quality-results.mjs`. The running app receives the same non-sensitive fields through Vite's `define`; neither path reads or exposes provider secrets.
- `collect-quality-results.mjs` — reads whatever of the following already exist on disk and writes `quality/generated/latest-quality-report.json`: `quality/generated/vitest-results.json`, `coverage/coverage-summary.json`, `quality/generated/playwright-{fast,full,a11y,visual}-results.json`, `test-results/**/axe-*.json` attachments, `e2e/specs/__screenshots__/**/*.png` (for baseline count/mtime), `quality/generated/lighthouse/**`, and re-runs `eslint . --format json` and `git diff --check` itself (fast, read-only, safe to repeat). Missing inputs become `notRun`/`notAvailable` — never `passed`. Also copies the result to `public/generated/latest-quality-report.json` so a locally running app can pick it up (see `docs/qa-center.md`).
- `analyze-quality-results.mjs` — reads `quality/generated/latest-quality-report.json`, computes the release status and a deterministic bilingual analyzer summary (a plain-JS mirror of `src/quality/qualityStatus.ts` + `qualityAnalyzer.ts` — see that file's header for why it's a separate copy, and keep both in sync), writes the result back into the same JSON file, and exits non-zero if the status is **Blocked**.

## Persistent execution evidence

`npm run quality:evidence:fast`, `quality:evidence:full`, `quality:evidence:pages`, and `quality:evidence:headed` invoke existing npm scripts through a cross-platform Node runner. Each invocation creates a local archive under the ignored `quality/runtime/execution/runs/<RUN_ID>/`, captures timestamps, exit codes, sanitized stdout/stderr, coverage, Git state, manual-gate state, exact tested SHA, and an honest recommendation, then refreshes the ignored runtime pointer in `quality/runtime/execution/latest/`.

Complete archives, Playwright media, traces, HTML coverage, generated reports, and `quality/runtime/execution/index.json` remain ignored. CI publishes job manifests and reports as GitHub Actions artifacts for the exact `GITHUB_SHA`; no execution output is committed. Logs redact authorization values, credential-like assignments, tokens, email addresses, the workspace path, and user-home paths. The runner never reads or serializes raw environment values.

The full profile deliberately invokes the existing release commands instead of copying their test logic. A failed blocker remains failed; dependent commands become `notRunDueToDependency`; independent read-only diagnostics may continue. Manual UX, security, and content reviews remain explicit and automation cannot promote them.
- `run-lighthouse.mjs` — orchestrates the two Lighthouse audit paths (`collect` / `assert`); see `docs/performance-testing.md`.
- `lighthouse-authenticated-flow.mjs` — audits Dashboard, Search, Assistant, Workflow Builder, and Analytics via Lighthouse's User Flow API; see `docs/performance-testing.md` for why this exists separately from the LHCI-config-based public-route audit.

## generated/ — known limitations

`collect-quality-results.mjs` is a **best-effort** collector, not a perfect one, given real constraints:

- It can only see the Playwright JSON report file(s) that already exist on disk. `playwright.config.ts` writes each suite type (fast/full/a11y/visual) to its own file specifically so that, say, running `test:visual` after `test:e2e:full` doesn't erase the full-matrix E2E result — but if you only ever run one suite type, only that one is reflected.
- Accessibility violation-severity counts come from parsing `axe-*.json` attachment files under `test-results/` — this directory is itself overwritten per Playwright run, so severity counts reflect only the most recent accessibility run's attachments.
- The `overallStatus` this script computes is deliberately capped at **Ready with warnings** — a CI/CLI process cannot know whether a human completed the manual release checklist, so it never claims **Ready** on its own (see `docs/quality-gates.md`).

None of this is fabricated data — every field either reflects a real artifact on disk or is honestly marked unavailable.
