# The evidence system

How AOS proves a task was actually tested — not claimed, actually tested —
using the real, already-implemented evidence runner
(`scripts/run-quality-evidence.mjs`) and the policy that governs it,
[`../../.agent/quality/evidence.md`](../../.agent/quality/evidence.md). See
also [`../quality-gates.md`](../quality-gates.md) for the release-status
rules this evidence feeds.

## Running it

```
npm run quality:evidence          # defaults to "fast"
npm run quality:evidence:fast     # docs:check, test:evidence, lint, test:run, build
npm run quality:evidence:full     # the entire release-candidate chain, ending in validate:release
npm run quality:evidence:pages    # build:pages, then test:e2e:pages
npm run quality:evidence:headed   # test:journeys:headed, marked as a manual run
```

Every command runs for real via a child process; nothing is inferred or
fabricated. A command with a failed dependency is recorded as
`notRunDueToDependency`, never as `passed`. A command that does not exist
in this repository's `package.json` must be recorded as `notAvailable`,
never `passed` — this is a hard rule from
[`../../.agent/master.md`](../../.agent/master.md) §6.

## What gets written

Each run creates `quality/runtime/execution/runs/<RUN_ID>/` (gitignored — heavy
Playwright artifacts, full logs, and raw coverage live here or become CI
artifacts) and then updates the ignored runtime pointer
`quality/runtime/execution/latest/` with `README.md`, `summary.md`, `summary.json`,
`coverage-summary.json`, `failures.md`, `warnings.md`, `manual-review.md`,
`self-review.md`, and `changed-files.txt`. See `evidence.md` for the exact
per-file breakdown, including a documented gap: `environment.json`,
`commands.json`, and the git-state snapshots are copied into the runtime
`latest/` directory. In CI the corresponding output and exact-SHA provenance
manifest are uploaded as GitHub Actions artifacts and never committed.

## Redaction

All captured output passes through a redaction step before being written —
absolute paths, bearer tokens, API keys, JWTs, Supabase keys, email
addresses, and home-directory paths are stripped or replaced. See
[`security.md`](security.md) and
[`../../.agent/security/logging.md`](../../.agent/security/logging.md).

## Recommendation semantics

`deriveRecommendation()` returns `Blocked` (a blocker command or manual
review failed, or coverage missed threshold), `Not fully evaluated` (any
profile other than `full`), `Ready with warnings` (`full` profile, no
blocking failures, but a manual review is still pending), or `Ready`
(`full` profile, no blocking failures, all three manual reviews passed).

## Manual reviews stay manual

`manualUxReview`, `manualSecurityReview`, and `manualContentReview` can only
be set by a human — automation never promotes them to `passed`. This is the
same rule stated in [`../quality-gates.md`](../quality-gates.md)'s manual
checklist row and enforced by `manual-review.md`'s ending line: "Automation
does not promote manual review statuses."

## Where to look

The generated evidence is browsable at `/aos/evidence`. `npm run aos:check`
now includes evidence-adjacent validation as part of the mandatory command
set — see [`../testing.md`](../testing.md) and
[`../../.agent/quality/quality-policy.md`](../../.agent/quality/quality-policy.md)
for how this composes with the pre-existing Vitest/Playwright/Lighthouse
tooling.
