# Deployment

## Purpose

Define the GitHub Pages build and verification steps and the stop
conditions before a deployment-affecting change is considered ready. This
project deploys as a static site via GitHub Pages using a hash router and a
non-root base path — that constraint drives every action below.

## When to load

Load for `deployment` and `release` task types, and for any `feature`/
`bugfix` change that touches `vite.config`, routing mode, or environment
variables consumed by the `build:pages` script.

## Prerequisites

- The change builds successfully with the default (non-Pages) config:
  `npm run build`.
- [`../knowledge/github-pages.md`](../knowledge/github-pages.md) has been
  read for the base-path/hash-router constraints specific to this repo.

## Required actions

1. Build the Pages variant: `npm run build:pages`, which sets
   `VITE_BASE_PATH=/Shabi-s-AI-Academy/`, `VITE_ROUTER_MODE=hash`,
   `VITE_DEPLOYMENT_PROVIDER=github-pages`, and
   `VITE_PUBLIC_SITE_URL=https://shabilev.github.io/Shabi-s-AI-Academy`,
   then runs `scripts/validate-pages-build.mjs` to check the output.
2. Preview it locally with `npm run preview:pages` before trusting the
   build output, especially for routing or asset-path changes.
3. Run `npm run test:e2e:pages` (Playwright against
   `playwright.pages.config.ts`) to verify navigation works under the
   hash-router/base-path configuration, not just the dev-server config.
4. For a release-scale deployment check, run
   `npm run test:release-candidate:pages`, which chains
   `build:pages` → `quality:inventory` → `test:e2e:pages` →
   `quality:system-report`.
5. Capture deployment evidence with `npm run quality:evidence:pages`, which
   runs the `build-pages` and `e2e-pages` command profile in
   `scripts/run-quality-evidence.mjs`.
6. Cross-check post-deploy verification steps in
   [`../release/deployment-verification.md`](../release/deployment-verification.md)
   once the build is actually published (a step this module does not
   perform itself — see Prohibited actions).

## Prohibited actions

- Publishing to GitHub Pages, merging to `main`, or triggering the deploy
  workflow without explicit user authorization in the current session — see
  [`../git/git-policy.md`](../git/git-policy.md) and `master.md` §7.
- Assuming the default `npm run build` output is deployable to Pages — the
  base path and router mode differ and must be verified with the `:pages`
  variants specifically.
- Committing generated `dist/` or Lighthouse/Playwright artifacts from a
  Pages build — these are transient per
  [`.codex/standards/qa.md`](../../.codex/standards/qa.md) unless
  intentionally version-controlled as a reviewed baseline.
- Skipping `scripts/validate-pages-build.mjs` because the default build
  already passed.

## Deliverables

- A passing `npm run build:pages` and `npm run test:e2e:pages` run.
- Evidence captured under `quality/runtime/execution/latest/` via
  `npm run quality:evidence:pages`.

## Evidence requirements

See [`../quality/evidence.md`](../quality/evidence.md) for the exact files
updated by the `pages` profile. Record `build-pages.log` and
`e2e-pages.log` results faithfully — a failing Pages build is a blocker for
`deployment`/`release` task types, never a warning.

## Exit criteria

`npm run build:pages`, `scripts/validate-pages-build.mjs`, and
`npm run test:e2e:pages` all pass, evidence is captured, and no push/merge
to the deployment branch has occurred without explicit authorization.
