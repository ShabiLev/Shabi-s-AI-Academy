# Complete Beta Testing and Quality Specification

## Layers
TypeScript, ESLint, Vitest, coverage, Playwright, browser matrix, axe, visual, Lighthouse, docs validation, catalog validation, security and manual QA.

## Domain suites
Curriculum, prompt packs, starter agents, both Playgrounds, projects, KB, roadmap, changelog, docs center, release center, developer mode, deployment, migrations and security.

## Required user journeys
1. About → Login → Lesson
2. Complete lesson → related prompt
3. Import prompt pack
4. Edit/save prompt
5. Prompt Playground
6. Import starter agent
7. Mock and Dry Run
8. Approval/retry
9. Create project
10. Link prompt/agent/run/document
11. Search KB
12. Review QA/Release Center
13. Switch language and refresh
14. Sign out/in
15. Direct Vercel routes

## Accessibility
Axe and keyboard tests for all new major screens/dialogs.

## Visual
Representative screens only; deliberate baseline updates.

## Performance
Lighthouse public root, About, Login, Dashboard, libraries, Playgrounds, Projects and KB. Never lower thresholds.

## Security automation
Secrets in bundle, tokens in storage, unsafe HTML, external prompt execution, route leaks, key exposure, oversized uploads and unsafe filenames.

## Manual QA
Hebrew/English, mobile, typography, content quality, privacy wording, Vercel routes, READY deployment, console, keyboard, screen-reader smoke and 200% zoom.

## Isolation
No test-order dependencies. Deterministic IDs, clocks and storage fixtures.

## Reporting
Counts, coverage, browser projects, accessibility, visual, Lighthouse and manual status.
