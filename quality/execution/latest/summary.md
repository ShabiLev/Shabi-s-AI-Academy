# Quality Execution Summary

## Identity

- Run ID: 2026-07-14_15-16-35_test-1-3-0-quality-evidence
- Date and time: 2026-07-14T12:16:35.297Z to 2026-07-14T12:32:12.080Z
- Application version: 1.3.0-beta.1
- Branch: test/1.3.0-quality-evidence
- Starting commit: 0bdf19b729a8409b5f7d0bc990a026e2f708a2c2
- Final commit: 0bdf19b729a8409b5f7d0bc990a026e2f708a2c2
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
| Docs | passed | npm run docs:check | 0s | 0 | quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/docs-check.log |
| Lint | passed | npm run lint | 8s | 0 | quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/lint.log |
| Unit tests | passed | npm run test:evidence; npm run test:run | 19s | 0 | quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/focused-tests.log, quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/unit-tests.log |
| Coverage | passed | npm run test:coverage | 23s | 0 | quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/coverage.log |
| Build | failed | npm run build | 9s | 1 | quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/build.log |
| GitHub Pages build | failed | npm run build:pages; npm run test:e2e:pages | 9s | 1 | quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/build-pages.log, quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/e2e-pages.log |
| E2E | failed | npm run test:e2e; npm run test:e2e:full | 277s | 2 | quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/e2e.log, quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/e2e-full.log |
| Journeys | passed | npm run test:journeys | 41s | 0 | quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/journeys.log |
| UX | passed | npm run test:click-audit; npm run test:route-crawl; npm run test:forms; npm run test:overlays; npm run test:responsive:interactions; npm run test:keyboard; npm run test:copy; npm run test:errors; npm run test:ux | 282s | 0 | quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/click-audit.log, quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/route-crawl.log, quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/forms.log, quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/overlays.log, quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/responsive-interactions.log, quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/keyboard.log, quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/copy.log, quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/errors.log, quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/ux.log |
| Accessibility | passed | npm run test:a11y | 65s | 0 | quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/accessibility.log |
| Visual | failed | npm run test:visual | 80s | 1 | quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/visual.log |
| Performance | failed | npm run test:performance | 12s | 1 | quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/performance.log |
| Release validation | failed | npm run test:release-candidate; npm run test:release-candidate:pages; npm run validate:release | 92s | 3 | quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/release-candidate.log, quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/release-candidate-pages.log, quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/validate-release.log |
| Git diff | passed | git diff --check | 0s | 0 | quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/git-diff-check.log |

## Coverage

| Metric | Percent | Threshold | Delta | Passed |
| --- | ---: | ---: | ---: | --- |
| statements | 75.43 | 75 | 0 | true |
| branches | 75.48 | 65 | -0.01 | true |
| functions | 72.18 | 70 | 0 | true |
| lines | 75.43 | 75 | 0 | true |

## Findings

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Warnings: 14
- Manual review required: Yes

## Git

- Working branch: test/1.3.0-quality-evidence
- Main relationship: main...HEAD left/right counts: 0	0
- Remote relationship: HEAD...origin/main left/right counts: 0	0
- Commits created: None
- Working tree status: M .gitignore
 M README.md
 M docs/system-quality-program.md
 M eslint.config.js
 M package.json
 M quality/README.md
 M src/App.test.tsx
?? quality/checklists/manual-content-review.json
?? quality/checklists/manual-security-review.json
?? quality/execution/
?? scripts/evidence-utils.mjs
?? scripts/evidence-utils.test.mjs
?? scripts/run-quality-evidence.mjs
?? src/components/runtime/ApprovalDialog.test.tsx
?? src/pages/auth/authFlows.test.tsx
- Exact synchronization commands: see latest/README.md

## Recommendation

Blocked
