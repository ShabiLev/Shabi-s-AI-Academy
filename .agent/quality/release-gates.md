# Release Gates

## Purpose

Which real npm scripts/checks must be green — or explicitly and visibly
waived with a documented reason — before a release is considered "ready."
Cross-references `validate:release`'s exact command chain from
`package.json`. See also
[`../release/release-checklist.md`](../release/release-checklist.md),
[`test-selection.md`](test-selection.md), [`evidence.md`](evidence.md), and
[`manual-review.md`](manual-review.md).

## The authoritative automated chain: `validate:release`

`package.json`'s `validate:release` script is the exact, ordered command
chain that defines automated release readiness:

```
npm run lint
npm run test:run
npm run test:coverage
npm run build
npm run catalog:check
npm run docs:check
npm run quality:inventory
npm run test:e2e:full
npm run test:journeys
npm run test:ux
npm run test:a11y
npm run test:visual
npm run test:performance
npm run quality:collect
npm run quality:analyze
npm run quality:system-report
npm run test:e2e:pages
git diff --check
```

Because `&&` chains these, the first failing command stops the chain — so
a `validate:release` failure log shows only up to the first failure, not
every downstream check. Running the equivalent evidence profile
(`npm run quality:evidence:full`) is preferable when preparing a release
report, because it runs every command independently (failures don't hide
downstream results) and produces the persistent, sanitized evidence trail
under `quality/runtime/execution/latest/` — see [`evidence.md`](evidence.md). Note
that the `full` evidence profile's own command list is a superset that also
includes `test:release-candidate`, `test:release-candidate:pages`, and
`validate:release` itself as one of its steps (see
`scripts/run-quality-evidence.mjs`), so `npm run quality:evidence:full` is
the single command that captures everything `validate:release` covers plus
more, with evidence.

## Gate checklist for "ready"

Each row must be **green**, or **explicitly and visibly waived** in the
release report with a stated reason (never silently skipped):

| Gate | Command(s) | Source |
| --- | --- | --- |
| Lint | `npm run lint` | `validate:release` step 1 |
| Unit tests | `npm run test:run` | `validate:release` step 2 |
| Coverage | `npm run test:coverage` (thresholds in `quality/config/coverageThresholds.cjs`) | `validate:release` step 3 — see [`coverage.md`](coverage.md); this gate may never be waived by lowering the threshold, only by an explicit, separately authorized exception |
| Build | `npm run build` | `validate:release` step 4 |
| Prompt catalog | `npm run catalog:check` | `validate:release` step 5 |
| Docs | `npm run docs:check` | `validate:release` step 6 |
| Quality inventory | `npm run quality:inventory` | `validate:release` step 7 |
| Full E2E | `npm run test:e2e:full` | `validate:release` step 8 |
| Journeys | `npm run test:journeys` | `validate:release` step 9 |
| UX | `npm run test:ux` | `validate:release` step 10 |
| Accessibility | `npm run test:a11y` | `validate:release` step 11 — see [`accessibility.md`](accessibility.md) |
| Visual regression | `npm run test:visual` | `validate:release` step 12 — see [`visual-regression.md`](visual-regression.md) |
| Performance | `npm run test:performance` | `validate:release` step 13 — see [`performance.md`](performance.md) |
| Quality collection/analysis | `npm run quality:collect`, `npm run quality:analyze` | `validate:release` steps 14–15 — `quality:analyze` exits non-zero if status is Blocked |
| System quality report | `npm run quality:system-report` | `validate:release` step 16 |
| GitHub Pages E2E | `npm run test:e2e:pages` | `validate:release` step 17 |
| Clean diff | `git diff --check` | `validate:release` step 18 — catches whitespace/conflict-marker issues |
| Manual UX review | human sign-off in `quality/checklists/manual-ux-review.json` | never automatable — see [`manual-review.md`](manual-review.md) |
| Manual security review | human sign-off in `quality/checklists/manual-security-review.json` | never automatable |
| Manual content review | human sign-off in `quality/checklists/manual-content-review.json` | never automatable |

## What "ready" means in evidence terms

Per `deriveRecommendation()` (see [`evidence.md`](evidence.md)):

- **`Blocked`** — at least one blocker command failed, a manual gate is
  `failed`, or coverage failed. A release must not proceed while `Blocked`.
- **`Ready with warnings`** — every automated blocker gate passed on a
  `full` evidence run, but one or more manual gates are still `notRun`.
  This is the ceiling automation can reach on its own; a human must still
  close out the manual gates before the release is truly ready.
- **`Ready`** — every automated gate passed and all three manual gates are
  `passed`. This is the only state that should be reported as "release
  ready" without qualification.

`quality/README.md` documents the same cap independently for the collected
report: `analyze-quality-results.mjs`'s `overallStatus` is deliberately
capped at **Ready with warnings** because a CI/CLI process cannot know
whether a human completed the manual release checklist.

## Waiving a gate

If a gate must be knowingly skipped for a specific release (e.g. a known
flaky suite, an accepted visual diff, a deferred performance regression):

1. Record it as `notRun`/`notAvailable`/`failed` honestly in the evidence —
   never edit evidence output to hide it.
2. State the waiver and its reason explicitly in the release report (see
   [`../release/release-report.md`](../release/release-report.md)).
3. Get the waiver itself authorized by the user in the current session —
   this follows the same stop-and-ask rule as any Critical-risk decision
   (`.agent/master.md` §9).

A real observed run on this branch shows exactly this kind of unresolved
state: `build`, `build:pages`, `test:e2e`, `test:e2e:full`, `test:visual`,
`test:performance`, `test:release-candidate`, `test:release-candidate:pages`,
and `validate:release` all failed, with recommendation `Blocked`
(`quality/runtime/execution/latest/summary.md`) — that run is not release-ready,
and no amount of documentation should present it as such.
