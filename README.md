# Shabi's AI Academy

Shabi's AI Academy is a bilingual learning platform for practical AI engineering and agent-development skills. The current release is **Version 0.6.0**.

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
- Enforced Vitest coverage thresholds, an axe-core accessibility suite, deterministic Playwright visual regression, and Lighthouse CI performance gates — see [docs/quality-gates.md](docs/quality-gates.md)

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
npm run preview
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
- Course content is local and only the first two lessons are currently available.
- Prompt persistence, agent building, project synchronization, and live radar data are not implemented.
- Visual regression baselines were generated on Windows and are labeled non-canonical until regenerated on Linux CI via the `workflow_dispatch` job — see `docs/visual-regression.md`.
- Lighthouse scores reflect this project's local/CI hardware, not real-user field data — see `docs/performance-testing.md`.
- The QA Center's issue register and release checklist are browser-local only; they are not a replacement for GitHub Issues/Jira and are not synchronized across machines.
- Automated accessibility, visual, and performance checks do not replace manual keyboard-only, screen-reader, zoom, or cognitive-usability review — see `docs/manual-qa-checklist.md`.

## Roadmap

1. Integrate production authentication with secure server-managed sessions.
2. Expand lesson content and progress tracking.
3. Add prompt-library and guided agent-design workflows.
4. Add project milestones, synchronization, and curated AI radar content.
5. Regenerate and commit canonical Linux visual baselines via the CI `workflow_dispatch` job.
6. Track coverage/Lighthouse trend history over time (currently a placeholder in the QA Center).
