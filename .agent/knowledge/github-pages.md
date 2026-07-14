# GitHub Pages

## Purpose

Capture the exact build/deploy configuration for the Pages target so an
agent doesn't guess base-path or router settings.

## Authoritative source(s)

- `.github/workflows/deploy-pages.yml`
- `package.json` (`build:pages`, `preview:pages`, `test:e2e:pages`,
  `test:release-candidate:pages` scripts)
- `.agent/workflow/deployment.md`, `.agent/release/deployment-verification.md`

## Project-specific interpretation

`deploy-pages.yml` builds on push to `main` with
`VITE_BASE_PATH=/Shabi-s-AI-Academy/`, `VITE_ROUTER_MODE=hash`,
`VITE_DEPLOYMENT_PROVIDER=github-pages`, and
`VITE_PUBLIC_SITE_URL=https://shabilev.github.io/Shabi-s-AI-Academy`, plus
the `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` repo secrets, then runs
`docs:check`, `lint`, `test:run`, `build`,
`scripts/validate-pages-build.mjs`, and deploys `dist/` via
`actions/deploy-pages`. Locally, `npm run build:pages` reproduces the same
env vars and additionally runs `validate-pages-build.mjs` itself;
`npm run preview:pages` serves that build for manual spot-checks;
`npm run test:e2e:pages` runs Playwright against it via
`playwright.pages.config.ts`.

The hash router is not cosmetic — it is required because GitHub Pages has no
server-side rewrite rule to fall back deep links to `index.html`, so
`BrowserRouter` deep links would 404 there.

## Constraints

- Never change the Pages base path without also updating
  `VITE_PUBLIC_SITE_URL` and re-validating with
  `scripts/validate-pages-build.mjs`.
- Never switch the Pages build to `BrowserRouter` mode; it will break deep
  links on Pages hosting.
- Supabase secrets reaching this build must remain the public anon key only
  — never the service-role key — consistent with ADR-009/ADR-011.

## Known limitations

- `deploy-pages.yml` does not run the full quality gate (`test:a11y`,
  `test:visual`, `test:performance`) before deploying — only lint, unit
  tests, and the build/validate step. `test:release-candidate:pages`
  exists as the heavier, manually-invoked check for a real release.
- Deployment is `main`-only and auto-triggered on push; there is no staging
  environment for Pages.

## Current implementation status

Shipped: full CI-driven Pages deploy with base-path/hash-router
configuration and a dedicated validation script. Deployment verification
beyond a successful CI run (e.g. post-deploy smoke checks) is described in
`.agent/release/deployment-verification.md` and is a manual/AOS-driven step,
not an automated post-deploy job in `deploy-pages.yml` itself.
