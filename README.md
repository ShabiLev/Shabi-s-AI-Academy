# Shabi's AI Academy

Shabi's AI Academy is a bilingual learning platform for practical AI engineering and agent-development skills. The current release is **Version 0.2.0**.

## Features

- Responsive command-center dashboard and routed academy sections
- Hebrew-first interface with complete English support and automatic RTL/LTR direction
- Settings-based, persistent language selection
- Mobile menu plus route-aware Home and Back navigation
- Authentication-ready context, protected routes, Demo Login, profile menu, and sign out
- Accessible landmarks, keyboard controls, focus indicators, focus-managed overlays, and reduced-motion support

## Demo Login and security

The current Demo Login is only a local development simulation and is not secure production authentication. It stores only a non-sensitive session flag in `sessionStorage`; it does not collect or store passwords, authentication tokens, credentials, or secrets. A production release must replace it with a server-backed identity and session system.

## Technology stack

React, TypeScript, Vite, React Router, Tailwind CSS, Vitest, React Testing Library, and ESLint.

## Project structure

```text
src/
  auth/          Typed auth context and protected-route boundary
  components/    Reusable UI, dashboard, and layout components
  data/          Typed static course data
  i18n/          Language context and centralized translations
  pages/         Login and academy routes
  styles/        Design system and responsive styles
  test/          Test setup
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
npm run build
npm run preview
```

The optimized build is written to the ignored `dist/` directory.

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
- Course content and dashboard data are static.
- Prompt persistence, agent building, project synchronization, and live radar data are not implemented.
- Responsive behavior is covered by flexible layouts and automated interaction tests; visual regression testing is not yet configured.

## Roadmap

1. Integrate production authentication with secure server-managed sessions.
2. Expand lesson content and progress tracking.
3. Add prompt-library and guided agent-design workflows.
4. Add project milestones, synchronization, and curated AI radar content.
5. Add automated cross-browser visual and end-to-end testing.
