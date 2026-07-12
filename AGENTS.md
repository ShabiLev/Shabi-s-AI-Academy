# Shabi's AI Academy — Agent Instructions

Shabi's AI Academy is a bilingual, local-first React learning application for prompts, agents, and quality engineering.

- Stack: React, TypeScript, Vite, React Router, Vitest, Playwright, axe, and Lighthouse.
- Released baseline: 0.6.1. Active milestone: Sprint 7.1 at 0.7.0-alpha.1, targeting 0.7.0.
- Engineering Kit: 1.0.0.

Read in order:

1. [.codex/README.md](.codex/README.md)
2. [.codex/architecture/overview.md](.codex/architecture/overview.md)
3. [.codex/standards/coding.md](.codex/standards/coding.md)
4. [.codex/standards/qa.md](.codex/standards/qa.md)
5. [.codex/standards/security.md](.codex/standards/security.md)
6. [.codex/sprint-7/00-master-spec.md](.codex/sprint-7/00-master-spec.md)
7. Every Sprint 7 file referenced by the master specification.

Requirements:

- Translate every user-facing string into Hebrew and English; use semantic RTL/LTR layouts.
- Preserve accessibility, keyboard operation, visible focus, responsive behavior, and user-authored work.
- Keep built-in catalogs separate from user-owned local data.
- Never store secrets in browser storage or call providers directly from UI components.
- Do not fabricate connected tools, live provider state, test results, or unspecified behavior.
- Update tests and documentation with every feature; run `npm run validate:release` before commit.
- Use the version and Conventional Commit defined by the active Sprint. Do not amend published history.
- Stop before push unless the user explicitly authorizes pushing in the current session.
- If a material requirement is missing or conflicting, follow the source hierarchy and request a decision rather than inventing it.
