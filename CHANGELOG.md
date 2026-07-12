# Changelog

All notable changes to this project are documented here following the Keep a Changelog format.

## [0.7.0-alpha.1] - 2026-07-12

### Added

- Deterministic Runtime Engine and typed state machine
- MockProvider and Dry Run generation
- Provider and planned-tool registries
- Approval, retry, and cancellation flows
- Browser-local Run History, Runtime demo, and detail routes
- Runtime QA Center metrics, How To guidance, and automated regression coverage

### Changed

- Agent architecture now has a reusable execution foundation
- QA Center now reports Runtime capability and test status
- Application navigation includes Run History

### Security

- Live execution remains disabled
- No API keys are accepted or stored
- No external tools are executed
- Mock and Dry Run remain browser-local

## [0.6.1] - 2026-07-12

### Added

- Curated prompts.chat Starter Catalog
- Safe external Prompt import workflow
- Source and CC0-1.0 license attribution
- Controlled developer tooling for Catalog validation and updates
- Prompt Catalog and third-party data documentation
- Automated Catalog regression coverage

### Changed

- Prompt Library header now uses a consistent page-header layout
- Prompt Library filters now use a responsive aligned toolbar
- Dashboard distinguishes personal Prompts from Starter Catalog Prompts
- How To explains Catalog browsing, importing, duplicates, and attribution
- Shared spacing and form-control alignment were standardized

### Fixed

- Misaligned New Prompt action and excessive blank spacing above filters
- RTL favorites-checkbox, select-arrow, and form-control alignment
- Inconsistent filter-control heights, toolbar overlap, and mobile overflow

## [0.6.0] - 2026-07-11

### Added

- Twelve-step Agent Builder, browser-local Agent Library, five templates, Blueprint export, and deterministic simulation scenarios
- Deterministic Agent design-quality score with explicit production-readiness limitations
- “Anatomy of an Agent” lesson, dashboard Agent metrics, and a searchable bilingual How To guide
- Explicit `manualChecklist` quality gate with versioned local override semantics

### Fixed

- Lighthouse preview startup now uses HTTP readiness polling and guaranteed cleanup instead of log-pattern detection

## [0.5.0] - 2026-07-11

### Added

- Bilingual QA Center (`/qa`) with a release-status header, all 10 quality gates, test/coverage/accessibility/visual/performance summaries, a known-issues overview, and a deterministic (non-AI) analyzer summary
- Vitest code coverage via `@vitest/coverage-v8` with enforced, measured thresholds (statements/lines 75%, branches 65%, functions 70%; real baseline ~95/84/80/95%)
- Playwright accessibility suite (`@axe-core/playwright`, WCAG2A/AA) across 17 scans in Hebrew and English, plus a typed, empty-by-default allowlist policy
- Deterministic Playwright visual regression (`visual-chromium` project) with 22 baselines across desktop/mobile and Hebrew/English, fixed viewport/locale/timezone/color-scheme/reduced-motion, and a documented Windows-vs-Linux baseline provenance policy
- Lighthouse CI performance gates against a production build, covering both public (`/login`) and authenticated (Dashboard, QA Center) routes via a custom Lighthouse User Flow script, desktop and mobile profiles
- Lightweight Playwright performance-smoke checks (no failed requests, no unhandled errors, generous non-flaky interactivity bounds) complementing Lighthouse
- Machine-readable quality-report pipeline (`quality/scripts/collect-quality-results.mjs`, `analyze-quality-results.mjs`, `write-build-metadata.mjs`) producing `quality/generated/latest-quality-report.json`, never fabricating a "Passed" result for a tool that didn't run
- Internal, browser-local QA issue register (create/edit/resolve/reopen/filter/search/delete/export/import) and a per-version release-readiness checklist (automated gates + manual checkboxes)
- Non-sensitive build metadata (app version, commit SHA, branch, build timestamp) injected via Vite `define`, with safe fallbacks when unavailable
- `docs/quality-gates.md`, `docs/accessibility-testing.md`, `docs/visual-regression.md`, `docs/performance-testing.md`, `docs/manual-qa-checklist.md`, `docs/qa-center.md`, and `quality/README.md`
- GitHub Actions CI split into `quality-core`, `e2e`, `accessibility`, `visual`, `performance`, and `quality-summary` jobs with diagnostic artifact uploads, plus a manual `workflow_dispatch` job to regenerate canonical Linux visual baselines for review

### Changed

- `docs/testing.md` now documents the full quality-command surface and a permanent rule requiring accessibility/visual/performance/persistence coverage for every future feature or bug fix
- README documents the new Quality Engineering platform, updated project structure, and updated current-limitations/roadmap sections
- Bumped `vitest`/`@vitest/coverage-v8` to 3.2.7, resolving a critical upstream advisory in the Vitest UI dev server (unused in this project's scripts, but no longer present regardless)

### Fixed

- Insufficient color contrast on the mobile sidebar's version/status text, found by the new accessibility suite
- Missing distinction between quality-gate states Passed, Failed, Warning, Not run, and Not available (previously no representation existed at all)
- Lack of automated WCAG regression coverage
- Lack of stable, deterministic visual-change detection
- Lack of enforceable code-coverage thresholds

## [0.4.0] - 2026-07-11

### Added

- Interactive Prompt Workshop, live preview, deterministic quality score, four samples, and browser-local Prompt Library
- Prompt create, edit, duplicate, delete, favorite, search, filters, sorting, TXT/Markdown export, and Lesson 2 integration
- Prompt Library Vitest and Playwright coverage

### Changed

- Dashboard Prompt Library card now uses stored metrics
- Prompt Library placeholder replaced by a functional workspace
- Validation expanded with prompt regression coverage

### Fixed

- Empty generated sections are omitted and malformed storage is handled safely
- Improved mobile prompt forms and confirmation dialog behavior

## [0.3.0] - 2026-07-11

### Added

- Playwright E2E infrastructure, automatic server startup, desktop/mobile projects, reports, traces, screenshots, and videos
- GitHub Actions validation and failure artifacts
- Typed bilingual course model, catalog, lesson pages, local progress, quizzes, drafts, reset, and two complete lessons

### Changed

- Dashboard progress and Continue Learning now use saved progress
- Validation now includes browser regression tests

### Fixed

- Removed hardcoded progress and excluded Coming soon lessons from calculations
- Improved responsive lesson, table, and quiz behavior

## [0.2.0] - 2026-07-11

### Added

- Authentication-ready architecture
- Demo login page
- Protected routes
- User profile menu
- Mobile Home and Back navigation
- Language selection in Settings

### Changed

- Improved desktop and mobile headers
- Language selector moved from the header to Settings
- Responsive behavior improved
- Hebrew user display name corrected to שבי

### Fixed

- Mobile layout overlap risks
- Empty placeholder layout region
- RTL and LTR responsive inconsistencies
- Unsafe fixed-size layout behavior

## [0.1.0] - 2026-07-09

### Added

- Initial React, TypeScript, Vite application foundation
- Bilingual dashboard and routed academy sections
