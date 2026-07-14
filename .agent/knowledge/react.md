# React

## Purpose

Interpret the repo's React conventions for an agent writing or editing
components, hooks, or contexts, without restating the standard.

## Authoritative source(s)

- [.codex/standards/react.md](../../.codex/standards/react.md)
- [.codex/architecture/frontend.md](../../.codex/architecture/frontend.md)
- `package.json` (`react`, `react-dom` — both pinned to `latest`)

## Project-specific interpretation

The app is built entirely from function components. `src/App.tsx` composes
~14 nested context providers (`AuthProvider`, `ExperienceProvider`,
`OnboardingProvider`, `GuidedTourProvider`, `CourseProgressProvider`,
`PromptLibraryProvider`, `AgentLibraryProvider`, `ProjectProvider`,
`KnowledgeProvider`, `RuntimeProvider`, `WorkspaceProvider`,
`CommandPaletteProvider`, `WorkflowProvider`, `AssistantProvider`) around the
router. Pages under `src/pages/` are consumers of these contexts and of
domain modules (e.g. `src/agents/`, `src/prompts/`, `src/knowledge/`); pages
do not read `localStorage` or call Supabase directly. Many secondary pages
are `lazy()`-loaded in `App.tsx` with a `Suspense fallback={null}` wrapper —
follow that existing pattern for new secondary pages rather than adding them
to the eager import list.

## Constraints

- New components must be function components with accessible names and
  semantic elements (react.md mandatory rules).
- Effects synchronize with external systems only (storage reads/writes,
  subscriptions) — never used to derive state that a pure function could
  compute inline.
- Adding a new nested provider to `App.tsx` is a state-management decision;
  check `.agent/knowledge/state-management.md` first, since the provider
  nesting in `App.tsx` is already deep.

## Known limitations

- Provider nesting in `App.tsx` is deep (14 levels) and documented here as
  observed fact, not endorsed as ideal; do not "fix" it as an incidental
  refactor inside an unrelated feature task (refactoring.md governs that).
- Not every secondary page is lazy-loaded consistently; a few are imported
  eagerly alongside the always-needed shell pages. Match the existing
  import style for the page's actual traffic pattern rather than inventing a
  new convention.

## Current implementation status

Shipped and stable: function-component-only codebase, context-per-domain
composition in `App.tsx`, lazy route-level code splitting for most
secondary/detail pages. No class components, no external state-management
library (Redux/Zustand/etc.) are present in `package.json`.
