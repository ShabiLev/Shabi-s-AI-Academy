# CI root-cause analysis — 2026-07-15

## Scope

- Repository: `ShabiLev/Shabi-s-AI-Academy`
- Feature branch: `feature/1.4.0-agent-operating-system`
- Failed main run inspected: `29417984110` at commit `cf6b1e712cb5b541ae871b0c209f098a6d56f215`
- Baseline inventory before and after this fix: 82 `*-win32.png`; 0 `*-linux.png`

## Root causes

1. Agent Memory used one ambiguous `branch` field and treated a mismatch with the runtime checkout as corruption. A checked-in feature-branch record therefore failed after the same commit ran from `main` or a pull-request merge ref.
2. The Linux visual job correctly selected platform-specific `*-linux.png` snapshots, but none were committed. The full E2E command also included the visual project, so missing baselines made both the visual and nominal E2E jobs fail.
3. The authenticated Lighthouse flow launched Chromium without the CI-only sandbox arguments required by the hosted Ubuntu runner, producing `No usable sandbox!` before artifacts were written.

## Changes

- Replaced ambiguous memory branch metadata in the five contextual state records with `sourceBranch`, `currentBranch`, `targetBranch`, `testedCommit`, and `generatedAt`.
- Made local feature, local main, GitHub push, pull-request merge ref, detached HEAD, missing Git metadata, stale evidence, and malformed branch semantics explicit and tested.
- Split Chromium functional, cross-browser responsive, accessibility, visual, and performance jobs. The summary collector combines functional and cross-browser reports into the existing full-E2E gate.
- Added a separate manual `Generate Linux visual baselines` workflow with an exact confirmation phrase, read-only repository permission, guarded update command, verification run, and review artifact. It cannot commit or push.
- Scoped Chromium `--no-sandbox` and `--disable-setuid-sandbox` to CI for the authenticated Lighthouse process; local launches retain the default sandbox.

## Local verification

- `npm run test:aos`: passed, 25/25.
- `npm run memory:check`: passed with honest stale/dirty-evidence warnings.
- `npm run docs:check`: passed.
- `npm run lint`: passed.
- `npm run test:run`: passed, 312/312.
- `npm run build`: passed.
- `CI=true npm run test:e2e:functional`: passed, 15/15. An earlier non-CI run had one blank-page startup race; the test passed on isolated rerun and under the CI retry configuration.
- `npm run test:cross-browser`: passed, 10/10.
- `npm run test:a11y`: passed, 74/74.
- `npm run test:performance`: passed for public login plus authenticated desktop/mobile flows.
- `npm run test:e2e:pages`: passed, 4/4.
- `npm run test:visual`: failed, 35 mismatches and 25 passes against existing Windows baselines. No baseline was updated.
- Unapproved visual update guard: rejected as expected.

## Human-controlled Linux baseline status

- Workflow run: not started at the time of this report; the workflow must first exist on the pushed feature branch and be manually dispatched.
- Artifact: not available until the workflow runs.
- Human review: not performed.
- Linux baselines committed: no.
- Normal Linux visual CI is expected to remain red until every generated image is reviewed and the approved `*-linux.png` files are committed.

## Residual risks and warnings

- The existing Windows baselines have 35 mismatches that predate this CI repair and still require product/UX review. They were deliberately preserved.
- Full-page visual captures showed unstable page heights in a few retries. This should be assessed while reviewing the Linux artifact; generated screenshots must not be accepted blindly.
- Direct `agent-browser` verification was unavailable because its CLI is not installed. Repository Playwright checks supplied the browser verification evidence instead.
