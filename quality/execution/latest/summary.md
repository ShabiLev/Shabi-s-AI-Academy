# Quality Execution Summary

## Identity

- Run ID: 2026-07-14_17-02-31_feature-1-4-0-agent-operating-system
- Date and time: 2026-07-14T14:02:31.987Z to 2026-07-14T14:19:35.852Z
- Application version: 1.4.0-beta.1
- Branch: feature/1.4.0-agent-operating-system
- Starting commit: f922b55fc2cd8766beb8de0fa91a1749ce7e7114
- Final commit: f922b55fc2cd8766beb8de0fa91a1749ce7e7114
- Agent used: Codex
- Operating system: win32 10.0.26200 x64
- Node version: v20.17.0
- npm version: 10.8.2

## Scope

- Requested task: Add persistent, sanitized quality-execution evidence and reusable command profiles.
- Implemented changes: Evidence orchestration, command logs, bounded index, tracked latest pointer, manual gates, focused tests, and documentation.
- Files added: see changed-files.txt
- Files modified: see changed-files.txt
- Files deleted: see changed-files.txt
- Data migrations: None

## Results

| Area | Status | Command | Duration | Failures | Log path |
| --- | --- | --- | ---: | ---: | --- |
| Docs | passed | npm run docs:check | 0s | 0 | quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/docs-check.log |
| Lint | passed | npm run lint | 8s | 0 | quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/lint.log |
| Unit tests | passed | npm run test:evidence; npm run test:run | 20s | 0 | quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/focused-tests.log, quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/unit-tests.log |
| Coverage | passed | npm run test:coverage | 23s | 0 | quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/coverage.log |
| Build | failed | npm run build | 10s | 1 | quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/build.log |
| GitHub Pages build | failed | npm run build:pages; npm run test:e2e:pages | 12s | 1 | quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/build-pages.log, quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/e2e-pages.log |
| E2E | failed | npm run test:e2e; npm run test:e2e:full | 325s | 1 | quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/e2e.log, quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/e2e-full.log |
| Journeys | passed | npm run test:journeys | 40s | 0 | quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/journeys.log |
| UX | passed | npm run test:click-audit; npm run test:route-crawl; npm run test:forms; npm run test:overlays; npm run test:responsive:interactions; npm run test:keyboard; npm run test:copy; npm run test:errors; npm run test:ux | 304s | 0 | quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/click-audit.log, quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/route-crawl.log, quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/forms.log, quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/overlays.log, quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/responsive-interactions.log, quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/keyboard.log, quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/copy.log, quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/errors.log, quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/ux.log |
| Accessibility | passed | npm run test:a11y | 76s | 0 | quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/accessibility.log |
| Visual | failed | npm run test:visual | 86s | 1 | quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/visual.log |
| Performance | failed | npm run test:performance | 11s | 1 | quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/performance.log |
| Release validation | failed | npm run test:release-candidate; npm run test:release-candidate:pages; npm run validate:release | 88s | 3 | quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/release-candidate.log, quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/release-candidate-pages.log, quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/validate-release.log |
| Git diff | passed | git diff --check | 0s | 0 | quality/execution/runs/2026-07-14_17-02-31_feature-1-4-0-agent-operating-system/git-diff-check.log |

## Coverage

| Metric | Percent | Threshold | Delta | Passed |
| --- | ---: | ---: | ---: | --- |
| statements | 76.27 | 75 | 0 | true |
| branches | 74.93 | 65 | 0.01 | true |
| functions | 72.46 | 70 | 0 | true |
| lines | 76.27 | 75 | 0 | true |

## Findings

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Warnings: 10
- Manual review required: Yes

## Git

- Working branch: feature/1.4.0-agent-operating-system
- Main relationship: main...HEAD left/right counts: 0	12
- Remote relationship: HEAD...origin/main left/right counts: 12	0
- Commits created: None
- Working tree status: clean
- Exact synchronization commands: see latest/README.md

## Recommendation

Blocked
