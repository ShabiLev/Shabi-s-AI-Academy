# Testing strategy

Vitest and Testing Library provide fast component/integration coverage. Playwright covers browser authentication, language, navigation, responsive behavior, and learning flows.

## Commands

- `npm run test:run` and `npm test`: Vitest once or watch mode.
- `npm run test:e2e` / `test:e2e:full`: fast Chromium or all five projects.
- `npm run test:e2e:headed`, `test:e2e:ui`, `test:e2e:report`: diagnosis.
- `npm run validate` / `validate:full`: lint, Vitest, build, and fast/full E2E.

Playwright starts Vite automatically at `http://127.0.0.1:5173`. Specs are under `e2e/specs`; reusable state and error handling are in `e2e/fixtures`. Reports are in `playwright-report`; traces, screenshots, and failure videos are in `test-results`. CI uploads failure artifacts for 14 days.

Tests must be independent and start from controlled storage. Prefer accessible locators, web-first assertions, and auto-waiting. Do not use arbitrary sleeps, XPath, shared mutable state, order dependencies, secrets, or real external services. Unexpected page and severe console errors fail tests. Screenshots and traces aid diagnosis but are not the only assertion.

Every feature or bug fix requires appropriate Vitest coverage and Playwright coverage when user-visible behavior changes. Never weaken assertions merely to make tests pass.

Every future user-visible feature must include relevant Vitest and Playwright coverage, desktop coverage, mobile coverage for layout or interaction changes, Hebrew and English coverage for translated behavior, persistence coverage for local data, and regression coverage for every fixed bug. A feature is not complete without automated coverage.
