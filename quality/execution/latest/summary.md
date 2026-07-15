# Quality Execution Summary

## Identity

- Run ID: 2026-07-15_15-45-55_main
- Date and time: 2026-07-15T12:45:55.865Z to 2026-07-15T13:06:51.652Z
- Application version: 1.4.0-beta.1
- Branch: main
- Starting commit: c92cac91aa3dcd6c8a40f32f10ef48094a1a91d5
- Final commit: c92cac91aa3dcd6c8a40f32f10ef48094a1a91d5
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
| Docs | passed | npm run docs:check | 0s | 0 | quality/execution/runs/2026-07-15_15-45-55_main/docs-check.log |
| Lint | passed | npm run lint | 8s | 0 | quality/execution/runs/2026-07-15_15-45-55_main/lint.log |
| Unit tests | passed | npm run test:evidence; npm run test:run | 19s | 0 | quality/execution/runs/2026-07-15_15-45-55_main/focused-tests.log, quality/execution/runs/2026-07-15_15-45-55_main/unit-tests.log |
| Coverage | passed | npm run test:coverage | 22s | 0 | quality/execution/runs/2026-07-15_15-45-55_main/coverage.log |
| Build | passed | npm run build | 10s | 0 | quality/execution/runs/2026-07-15_15-45-55_main/build.log |
| GitHub Pages build | passed | npm run build:pages; npm run test:e2e:pages | 26s | 0 | quality/execution/runs/2026-07-15_15-45-55_main/build-pages.log, quality/execution/runs/2026-07-15_15-45-55_main/e2e-pages.log |
| E2E | failed | npm run test:e2e; npm run test:e2e:full | 340s | 1 | quality/execution/runs/2026-07-15_15-45-55_main/e2e.log, quality/execution/runs/2026-07-15_15-45-55_main/e2e-full.log |
| Journeys | passed | npm run test:journeys | 48s | 0 | quality/execution/runs/2026-07-15_15-45-55_main/journeys.log |
| UX | passed | npm run test:click-audit; npm run test:route-crawl; npm run test:forms; npm run test:overlays; npm run test:responsive:interactions; npm run test:keyboard; npm run test:copy; npm run test:errors; npm run test:ux | 341s | 0 | quality/execution/runs/2026-07-15_15-45-55_main/click-audit.log, quality/execution/runs/2026-07-15_15-45-55_main/route-crawl.log, quality/execution/runs/2026-07-15_15-45-55_main/forms.log, quality/execution/runs/2026-07-15_15-45-55_main/overlays.log, quality/execution/runs/2026-07-15_15-45-55_main/responsive-interactions.log, quality/execution/runs/2026-07-15_15-45-55_main/keyboard.log, quality/execution/runs/2026-07-15_15-45-55_main/copy.log, quality/execution/runs/2026-07-15_15-45-55_main/errors.log, quality/execution/runs/2026-07-15_15-45-55_main/ux.log |
| Accessibility | passed | npm run test:a11y | 92s | 0 | quality/execution/runs/2026-07-15_15-45-55_main/accessibility.log |
| Visual | failed | npm run test:visual | 104s | 1 | quality/execution/runs/2026-07-15_15-45-55_main/visual.log |
| Performance | passed | npm run test:performance | 115s | 0 | quality/execution/runs/2026-07-15_15-45-55_main/performance.log |
| Release validation | failed | npm run test:release-candidate; npm run test:release-candidate:pages; npm run validate:release | 113s | 2 | quality/execution/runs/2026-07-15_15-45-55_main/release-candidate.log, quality/execution/runs/2026-07-15_15-45-55_main/release-candidate-pages.log, quality/execution/runs/2026-07-15_15-45-55_main/validate-release.log |
| Git diff | passed | git diff --check | 0s | 0 | quality/execution/runs/2026-07-15_15-45-55_main/git-diff-check.log |

## Coverage

| Metric | Percent | Threshold | Delta | Passed |
| --- | ---: | ---: | ---: | --- |
| statements | 76.34 | 75 | 0 | true |
| branches | 74.3 | 65 | 0.06 | true |
| functions | 72.57 | 70 | 0 | true |
| lines | 76.34 | 75 | 0 | true |

## Findings

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Warnings: 15
- Manual review required: Yes

## Git

- Working branch: main
- Main relationship: main...HEAD left/right counts: 0	0
- Remote relationship: HEAD...origin/main left/right counts: 3	0
- Commits created: None
- Working tree status: clean
- Exact synchronization commands: see latest/README.md

## Recommendation

Blocked
