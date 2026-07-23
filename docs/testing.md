# Testing strategy

Version 1.3.0-beta.1 extends the complete beta coverage with public landing and auth routes, Guest onboarding, Beginner/Advanced navigation, page guidance, Help, Glossary, Tours, profiles, provider repositories, migration/conflicts, RLS documentation, Admin denial, and the machine-readable browser quality program documented in [system-quality-program.md](system-quality-program.md). Runtime and cloud-provider tests use injected boundaries and never call real external services.

The release browser matrix covers the required desktop/mobile viewports, Hebrew RTL and English LTR, refresh persistence, keyboard operation, no-network boundaries, corruption recovery, visual baselines, and axe scans for every complex AI Workspace surface. Lighthouse audits Dashboard, Search, Assistant, Workflow Builder, and Analytics on desktop and mobile without lowering thresholds.

Catalog coverage includes metadata/hash validation, search/filter/sort, safe import and duplicate detection, attribution export, responsive RTL/LTR toolbars, accessibility, visual states, and performance smoke navigation. `catalog:check` is part of `validate:release`; `catalog:update` is deliberately excluded.

Vitest and Testing Library provide fast component/integration coverage. Playwright covers browser authentication, language, navigation, responsive behavior, learning flows, accessibility, and visual regression.

## Commands

- `npm run test:run` and `npm test`: Vitest once or watch mode.
- `npm run test:coverage` / `test:coverage:open`: Vitest with enforced coverage thresholds — see `docs/quality-gates.md`.
- `npm run test:e2e:functional`: functional Desktop Chromium only; `test:e2e:cross-browser`: Firefox, WebKit, and mobile compatibility; `test:a11y` and `test:visual`: isolated specialist suites. `test:e2e:full` aggregates those four commands for local release use, while CI runs each independently.
- `npm run build:pages`: create and validate the GitHub Pages artifact with its repository base path, HashRouter mode, production metadata, and bundle safety checks.
- `npm run preview:pages`: serve the already-built Pages artifact locally.
- `npm run test:e2e:pages`: build the Pages variant and verify public, protected, Login, Register, and callback hash routes in Chromium.
- `npm run test:e2e:headed`, `test:e2e:ui`, `test:e2e:report`: diagnosis.
- `npm run test:a11y`: axe-core accessibility suite — see `docs/accessibility-testing.md`.
- `npm run test:visual` / `test:visual:update` / `test:visual:report`: Playwright visual regression — see `docs/visual-regression.md`.
- `npm run test:performance` / `test:performance:collect` / `test:performance:assert` / `test:performance:open`: Lighthouse CI — see `docs/performance-testing.md`.
- `npm run quality:collect` / `quality:analyze` / `quality:report`: generate and analyze the machine-readable quality report — see `docs/qa-center.md` and `quality/README.md`.
- `npm run validate` / `validate:full`: lint, Vitest, build, and fast/full E2E (unchanged from prior releases).
- `npm run validate:quality`: lint, Vitest, coverage, build, fast E2E, accessibility.
- `npm run validate:release`: lint, Vitest, coverage, build, full E2E, accessibility, visual, performance, quality collection/analysis, `git diff --check` — the full release gate.

Playwright runs `npm run preview:test`, which creates a production build and starts Vite Preview automatically at `http://127.0.0.1:5173`. This keeps browser gates representative of the deployable bundle and avoids cold, on-demand dev-server transforms during the first navigation. Specs are under `e2e/specs`; reusable state and error handling are in `e2e/fixtures` (including `a11y.ts` and `visual.ts` for the newer suites). Reports are in `playwright-report`; traces, screenshots, and failure videos are in `test-results`. Each suite type (fast/full/a11y/visual) writes its own JSON report under `quality/generated/` so running one suite never erases another's result before `quality:collect` reads them. CI uploads failure artifacts for 14 days; the quality summary artifact is retained 30 days.

The Pages smoke suite uses `playwright.pages.config.ts`, builds with `/Shabi-s-AI-Academy/`, and previews at `http://127.0.0.1:43991/Shabi-s-AI-Academy/`. The default Playwright configuration remains a root-based local BrowserRouter environment.

Tests must be independent and start from controlled storage. Prefer accessible locators, web-first assertions, and auto-waiting. Do not use arbitrary sleeps, XPath, shared mutable state, order dependencies, secrets, or real external services. Unexpected page and severe console errors fail tests. Screenshots and traces aid diagnosis but are not the only assertion.

Every feature or bug fix requires appropriate Vitest coverage and Playwright coverage when user-visible behavior changes. Never weaken assertions merely to make tests pass.

## AOS validation

`npm run aos:check` (manifest completeness, cross-file link resolution, `.agent/schemas/*.json` validity, and duplicated-workflow-content detection across `.agent/`) is now part of the mandatory command set for any change that touches the Agent Operating System at `.agent/`. See [`docs/aos/evidence-system.md`](aos/evidence-system.md) for how this fits into the broader evidence system, and `docs/aos/troubleshooting.md` for fixing a specific failure.

## Permanent rule for every future feature or bug fix

This rule is permanent, not specific to any one sprint. Every future user-visible feature or bug fix must include, where applicable:

- Unit or component tests (Vitest)
- Playwright functional tests
- Accessibility coverage (add a scan in `accessibility.spec.ts` for new pages/states)
- Visual-regression coverage for meaningful UI changes (add a baseline in `visual.spec.ts`; update existing baselines only via the controlled process in `docs/visual-regression.md`)
- A performance review for changes that affect loading or bundle size (re-run `npm run test:performance` and compare)
- Hebrew and English validation for translated behavior
- RTL and LTR validation for layout changes
- Mobile and desktop validation for layout or interaction changes
- Persistence tests for anything stored in `localStorage`/`sessionStorage`
- A regression test for every fixed bug
- QA Center schema compatibility if the change touches `src/quality/types.ts` (bump `QUALITY_SCHEMA_VERSION` and handle both old and new shapes in `parseQualityReport` if the change isn't backward-compatible)
- A CHANGELOG.md update
- A version update (`package.json`, lockfile, `appMetadata.ts`, footer translations, README)
- A Conventional Commit message

A feature is not complete without automated coverage. Visual baselines must only change when the visual product change is intentional and reviewed — never as a side effect of "just making the test pass."
