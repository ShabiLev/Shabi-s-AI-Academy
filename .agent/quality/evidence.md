# Evidence

## Purpose

Documents the **real, already-implemented** evidence system — the mechanism
AOS uses to prove a task was actually tested, not a hypothetical one. The
evidence system is `scripts/run-quality-evidence.mjs` (plus its helpers in
`scripts/evidence-utils.mjs`) writing into `quality/execution/`. This file
describes that script's actual behavior as observed in the code and in a
real generated run, and calls out where the current output does not yet
match what a complete evidence record should contain. See also
[`../workflow/testing.md`](../workflow/testing.md),
[`test-selection.md`](test-selection.md), and
[`reporting.md`](reporting.md) for how these results roll up.

## What runs the evidence

`node scripts/run-quality-evidence.mjs <profile>`, invoked via:

- `npm run quality:evidence` (defaults to `fast`)
- `npm run quality:evidence:fast`
- `npm run quality:evidence:full`
- `npm run quality:evidence:pages`
- `npm run quality:evidence:headed`

Profiles map to fixed command lists in `scripts/run-quality-evidence.mjs`:

- **`fast`** — `docs:check`, `test:evidence`, `lint`, `test:run`, `build`.
- **`pages`** — `build:pages`, then `test:e2e:pages` (depends on `build:pages`).
- **`headed`** — `test:journeys:headed` only, marked `criticality: "manual"`.
- **`full`** — the entire release-candidate chain: `docs:check`,
  `test:evidence`, `lint`, `test:run`, `test:coverage`, `build`,
  `build:pages`, `catalog:check`, `test:e2e`, `test:e2e:full`,
  `test:e2e:pages` (depends on `build:pages`), `test:journeys`,
  `test:click-audit`, `test:route-crawl`, `test:forms`, `test:overlays`,
  `test:responsive:interactions`, `test:keyboard`, `test:copy`,
  `test:errors`, `test:ux`, `test:a11y`, `test:visual`, `test:performance`,
  `test:release-candidate`, `test:release-candidate:pages`,
  `quality:collect`, `quality:analyze` (depends on `quality:collect`),
  `quality:system-report` (depends on `quality:collect`),
  `validate:release`, and `git diff --check`.

Every command is executed for real via `child_process.spawn` (or
`spawnSync` for short git/npm version lookups) — nothing is inferred or
fabricated. `full` first deletes `coverage/`, `playwright-report/`,
`test-results/`, `quality/generated/`, and `public/generated/` so results
cannot be stale carry-over from a previous run.

## Commands that don't exist / dependency handling

- Commands with a `dependsOn` whose dependency did not pass are recorded
  with `status: "notRunDueToDependency"` and are never marked `passed`
  (e.g. `test:e2e:pages` when `build:pages` fails — observed directly in a
  real run: see Real observed run below).
- A command that genuinely does not exist in this repository must never be
  invented or silently treated as passing. `run-quality-evidence.mjs` only
  ever calls scripts that exist in `package.json`; if a future profile adds
  a script name that is missing, npm itself will fail non-zero and that
  command is recorded `failed`, not `passed`. Any AOS-authored evidence
  step (manual or scripted) that references a command outside this repo's
  `package.json` must record `notAvailable`, never `passed` — this is a
  hard rule from `.agent/master.md` §6.

## What gets written per run

Each invocation creates `quality/execution/runs/<RUN_ID>/` where
`RUN_ID` = `<local-timestamp>_<branch-slug>-<short-sha>`. Inside that
directory, `run-quality-evidence.mjs` writes, in order:

1. `git-state-before.txt` — `git status --short --branch`, `git branch
   --show-current`, `git remote -v`, `git log --oneline --decorate -10`,
   captured before any command runs.
2. `environment.json` — run id, profile, agent label (`"Codex"` — see gap
   note below), OS, Node/npm versions, branch, starting commit, app
   version, start time.
3. One `<command>.log` file per command (e.g. `lint.log`,
   `unit-tests.log`, `e2e-full.log`) containing sanitized stdout/stderr.
4. `commands.json` — the full array of per-command result objects
   (`id`, `label`, `command`, `criticality`, timestamps, `durationMs`,
   `exitCode`, `resultCount`, `failureCount`, `warningCount`, `summary`,
   `logPath`), written incrementally after each command so a crash mid-run
   still leaves partial evidence on disk.
