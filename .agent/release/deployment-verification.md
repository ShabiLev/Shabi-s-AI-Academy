# Deployment Verification

## Purpose

Post-deploy checks for GitHub Pages builds, so a deployment is confirmed
working, not just assumed working because the build succeeded.

## Rules

- Build with the Pages-specific script: `npm run build:pages`, which sets
  `VITE_BASE_PATH=/Shabi-s-AI-Academy/`, `VITE_ROUTER_MODE=hash`,
  `VITE_DEPLOYMENT_PROVIDER=github-pages`, and
  `VITE_PUBLIC_SITE_URL=https://shabilev.github.io/Shabi-s-AI-Academy`,
  then runs `node scripts/validate-pages-build.mjs` — this validation
  script must actually run and pass, not be skipped because "the regular
  build already passed."
- Run `npm run test:e2e:pages` (Playwright against the Pages
  configuration, `playwright.pages.config.ts`) to confirm routing/base-path
  behavior works under the hash-router/Pages-base-path combination, which
  differs from the dev/default configuration.
- `npm run preview:pages` can be used locally to sanity-check the built
  Pages output before/after deployment using the same base path and router
  mode as production.
- After the real deployment (GitHub Actions / Pages publish, outside this
  repo's local scripts), confirm the live URL loads, core routes resolve
  under the hash router, and there is no base-path-related asset 404 —
  this is a manual check and must be recorded as such, not implied by CI
  green alone, per [`../quality/manual-review.md`](../quality/manual-review.md).
- Any deployment-verification failure is a stop condition for calling the
  release **released** — see [`release-policy.md`](release-policy.md) and
  [`rollback.md`](rollback.md) if a bad deploy already went out.

## Related

[`../workflow/deployment.md`](../workflow/deployment.md),
[`../knowledge/github-pages.md`](../knowledge/github-pages.md),
[`rollback.md`](rollback.md).
