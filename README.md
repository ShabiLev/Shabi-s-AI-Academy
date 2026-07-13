# Shabi's AI Academy

Shabi's AI Academy is a bilingual, local-first AI learning and building workspace. The current release is **Version 1.1.0-beta.1**.

The AI Workspace connects 45 open bilingual lessons, 250 structured prompts in 11 packs, 32 immutable starter-agent templates, personal builders, Playgrounds, Projects, Knowledge Base, Global Search, Command Palette, Local Assistant, deterministic workflows, activity analytics, notifications, and complete backup. Mock and Dry Run are executable; Live remains intentionally disabled and no browser API key input exists.

The application is hosted on [GitHub Pages](https://shabilev.github.io/Shabi-s-AI-Academy/) and [Vercel](https://shabi-s-ai-academy.vercel.app). Pages publishes the built `dist` artifact with a repository base path and HashRouter; Vercel keeps root-based BrowserRouter navigation and isolated branch/PR previews. See the [GitHub Pages](docs/github-pages-deployment.md) and [Vercel](docs/vercel-deployment.md) deployment guides.

Sprint 7.1 adds a deterministic browser-local Runtime Engine with Mock and Dry Run modes, explicit approvals, bounded retries, cancellation, and a 50-record Run History. Live providers and external tools remain disabled and no API keys are accepted. See [Runtime documentation](docs/runtime.md).

## Features

- Responsive command-center dashboard and routed academy sections
- Hebrew-first interface with complete English support and automatic RTL/LTR direction
- Settings-based, persistent language selection
- Mobile menu plus route-aware Home and Back navigation
- Authentication-ready context, protected routes, Demo Login, profile menu, and sign out
- Typed course engine with two bilingual lessons, quizzes, exercises, drafts, and local progress
- Playwright browser regression coverage and GitHub Actions CI
- Interactive Prompt Workshop with live preview, deterministic structural scoring, samples, and a persistent local Prompt Library
- Accessible landmarks, keyboard controls, focus indicators, focus-managed overlays, and reduced-motion support
- Bilingual **QA Center** (`/qa`): quality gates, coverage, accessibility, visual regression, performance, a deterministic (non-AI) analyzer, a browser-local issue register, and a release-readiness checklist
- Browser-local **Agent Builder and Library** with five templates, Blueprint export, deterministic design quality, and simulation-only execution
- Searchable bilingual **How To guide** (`/how-to`) with contextual help links
- Curated, read-only **Starter Catalog** with 24 educational prompts from prompts.chat prompt data, explicit CC0-1.0 attribution, and safe local importing
- Enforced Vitest coverage thresholds, an axe-core accessibility suite, deterministic Playwright visual regression, and Lighthouse CI performance gates — see [docs/quality-gates.md](docs/quality-gates.md)
- Unified local Workspace search with deterministic ranking and stackable filters
- Accessible Command Palette, centralized keyboard shortcuts, and contextual commands
- Honest Local Assistant sidebar and chat with deterministic intents and confirmation-gated actions
- Advanced Prompt and Agent Builders with templates, local checks, histories, and diffs
- Deterministic Mock/Dry Run Workflow Builder, notification center, private analytics, favorites, recents, storage manager, and validated Workspace backup

## Demo Login and security

The current Demo Login is only a local development simulation and is not secure production authentication. It stores only a non-sensitive session flag in `sessionStorage`; it does not collect or store passwords, authentication tokens, credentials, or secrets. A production release must replace it with a server-backed identity and session system.

## Technology stack

React, TypeScript, Vite, React Router, Tailwind CSS, Vitest, React Testing Library, and ESLint.

## Project structure

```text
src/
  auth/          Typed auth context and protected-route boundary
  components/    Reusable UI, dashboard, layout, and QA Center components
  data/          Typed static course data
  i18n/          Language context and centralized translations
  pages/         Login, academy routes, and the QA Center page
  quality/       Quality-report schema, storage, analyzer, and build metadata
  styles/        Design system and responsive styles
  test/          Test setup

quality/
  config/        Coverage/Lighthouse thresholds, accessibility allowlist (committed)
  scripts/       Node scripts that collect and analyze quality results
  generated/     Machine-readable quality reports (gitignored, not committed)

e2e/
  fixtures/      Shared Playwright helpers (auth, accessibility, visual stabilization)
  specs/         Functional, accessibility, visual, and performance-smoke specs
```

## Install and run

Requires Node.js 20.19+ or 22.12+ and npm 10+.

```bash
npm install
npm run dev
```

## Quality and production commands

```bash
npm run lint
npm run test:run
npm run test:coverage
npm run build
npm run build:pages
npm run preview
npm run preview:pages
npm run test:e2e:pages
npm run test:e2e
npm run test:e2e:full
npm run test:a11y
npm run test:visual
npm run test:performance
npm run quality:report
npm run validate
npm run validate:full
npm run validate:quality
npm run validate:release
```

The optimized build is written to the ignored `dist/` directory.

Playwright covers Desktop Chromium, Firefox, WebKit, Pixel 7, and iPhone 14, plus dedicated `Accessibility` and `visual-chromium` projects. It starts Vite automatically. Reports are stored in `playwright-report/`; traces, screenshots, and videos in `test-results/`. See `docs/testing.md` and `docs/quality-gates.md`.

## Quality Engineering platform

Version 0.5.0 adds a full quality-engineering layer on top of the existing test suite:

- **Coverage** — Vitest + `@vitest/coverage-v8`, thresholds enforced in CI (`docs/quality-gates.md`)
- **Accessibility** — `@axe-core/playwright`, WCAG2A/AA, scanned in Hebrew and English (`docs/accessibility-testing.md`)
- **Visual regression** — deterministic Playwright screenshots against a canonical `visual-chromium` project (`docs/visual-regression.md`)
- **Performance** — Lighthouse CI against a production build, both public and authenticated routes (`docs/performance-testing.md`)
- **QA Center** (`/qa`) — a bilingual, honest dashboard over all of the above, plus a deterministic (non-AI) analyzer, a browser-local issue register, and a release-readiness checklist (`docs/qa-center.md`)
- **Manual QA** — a checklist for what automation does not cover (`docs/manual-qa-checklist.md`)

None of this replaces human judgment: the QA Center never fabricates a "Passed" result, and several checks (keyboard-only navigation, screen readers, zoom, cognitive usability) remain manual by design.

## Course and local privacy

Course types, bilingual content, and progress live under `src/course`; lesson routes use `/lessons/:lessonSlug`. Version 0.3.0 provides “AI, LLM and Agent” and “Anatomy of a Professional Prompt”. Three further lessons are Coming soon and do not affect progress.

Progress, scores, last lesson, and prompt draft use `shabi-ai-academy.course-progress.v1` in localStorage. Data is browser-specific and clearing storage removes it. Nothing is uploaded. Settings resets course data without changing authentication or language.

Prompt content, favorites, and filters use `shabi-ai-academy.prompt-library.v1`. Prompt content is stored only in the user's local browser in Version 0.5.0 and is never uploaded to an API or server. Prompts support CRUD, favorites, search, filters, sorting, and UTF-8 TXT/Markdown export. See `docs/prompt-workshop.md`.

The QA Center's internal issue register uses `shabi-ai-academy.qa-issues.v1` and its release checklist uses `shabi-ai-academy.qa-checklist.v1`, both browser-local and never synchronized externally. See `docs/qa-center.md`.

## Bilingual and navigation behavior

Language is selected under Settings and saved locally. `LanguageContext` updates the document `lang` and `dir` immediately. CSS logical properties align the sidebar, menus, and directional icons for Hebrew RTL and English LTR. On mobile, Dashboard shows Menu and its title; other academy routes additionally show Back and Home. Back uses safe internal browser history when available and otherwise returns to Dashboard.

## Git workflow

Inspect changes, stage intended files, commit with a Conventional Commit message, and push the active branch without rewriting history:

```bash
git status
git add .
git commit -m "type(scope): summary"
git push origin main
```

Never commit secrets, local environment files, access tokens, `node_modules`, build output, or coverage output.

## Versioning policy

The project follows semantic versioning. Update `package.json`, the lockfile, visible application metadata, README, and `CHANGELOG.md` together for a release.

## Current limitations

- Demo Login is development-only and has no backend identity verification.
- Data is browser-local and origin-specific; there is no cloud synchronization or cross-device collaboration.
- Local Assistant responses are deterministic workspace guidance, not output from a live language model.
- Workflow execution is limited to Mock and Dry Run; approvals pause a run and no real tool is invoked.
- Visual regression baselines were generated on Windows and are labeled non-canonical until regenerated on Linux CI via the `workflow_dispatch` job — see `docs/visual-regression.md`.
- Lighthouse scores reflect this project's local/CI hardware, not real-user field data — see `docs/performance-testing.md`.
- The QA Center's issue register and release checklist are browser-local only; they are not a replacement for GitHub Issues/Jira and are not synchronized across machines.
- Automated accessibility, visual, and performance checks do not replace manual keyboard-only, screen-reader, zoom, or cognitive-usability review — see `docs/manual-qa-checklist.md`.

## Roadmap

1. Design Version 1.2 local collaboration, reusable workflow templates, and multi-agent orchestration.
2. Integrate production authentication with secure server-managed sessions.
3. Define a server-side consent, policy, budget, and audit boundary before any live provider.
4. Add optional synchronization only after privacy and conflict-resolution design.
5. Regenerate and commit canonical Linux visual baselines via the CI `workflow_dispatch` job.
