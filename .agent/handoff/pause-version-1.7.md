# Handoff — Version 1.7.0-beta.3 paused for safe resume

Paused: 2026-07-28, after safe resume exposed a date-bound Radar release
blocker.

## Task

Complete, validate, merge, tag, deploy, and production-smoke-test the global
eight-step WALK ME and public bilingual Help Center release.

## Scope

In scope: WALK ME and Help Center implementation, regression and visual
validation, reviewed Linux baselines, PR #6, merge to `main`, tag
`v1.7.0-beta.3`, deployment, and production smoke. Retention logic, Radar feed,
and visual tolerances must remain unchanged.

## Branch

`feature/1.7.0-beta.3-walkthrough-help`

## Starting commit

`5d70d29d5e40d4b94e7beb4813abe1241ca1c94b` (`main`, tagged
`v1.7.0-beta.2`)

## Latest commit

`3c98c397ffd2fa836881f3f82f95964d89679074` (matches
`origin/feature/1.7.0-beta.3-walkthrough-help`; PR #6 is open).

## Files changed

Uncommitted and unstaged:

- `e2e/specs/first-visit-walkthrough.spec.ts` — now waits for English Help
  filters and the first article, so the public-route regression proves the
  route body loaded.
- `e2e/specs/visual.spec.ts` — waits for English Help content before desktop
  and mobile captures; restored the normal full-page screenshot assertion.
- `e2e/specs/__screenshots__/visual-chromium/visual.spec.ts/v17-help-center-en-desktop-win32.png`
  — regenerated after correct route synchronization; manual review pending.
- `e2e/specs/__screenshots__/visual-chromium/visual.spec.ts/v17-help-center-en-mobile-win32.png`
  — regenerated after correct route synchronization; manual review pending.

No staged or untracked files existed before this handoff file was created.

## Tests executed

Completed before the pause:

- Targeted Vitest: 24/24 passed.
- `App.test.tsx`: 23/23 passed.
- Full Vitest/coverage: 63 files, 355 tests passed; function coverage 70.07%.
- WALK ME E2E: 7/7 passed.
- Targeted E2E: 13/13 passed.
- Accessibility: 3/3 passed, including corrected turquoise-button contrast.
- Local Windows visual suite: all 68 scenarios passed twice with
  `PW_WORKERS=1`.
- `npm run validate:release`: passed all automated gates.
- `npm run quality:evidence:full`: passed on exact commit `50798d3`; result
  `readyWithWarnings` only because the manual checklist was not run.
- Reviewed Linux candidate workflow run `30276838410`: candidate generation
  passed 68/68 and determinism passed all 68 scenarios across 10 runs. Its
  candidate manifest records generated source SHA
  `3c98c397ffd2fa836881f3f82f95964d89679074`.
- `npm run test:e2e -- e2e/specs/first-visit-walkthrough.spec.ts --grep "public Help works"`:
  1/1 passed after adding route-body assertions.
- `PW_WORKERS=1 npm run test:visual -- --grep "Help Center WALK ME glossary and profile" --update-snapshots`:
  1/1 passed and regenerated the two English Windows Help baselines.
- The two regenerated English Windows baselines were manually inspected and
  contain the complete filters, task cards, resources, and WALK ME replay UI.
- `PW_WORKERS=1 npm run test:visual -- --grep "Help Center WALK ME glossary and profile"`:
  1/1 passed without update mode.
- `PW_WORKERS=1 npm run test:visual` was run twice after the synchronization
  correction: 68/68 passed, then 68/68 passed.
- `npm run validate:release`: documentation, AOS, evidence-unit checks,
  release-unit checks, memory validation, lint, and all 355 Vitest tests
  passed; the command then failed at `test:e2e:functional` with 22 passed and
  6 Radar scenarios failed because no retained `.radar-card` existed.
- After explicit user authorization, a test-only current-history fixture was
  added to the seven card-dependent Radar journeys. The initially failing 6/6
  targeted
  scenarios passed, and a complete `npm run validate:release` rerun passed
  every automated gate. The result is `readyWithWarnings` only because the
  manual checklist remains `notRun`.

The current uncommitted state passed the complete automated release gate.

## Evidence path

- Local full evidence: `quality/runtime/execution/latest/`
- Downloaded Linux candidate artifact:
  `%TEMP%\academy-linux-visual-30276838410\reviewed-linux-visual-candidates-30276838410`
- Candidate manifest:
  `quality/generated/visual-candidate-manifest.json` inside that artifact.
- GitHub candidate workflow:
  `https://github.com/ShabiLev/Shabi-s-AI-Academy/actions/runs/30276838410`

## Open failures

Exact-SHA CI runs `30276827893` and `30276832077` failed because reviewed Linux
baselines were not yet committed. Do not treat their visual output as
approved: human inspection found the English Help candidates blank.

The apparent English Help product failure was root-caused to test
synchronization: the shared layout `<h1>` became visible before the lazy Help
route body loaded, and the single-frame capture recorded a blank route body.
The route itself renders correctly once `.help-filters` and an article are
visible.

The resolved release blocker was date-bound Radar retention. On 2026-07-28 the
unchanged seven-day retention rule computes a 2026-07-22 cutoff. All three
tracked fallback records are dated 2026-07-20 or 2026-07-21, so the application
correctly retains zero unsaved records and six functional E2E scenarios that
require cards fail. The scheduled `Update AI Radar public feed` workflow is
healthy (latest observed run `30326524653` passed), but standard release
validation and exact-SHA CI build from the tracked fallback rather than that
deployed runtime artifact.

The resolution is test-only: `seedCurrentRadarHistory` copies the reviewed
cache into browser-local test history with the run date, and only the seven
explicit scenarios that require cards opt into it. Product retention, the
tracked Radar feed, and Playwright's functional clock remain unchanged.

## Warnings

- Preserve the uncommitted files exactly; do not reset, stash, clean, or
  overwrite them.
- The two regenerated Windows English Help images were visually inspected and
  accepted locally.
- The downloaded Linux artifact contains deterministic but invalid blank
  English Help candidates and must not be imported.
- A fresh Linux candidate workflow is required after the synchronization fix.
- PR #6, not obsolete PR #3, is the active release PR.
- No retention logic, Radar feed, or visual tolerance was changed.
- The user explicitly authorized completing the full commit, push, merge, tag,
  and deployment workflow after the test-only Radar fixture was proposed.

## Manual review

WALK ME desktop/mobile and Hebrew Help Linux candidates were inspected and
looked materially correct. The corrected English Windows Help baselines were
also inspected and accepted locally. Fresh Linux candidates remain pending
visual review. The repository's manual release checklist remains not run.

## Next action

Review and commit the focused synchronization, Windows baseline, Radar
test-fixture, and handoff changes; push PR #6; generate and review fresh Linux
visual candidates for the exact commit; install only reviewed Linux baselines;
then require green exact-SHA CI before merge, tag, deployment, and smoke.

## Prohibited assumptions

- Do not assume the current working tree is validated, committed, pushed, or
  represented by PR #6.
- Do not assume any Linux baseline from run `30276838410` is safe to import.
- Do not assume exact-SHA CI is green.
- Do not merge, tag, deploy, or smoke-test until the corrected visual and full
  release gates pass.
- Do not change retention logic, the tracked Radar feed, or visual tolerance.
- Do not pin the functional Playwright clock; the approved test-history
  fixture is the only resolution in scope.

## Rules

Preserve all current work. On resume, compare live Git state with this handoff
before any mutation and do not overwrite changes made during the pause.