5. Heavy artifacts (only for `full`/`headed` profiles) — Playwright
   `test-results/` (screenshots, videos, traces, visual diffs sorted into
   subfolders), `playwright-report/`, `coverage/`, and
   `quality/generated/` are copied into the run directory.
6. `summary.json` — the structured, schema-versioned run summary (identity,
   scope, per-area rollup results, coverage, manual review states,
   findings, git relationship info, recommendation, failed commands list).
7. `summary.md` — a human-readable Markdown rendering of `summary.json`.
8. `test-results.json` — `{ profile, commands, results }` (the raw command
   list plus the per-area rollup).
9. `coverage-summary.json` — either `summarizeCoverage()`'s output (percent,
   threshold, delta, passed per metric) when `test:coverage` ran, or
   `{ status: "notAvailable", thresholds: coverageThresholds }` when it did
   not.
10. `changed-files.txt` — `git diff --name-status <startingCommit>` plus
    `git ls-files --others --exclude-standard`.
11. `failures.md` — one bullet per failed command with its log path, or an
    explicit "No command failures were recorded." line.
12. `warnings.md` — pending manual reviews, commands that emitted warning
    lines, and commands skipped due to a failed dependency, or an explicit
    "No warnings were recorded." line.
13. `manual-review.md` — a table of the three manual gates
    (`manualUxReview`, `manualSecurityReview`, `manualContentReview`) with
    status/reviewer/timestamp/warnings, ending in "Automation does not
    promote manual review statuses."
14. `self-review.md` — currently always a static placeholder
    (`Status: notRun`) reminding the agent to complete the structured
    self-review before committing; see [`../workflow/self-review.md`](../workflow/self-review.md).
15. `git-state-after.txt` — the same git-state snapshot as step 1, taken
    after all commands ran.

`quality/execution/index.json` is then updated with a bounded (max 20,
newest-first) index entry per run (`boundedRunIndex` in
`scripts/evidence-utils.mjs`), and `quality/execution/latest/` is deleted
and rewritten as a lightweight pointer to the just-completed run.

## Required evidence files under `quality/execution/latest/`

The following files are the complete evidence record AOS requires for a
substantial task, per `.agent/master.md` §6. **Not all of them are
currently copied into `latest/` by `run-quality-evidence.mjs` today** — the
gap is called out explicitly per file:

| File | Present in `quality/execution/latest/` today? |
| --- | --- |
| `README.md` | Yes — generated directly into `latest/` (not copied from the run directory) with occurrence window, branch, commit, profile, commands run/passed/failed, heavy-artifact location, "safe to commit" note, and pending manual reviews. |
| `summary.md` | Yes — copied from the run directory. |
| `summary.json` | Yes — copied from the run directory. |
| `environment.json` | **No.** `run-quality-evidence.mjs` writes this file into `quality/execution/runs/<RUN_ID>/environment.json`, but the `latest/` copy loop (`for (const file of [...])` in `main()`) does not include it. As of this writing, `environment.json` does not exist under `quality/execution/latest/` — only under the per-run archive. See AOS gap note below. |
| `commands.json` | **No**, for the same reason — written to `quality/execution/runs/<RUN_ID>/commands.json` only, not copied to `latest/`. |
| `coverage-summary.json` | Yes — copied from the run directory (or the `notAvailable` fallback object if coverage did not run). |
| `failures.md` | Yes — copied from the run directory. |
| `warnings.md` | Yes — copied from the run directory. |
| `manual-review.md` | Yes — copied from the run directory. |
| `self-review.md` | Yes — copied from the run directory (currently always the static placeholder; see [`../workflow/self-review.md`](../workflow/self-review.md) for the actual checklist an agent must run before this can honestly say `passed`). |
| `changed-files.txt` | Yes — copied from the run directory. |
| `git-state-before.txt` | **No.** Written to `quality/execution/runs/<RUN_ID>/git-state-before.txt` only; not copied to `latest/`. |
| `git-state-after.txt` | **No.** Same as above — run-directory only. |

Confirmed by direct inspection of a real generated run
(`quality/execution/latest/` on branch `test/1.3.0-quality-evidence`,
run id `2026-07-14_15-16-35_test-1-3-0-quality-evidence`): `latest/`
contained exactly `README.md`, `summary.md`, `summary.json`,
`coverage-summary.json`, `failures.md`, `warnings.md`, `manual-review.md`,
`self-review.md`, `changed-files.txt` — nine files, matching the "Yes" rows
above and none of the "No" rows.

