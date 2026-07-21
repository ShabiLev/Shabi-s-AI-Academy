# Quality Execution Summary

## Identity

- Run ID: 2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release
- Date and time: 2026-07-21T13:49:13.731Z to 2026-07-21T14:02:09.725Z
- Application version: 1.4.0-beta.1
- Branch: fix/1.4.0-ci-memory-visual-release
- Source branch: fix/1.4.0-ci-memory-visual-release
- Runtime branch: fix/1.4.0-ci-memory-visual-release
- Target branch: main
- Execution context: localFeature
- Tested commit: fae3d8d37d0d639e5836ca5e903ef329b04eb5ca
- Evidence commit: 46bca701c9e6e53d4b0b51219475c3a5a7f86c37
- Parent commit: fae3d8d37d0d639e5836ca5e903ef329b04eb5ca
- Generated at: 2026-07-21T14:03:36.154Z
- Working tree clean at test: Yes
- Integrity validation: pending post-evidence commit
- Agent used: Codex
- Operating system: win32 10.0.26200 x64
- Node version: v20.17.0
- npm version: 10.8.2

## Scope

- Requested task: Run the full quality-evidence profile.
- Implemented changes: No implementation scope was supplied; this run records validation evidence only.
- Files added: see changed-files.txt
- Files modified: see changed-files.txt
- Files deleted: see changed-files.txt
- Data migrations: None

## Results

| Area | Status | Command | Duration | Failures | Log path |
| --- | --- | --- | ---: | ---: | --- |
| Docs | passed | npm run docs:check | 0s | 0 | quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/docs-check.log |
| Lint | passed | npm run lint | 11s | 0 | quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/lint.log |
| Unit tests | passed | npm run test:evidence; npm run test:aos; npm run test:release; npm run test:run | 30s | 0 | quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/focused-tests.log, quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/aos-tests.log, quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/release-tests.log, quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/unit-tests.log |
| Coverage | passed | npm run test:coverage | 34s | 0 | quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/coverage.log |
| Build | passed | npm run build | 14s | 0 | quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/build.log |
| GitHub Pages build | passed | npm run build:pages; npm run test:e2e:pages | 41s | 0 | quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/build-pages.log, quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/e2e-pages.log |
| Functional E2E | passed | npm run test:e2e:functional | 36s | 0 | quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/e2e-functional.log |
| Cross-browser | passed | npm run test:e2e:cross-browser | 34s | 0 | quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/e2e-cross-browser.log |
| Journeys | passed | npm run test:journeys | 30s | 0 | quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/journeys.log |
| UX | passed | npm run test:click-audit; npm run test:route-crawl; npm run test:forms; npm run test:overlays; npm run test:responsive:interactions; npm run test:keyboard; npm run test:copy; npm run test:errors; npm run test:ux | 236s | 0 | quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/click-audit.log, quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/route-crawl.log, quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/forms.log, quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/overlays.log, quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/responsive-interactions.log, quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/keyboard.log, quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/copy.log, quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/errors.log, quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/ux.log |
| Accessibility | passed | npm run test:a11y | 80s | 0 | quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/accessibility.log |
| Visual | failed | npm run test:visual | 82s | 1 | quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/visual.log |
| Performance | passed | npm run test:performance | 124s | 0 | quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/performance.log |
| Release validation | passed | npm run memory:check; npm run quality:inventory | 1s | 0 | quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/memory-check.log, quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/quality-inventory.log |
| Git diff | passed | git diff --check | 0s | 0 | quality/execution/runs/2026-07-21_16-49-13_fix-1-4-0-ci-memory-visual-release/git-diff-check.log |

## Coverage

| Metric | Percent | Threshold | Delta | Passed |
| --- | ---: | ---: | ---: | --- |
| statements | 76.34 | 75 | -0.23 | true |
| branches | 74.25 | 65 | -0.08 | true |
| functions | 72.57 | 70 | 0 | true |
| lines | 76.34 | 75 | -0.23 | true |

## Findings

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Warnings: 12
- Manual review required: Yes

## Git

- Working branch: fix/1.4.0-ci-memory-visual-release
- Main relationship: main...HEAD left/right counts: 0	16
- Remote relationship: HEAD...origin/main left/right counts: 16	0
- Commits created: None
- Working tree status: clean
- Exact synchronization commands: see latest/README.md

## Recommendation

Blocked
