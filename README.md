# Shabi's AI Academy

Shabi's AI Academy is a bilingual learning platform for building practical AI engineering and agent-development skills. Version 0.1.0 establishes the product foundation and a polished first dashboard.

## Current features

- Responsive command-center dashboard with course progress, current lesson, prompt library, agents, project, and AI radar summaries
- Hebrew-first bilingual interface with complete English support
- True RTL/LTR layout switching, including sidebar placement and directional controls
- Persistent language preference with a safe fallback when browser storage is unavailable
- Desktop sidebar, accessible mobile navigation drawer, shared header, content shell, and footer
- Routed, polished foundation pages for lessons, prompt library, agents, projects, radar, and settings
- Typed static data models and a centralized, typed translation layer
- Reusable UI primitives including cards, progress bars, buttons, badges, section headers, and empty states
- Keyboard operation, semantic landmarks, visible focus, reduced-motion support, and accessible progress semantics

## Technology stack

- React and TypeScript
- Vite
- React Router
- Tailwind CSS through the official `@tailwindcss/vite` integration
- Vitest, React Testing Library, and jest-dom
- ESLint with TypeScript and React Hooks rules

## Project structure

```text
src/
  components/
    common/       Reusable UI primitives
    dashboard/    Dashboard-specific components
    layout/       Application shell and navigation
  data/           Typed course and dashboard data
  i18n/           Language context, types, and translations
  pages/          Routed application pages
  styles/         Global design system and responsive styles
  test/           Shared test setup
  App.tsx         Routes
  App.test.tsx    Integration and behavior tests
  main.tsx        Application entry point
_legacy/          Preserved original empty vanilla structure
```

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm 10+

## Installation

```bash
npm install
```

## Development commands

```bash
npm run dev        # Start the development server
npm run preview    # Preview the production build
npm run lint       # Run ESLint
npm run test       # Run Vitest in watch mode
npm run test:run   # Run the test suite once
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

The optimized output is written to `dist/`.

## Bilingual implementation

Hebrew is the default language. Every interface string lives in `src/i18n/translations.ts` and is constrained by a shared TypeScript key union. `LanguageContext` manages the active language, updates the document's `lang` and `dir` attributes, and saves the preference to local storage. Layout uses CSS logical properties so navigation and alignment move naturally between RTL and LTR.

## Accessibility

The application includes semantic landmarks, a skip link, accessible navigation labels, keyboard-operable controls, strong focus indicators, progress-bar semantics, sufficient contrast, and reduced-motion handling. The mobile drawer supports Escape, overlay, close-control, and route-selection dismissal while preventing background scrolling.

## Current limitations

Version 0.1.0 uses static local data. Lesson content, prompt storage, agent building, live radar updates, authentication, and synchronization are intentionally not implemented yet. There is no backend, database, external translation service, or AI API.

## Roadmap

1. Expand the lesson catalog and completion tracking.
2. Add local prompt-library workflows.
3. Introduce guided agent-design exercises.
4. Build project milestones and portfolio views.
5. Add curated AI radar content.
6. Extend settings and learning preferences.

## Status

Version **0.1.0** — initial React foundation and dashboard complete.
