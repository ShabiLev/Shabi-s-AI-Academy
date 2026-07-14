# Routing

## Purpose

Capture the actual route table shape and guard order so an agent adds new
routes correctly the first time.

## Authoritative source(s)

- [.codex/architecture/routing.md](../../.codex/architecture/routing.md)
- `src/App.tsx`
- `package.json` (`react-router-dom: latest`)

## Project-specific interpretation

`App.tsx` picks `HashRouter` or `BrowserRouter` at runtime via
`configuredRouterMode` (`src/config/routerMode.ts`, driven by
`VITE_ROUTER_MODE`). GitHub Pages builds force hash mode
(`build:pages` sets `VITE_ROUTER_MODE=hash`) because there is no
server-side rewrite available on Pages. Route nesting is: public routes
(`/`, `/login`, `/about`, `/privacy`, `/terms`) → `GuestRoute`-wrapped auth
routes (`/auth/login`, `/auth/register`, `/auth/forgot-password`) → always
reachable auth callback/error/verify/reset routes → `ProtectedRoute` wrapping
`AppLayout`, which holds every learner-data route → nested `AuthenticatedRoute`
(account/security, account/migration) and `AdminRoute` (admin/*) guards
inside the protected shell → a catch-all `NotFoundPage`.

Concrete catalog paths are ordered before parameterized detail paths, e.g.
`agents/catalog` and `agents/new` appear before `agents/:agentId` — this
ordering is load-bearing, not incidental, because React Router matches
top-down.

## Constraints

- Any new learner-data route belongs inside the `ProtectedRoute` /
  `AppLayout` block; do not add a data-bearing route outside it.
- Place new concrete-segment routes (e.g. `/prompts/packs`) before any
  sibling parameterized route (e.g. `/prompts/:promptId`) at the same path
  depth, matching the existing `agents`/`prompts` pattern.
- New secondary pages should follow the existing `lazy()` +
  `<Suspense fallback={null}>` pattern already used for most non-shell pages.
- Navigation link text must come from `LanguageContext` translations, never
  hard-coded strings (see `.agent/knowledge/i18n.md`).

## Known limitations

- The catch-all `NotFoundPage` is direction-neutral but does not
  differentiate "route doesn't exist" from "route exists but you're not
  authorized" — both resolve to the same 404-style page by design (security
  architecture: unknown routes must not leak protected-route existence).
- Router mode is a single global switch (hash vs. browser); there is no
  per-route override.

## Current implementation status

Shipped: full nested guard structure (`ProtectedRoute`, `GuestRoute`,
`AuthenticatedRoute`, `AdminRoute`), hash-router support for GitHub Pages,
lazy-loaded secondary/detail pages. Matches
`.codex/architecture/routing.md`'s "Future evolution" list — the routes it
named as planned (`/playground/*`, `/runs`, `/journey`, `/roadmap`) are now
present in `App.tsx`, i.e. that future work has since shipped.
