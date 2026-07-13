# Quality gates

Version 1.2.0-beta.1 adds explicit regression evidence for Search, Command Palette, Assistant, Workflow, Workspace backup, Radar, profile overlays, analytics, security, accessibility, and reviewed visual baselines. These gates are derived from real generated reports; the QA Center never infers success from feature availability.

The Runtime milestone adds focused evidence for state transitions, MockProvider, Dry Run, storage validation, E2E, and accessibility. QA Center labels these as not run until a generated report proves them; Mock availability and Live not configured are capability status, not fabricated CI results.

Sprint 5 (v0.5.0) adds an enforced set of quality gates on top of the existing Vitest/Playwright suite. This document is the reference for what each gate means, how its threshold was chosen, and how the overall release status is computed.

## Gates

| Gate                 | What it checks                                                 | Command                    |
| -------------------- | -------------------------------------------------------------- | -------------------------- |
| Lint                 | `eslint .` reports zero errors                                 | `npm run lint`             |
| Unit/Component tests | Vitest suite, zero failures                                    | `npm run test:run`         |
| Coverage             | Vitest coverage-v8 vs. enforced thresholds                     | `npm run test:coverage`    |
| Build                | Production build succeeds                                      | `npm run build`            |
| E2E fast             | Playwright, Desktop Chromium only                              | `npm run test:e2e`         |
| E2E full             | Playwright, all 5 projects                                     | `npm run test:e2e:full`    |
| Accessibility        | axe-core WCAG2A/AA scan, zero unexpected violations            | `npm run test:a11y`        |
| Visual regression    | Playwright screenshot comparison vs. committed baselines       | `npm run test:visual`      |
| Performance          | Lighthouse CI vs. desktop/mobile thresholds                    | `npm run test:performance` |
| Manual checklist     | Versioned browser-local review; collected reports use `notRun` | QA Center                  |
| Git diff check       | `git diff --check` (whitespace/conflict markers)               | part of `validate:release` |

Every gate has five possible states: **Passed**, **Failed**, **Warning**, **Not run**, **Not available**. A missing result is never displayed as Passed — see `docs/qa-center.md`.

## Coverage policy

- Enforced in `vite.config.ts` (`test.coverage.thresholds`) and in CI (`quality-core` job).
- Thresholds may only stay equal or increase over time — never lowered to paper over a regression.
- Current thresholds (`quality/config/coverageThresholds.cjs`), matching the Sprint 5 recommended targets:

  | Metric     | Threshold | Measured baseline (2026-07-11) |
  | ---------- | --------- | ------------------------------ |
  | Statements | 75%       | 95.25%                         |
  | Branches   | 65%       | 83.51%                         |
  | Functions  | 70%       | 80.09%                         |
  | Lines      | 75%       | 95.25%                         |

  The baseline was measured on this branch after adding integration tests for previously-uncovered flows (lesson quiz, prompt Builder/Details/Library CRUD, ConfirmDialog, PromptPreview) that predate Sprint 5 — coverage was not raised by excluding code, only by testing more of it.

- Excluded from coverage: test files, `src/main.tsx` (bootstrap), `src/test/**` (setup), and three genuinely type-only files (`src/auth/types.ts`, `src/course/types.ts`, `src/i18n/types.ts` — interfaces/type aliases only, zero runtime statements). Business logic, storage, the quality-report analyzer, and user-facing components are never excluded.
- Every new domain utility needs unit tests; every fixed bug needs a regression test.
- A simplified `quality/generated/coverage-summary.json` is produced by `npm run quality:collect` (gitignored — see `quality/README.md`).

## Release status rules

Implemented in `src/quality/qualityStatus.ts` (the tested source of truth used by the QA Center UI) and mirrored in `quality/scripts/analyze-quality-results.mjs` (a plain-JS copy for the Node CLI/CI context, which cannot import TypeScript directly — see that file's header comment for why, and keep both in sync when the rules change).

**Blocked** if any of:

- Build, lint, unit tests, E2E fast, E2E full, or the Git diff check failed.
- Coverage is below its enforced threshold.
- A serious or critical accessibility violation was found (from either the accessibility gate's own status or the scanned violation-severity counts).

**Ready with warnings** if nothing above blocks, and any of:

- Visual regression gate is not `passed` (a mismatch awaits review, or the suite hasn't run).
- E2E full is not `passed` (including not yet run).
- Performance gate is not `passed`.
- The manual release checklist is incomplete.

**Ready** only when every required automated gate passed, visual differences are none/approved, and the manual checklist is complete.

**Not evaluated** when there is no valid quality report to judge (empty, invalid, or an unsupported schema version).

A CI-only generated report (`quality/scripts/collect-quality-results.mjs` + `analyze-quality-results.mjs`) can never claim **Ready** by itself — it has no way to know whether a human completed the manual checklist, so it always reports at best **Ready with warnings**. Only the QA Center UI, which reads the real local checklist state, can show **Ready**.

## Coverage regression policy

- Coverage thresholds are enforced in CI (`quality-core` job) and locally (`npm run test:coverage`).
- Never lower a threshold merely because new code caused a regression — add tests instead.
- Uncovered critical logic must be explicitly documented (in code comments or this file) rather than silently excluded.
- Coverage percentage is not treated as proof of product quality — it measures what ran, not what was verified to be correct.

## Permanent rule for future work

Every future feature or bug fix must include, where applicable: unit/component tests, Playwright functional tests, accessibility coverage, visual-regression coverage for meaningful UI changes, a performance review for loading/bundle-impacting changes, Hebrew and English validation, RTL and LTR validation, mobile and desktop validation, persistence tests, a regression test for the specific bug fixed, QA Center schema compatibility, a CHANGELOG update, a version update, and a Conventional Commit. Visual baselines change only when the visual product change is intentional and reviewed — see `docs/visual-regression.md`.