### AOS gap note

`environment.json`, `commands.json`, `git-state-before.txt`, and
`git-state-after.txt` are produced by `run-quality-evidence.mjs` (they are
real, not invented), but they currently live only under
`quality/execution/runs/<RUN_ID>/`, which is gitignored
(`quality/execution/runs/` in `.gitignore`). A reviewer who only looks at
the committed `quality/execution/latest/` directory today cannot see the
environment fingerprint, the per-command JSON detail, or the before/after
git snapshots — only the Markdown/JSON summaries derived from them. Until
`scripts/run-quality-evidence.mjs`'s `latest/` copy loop is extended to
include these four files, treat `summary.json`'s `identity` block (which
does carry OS, Node/npm versions, branch, and commit) as the committed
substitute for `environment.json`, and `summary.md`'s `## Git` section as
the committed substitute for the git-state files. Do not fabricate
`environment.json`/`commands.json`/`git-state-*.txt` content by hand under
`latest/` to satisfy this table — extending the script is a code change
for the coordinating agent to schedule, not something to paper over in
documentation or by hand-writing those files.

## Redaction

All captured command output passes through `redactText()` in
`scripts/evidence-utils.mjs` before being written to any log or JSON file.
It replaces, in order: the absolute workspace path (all path-separator
variants) with `[WORKSPACE]`; any caller-supplied sensitive strings with
`[REDACTED]`; `Authorization: Bearer ...` headers; `password=`/`api_key=`/
`client_secret=`/token-like assignments; `?access_token=`/`?token=`-style
query strings; `Bearer <token>` headers; JWT-shaped strings; Supabase
`sb_secret_*`/`sb_publishable_*` keys; email addresses (`[REDACTED_EMAIL]`);
and Windows/Unix home-directory paths (`[REDACTED_HOME]`). The runner never
reads or serializes raw environment variables into evidence. See
[`../security/logging.md`](../security/logging.md) and
[`../security/secrets.md`](../security/secrets.md) for the security-policy
side of this same rule.

## Heavy artifacts stay local or become CI artifacts

`quality/execution/runs/` is listed in `.gitignore` — full per-command
logs, `test-results/` (screenshots, videos, traces, visual diffs), the
Playwright HTML report, raw `coverage/`, and `quality/generated/` copies
never get committed. In CI, these same directories should be uploaded as
build artifacts (for later inspection) rather than committed to the
repository. Only `quality/execution/latest/` — the lightweight, sanitized
summaries described above — is tracked in Git, and `quality/execution/index.json`
retains at most 20 run records total. This matches AOS master principle
§10.14 and `quality/README.md`'s "Persistent execution evidence" section.

## Recommendation semantics

`deriveRecommendation()` in `scripts/evidence-utils.mjs` returns:

- **`Blocked`** — any blocker-criticality command failed, any manual review
  failed, or coverage failed its thresholds.
- **`Not fully evaluated`** — profile was not `full` (i.e. `fast`, `pages`,
  or `headed` ran, which is necessarily a partial check).
- **`Ready with warnings`** — `full` profile, no blocking failures, but at
  least one manual review is not `passed`.
- **`Ready`** — `full` profile, no blocking failures, and all three manual
  reviews (`manualUxReview`, `manualSecurityReview`, `manualContentReview`)
  are `passed`.

A non-zero process exit code is set whenever the recommendation is
`Blocked`, so CI or a wrapping script can fail the build on this signal
alone.

## Known limitation observed in a real run

A real `full`-profile run on this branch (see `quality/execution/latest/`)
recorded `recommendation: "Blocked"` with `build`, `build:pages`,
`test:e2e`, `test:e2e:full`, `test:visual`, `test:performance`,
`test:release-candidate`, `test:release-candidate:pages`, and
`validate:release` all failed, alongside all three manual reviews still
`notRun`. This is exactly the intended behavior — the evidence system does
not soften a bad run into a passing one — but it means "Blocked" can appear
even from expected environment differences (e.g. a build failure on the
machine that generated the sample run). Do not treat a `Blocked`
recommendation as automatically actionable without reading the actual
`failures.md` and the referenced `.log` files first.
