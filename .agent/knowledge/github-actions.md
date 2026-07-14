# GitHub Actions

## Purpose

Describe what CI actually runs today so an agent's evidence claims match
reality and heavy artifacts are handled the way CI already handles them.

## Authoritative source(s)

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-pages.yml`
- `.agent/quality/evidence.md` (evidence-file conventions this file does not
  duplicate)

## Project-specific interpretation

`ci.yml` runs on push/PR to `main` as five parallel jobs —
`quality-core` (lint, `test:coverage`, build), `e2e` (`test:e2e:full`),
`accessibility` (`test:a11y`), `visual` (`test:visual`), `performance`
(`test:performance`) — each uploading its own artifacts, followed by a
`quality-summary` job that downloads all of them and runs
`quality:collect`/`quality:analyze`. A separate `regenerate-visual-baselines`
job exists only for manual `workflow_dispatch` runs; it never runs on
push/PR and never commits anything itself — a human must download the
artifact, review every changed image, and commit intentionally. Heavy
outputs (`coverage/`, Playwright reports, Lighthouse output) are uploaded as
GitHub Actions artifacts with a retention window, not committed to the
repo — this is the existing "heavy-artifact-as-CI-artifact" pattern the AOS
evidence system should defer to rather than re-implement.

## Constraints

- Do not add a workflow step that commits generated output (coverage,
  screenshots, reports) back into the repository from CI.
- Do not make `regenerate-visual-baselines` trigger automatically on
  push/PR — it must stay `workflow_dispatch`-only per the existing comment
  in `ci.yml`.
- Any new CI job that needs Supabase should use the same
  `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` secrets pattern already used
  in `deploy-pages.yml` — never a service-role key.

## Known limitations

- `quality-summary` uses `continue-on-error: true` on each artifact download,
  so a missing upstream job artifact degrades the summary rather than
  failing CI outright — this is intentional but means a silently-skipped
  job can still let `quality-summary` "succeed."
- There is no scheduled/nightly workflow; all jobs are push/PR/manual
  triggered only.

## Current implementation status

Shipped: the five-job quality pipeline plus rollup, described above,
matches what's on disk today. No self-hosted runners, no matrix builds
across OS/Node versions — everything runs on a single
`ubuntu-latest` + Node 20.19.0 configuration.
