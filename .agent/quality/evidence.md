# Evidence

## Purpose

Quality evidence proves which exact source commit was tested without creating a
later evidence-only commit. Source code, workflows, schemas, policies, tests, and
reviewed baselines are tracked; run output is not.

## Local execution

`node scripts/run-quality-evidence.mjs <profile>` is exposed through
`quality:evidence:fast`, `:full`, `:pages`, and `:headed`. Each real command is
executed and its exit code, sanitized output, timestamps, coverage, Git state,
manual-review state, and recommendation are written below:

`quality/runtime/execution/`

The directory is ignored. A run writes `runs/<RUN_ID>/`, refreshes
`latest/`, and updates the runtime-only `index.json`. Running evidence must not
change `git status --short`.

The exact tested identity is `GITHUB_SHA` in CI and `git rev-parse HEAD`
locally. If CI's checkout differs from `GITHUB_SHA`, the run fails. There is no
active `evidenceCommit`, finalizing commit, or `pendingPostEvidenceCommit`
terminal state. `quality:evidence:finalize` remains only as a non-mutating
compatibility check.

## CI evidence

Every mandatory CI job writes a manifest under
`quality/runtime/ci/<job>/manifest.json` and uploads it with that job's artifacts.
The manifest records repository, workflow, run ID, run attempt, exact head SHA,
source/target branch, event, timestamp, job conclusion, Node/npm versions,
relative content paths, and a SHA-256 digest. Logs, coverage, Playwright media,
Lighthouse reports, visual actual/diff files, and aggregate summaries remain
GitHub Actions artifacts; CI never writes them back to Git.

The aggregate `quality-summary` job uses `if: always()`, depends on every
mandatory producer, records each `needs` result in Markdown and JSON, uploads the
summary, and fails unless every producer succeeded.

## Integrity

`npm run quality:evidence:integrity` validates runtime schema shape, exact SHA,
required identity, clean test state, required outputs, redaction, and internal
consistency. CI manifest validation additionally checks workflow/run identity,
job name, and content digest. Historical committed evidence can be read as
history, but it cannot authorize a current release.

## Release readiness

`npm run release:main-ready` resolves the exact current HEAD and branch, requires
a clean tree, queries GitHub's REST API for the canonical CI run at that exact
SHA, and requires `success` for the run and all stable mandatory job names.
Missing, stale, queued, in-progress, skipped, cancelled, neutral,
action-required, timed-out, or failed state blocks. Network/API failure is
unverified and blocks. Prior committed evidence is never a fallback.

## Manual ownership

Visual baseline approval, UX/security/content judgment, PR review, protected
environment approval, and branch protection remain external human controls.
Automation never promotes them. The manual Linux workflow generates candidates
and artifacts only; it cannot commit, push, open a PR, merge, or update main.

## Redaction

All stored logs and metadata replace workspace/home paths, authorization values,
tokens, credential-like assignments, JWTs, Supabase keys, and email addresses.
Raw environment variables and authentication values are never serialized.
