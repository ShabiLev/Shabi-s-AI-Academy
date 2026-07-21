# Reporting

## Purpose

How evidence results roll up into `summary.md` / `summary.json` and how an
agent should present them in a final report or dashboard context. See also
[`evidence.md`](evidence.md), [`release-gates.md`](release-gates.md), and
[`../workflow/final-report.md`](../workflow/final-report.md).

## The roll-up chain

1. **Per command** — `scripts/run-quality-evidence.mjs` records one result
   object per executed command (id, label, command string, criticality,
   timestamps, duration, exit code, parsed result/failure counts, warning
   count, summary sentence, log path). Written incrementally to
   `commands.json` in the run directory.
2. **Per area** — `statusFor()` groups related command ids into named rows:
   `Docs`, `Lint`, `Unit tests`, `Coverage`, `Build`, `GitHub Pages build`,
   `E2E`, `Journeys`, `UX`, `Accessibility`, `Visual`, `Performance`,
   `Release validation`, `Git diff`. A group's status is `failed` if any
   member failed, `notRunDueToDependency` if any member was skipped for
   that reason (and none failed), else `passed`. This is the table rendered
   as `## Results` in `summary.md` and as the `results` object in
   `summary.json`.
3. **Coverage** — `summarizeCoverage()` produces the `## Coverage` table
   (statements/branches/functions/lines x percent/threshold/delta/passed).
4. **Manual gates** — the three `quality/checklists/manual-*.json` records
   are surfaced verbatim (read-only) in the `## Findings` /
   `manualReviewRequired` fields and in `manual-review.md`.
5. **Recommendation** — `deriveRecommendation()` reduces all of the above to
   one of `Blocked` / `Not fully evaluated` / `Ready with warnings` /
   `Ready` (see [`evidence.md`](evidence.md) for exact semantics).

## `summary.md` structure (as actually generated)

`markdownSummary()` in `scripts/run-quality-evidence.mjs` always emits these
sections, in this order: `## Identity` (run id, time window, app version,
branch, starting/final commit, agent label, OS, Node/npm versions),
`## Scope` (requested task, implemented changes, pointer to
`changed-files.txt`, explicit "Data migrations: None" unless stated
otherwise), `## Results` (the per-area table above), `## Coverage`,
`## Findings` (critical/high/medium/low counts, warning count, manual
review required Yes/No), `## Git` (branch, main/remote relationship,
commits created, working-tree status, pointer to `latest/README.md` for
sync commands), and `## Recommendation`. Use this exact structure as the
template for any AOS-authored summary of a quality run — do not invent a
different shape.

## `README.md` as the human entry point

`quality/runtime/execution/latest/README.md` is written directly (not copied from
the run directory) and is the fastest way to answer "what happened in the
last run": occurrence window, branch, commit tested, profile, the full list
of commands run/passed/failed, where heavy local artifacts live, an
explicit "Safe to commit: Yes/No" line, pending manual reviews, and a
`## Synchronization (not executed)` block of `git` commands that are shown
for reference only — never auto-executed (see
[`../git/synchronization.md`](../git/synchronization.md)).

## Rules for presenting evidence results

1. **Quote real numbers.** When describing a run's outcome, pull the actual
   counts/status from `summary.json` or `summary.md` — never approximate or
   remember them from an earlier run.
2. **Never upgrade a status.** If `summary.json` says `Ready with
   warnings`, present it as `Ready with warnings`, not `Ready`. If a manual
   gate is `notRun`, say so.
3. **Point to logs, don't re-paraphrase failures from memory.** `failures.md`
   already lists each failed command with its log path — link to it rather
   than re-describing what a failure log said from recollection.
4. **Distinguish `latest/` from `runs/<RUN_ID>/`.** Only `latest/` is
   committed and lightweight; anything requiring the full log or a
   screenshot lives in the (gitignored) run directory — see
   [`evidence.md`](evidence.md)'s gap note for exactly which files that
   currently means (`environment.json`, `commands.json`,
   `git-state-before.txt`, `git-state-after.txt`, plus every `*.log` and
   heavy artifact).
5. **`index.json` is the historical record.** `quality/execution/index.json`
   holds up to 20 bounded, newest-first entries
   (`runId`, `date`, `branch`, `commit`, `version`, `overallStatus`,
   `coverageSummary`, `reportPath`, `localRunPath`, `failedCommands`,
   `warningCount`). Use it to answer "how has this trended over the last N
   runs" without re-reading every individual run directory.

## Relationship to the system-wide quality artifact

`npm run quality:system-report` (`quality/scripts/generate-quality-artifacts.mjs`
+ `quality/scripts/generate-system-quality-report.mjs`) and
`npm run quality:report` (the `collect` -> `analyze` -> `system-report`
chain) produce a separate, broader artifact
(`quality/generated/latest-quality-report.json`, also mirrored to
`public/generated/` for the running app's own QA Center view — see
`quality/README.md`). That pipeline is the **application-facing** quality
dashboard; `quality/execution/` is the **agent-evidence** trail proving a
specific task's commands were actually run. They read some of the same
underlying artifacts (e.g. `coverage/coverage-summary.json`) but are
separate systems with separate outputs — do not conflate the two.
