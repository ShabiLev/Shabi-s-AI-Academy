# Historical quality execution

This directory is a frozen migration record from the former tracked-evidence
architecture. It is not current release proof and normal quality execution must
not modify it. Current local output lives under ignored
`quality/runtime/execution/`; authoritative CI evidence is stored as GitHub
Actions artifacts for the exact tested SHA.

- Occurred: 2026-07-21T14:30:22.155Z to 2026-07-21T14:43:26.941Z
- Source branch: fix/1.4.0-ci-memory-visual-release
- Runtime branch: fix/1.4.0-ci-memory-visual-release
- Target branch: main
- Execution context: localFeature
- Tested commit: 498a1976ffb0f4f2c1c9609ec5133616ca3a70a8
- Evidence commit: bf05ce2766d4a4984ec8ceb724c29951b6464122
- Working tree clean at test: Yes
- Integrity validation: pending post-evidence commit
- Profile: full
- Commands run: npm run docs:check, npm run aos:check, npm run test:evidence, npm run test:aos, npm run test:release, npm run memory:check, npm run lint, npm run test:run, npm run test:coverage, npm run build, npm run build:pages, npm run catalog:check, npm run test:e2e:functional, npm run test:e2e:cross-browser, npm run test:e2e:pages, npm run test:journeys, npm run test:click-audit, npm run test:route-crawl, npm run test:forms, npm run test:overlays, npm run test:responsive:interactions, npm run test:keyboard, npm run test:copy, npm run test:errors, npm run test:ux, npm run test:a11y, npm run test:visual, npm run test:performance, npm run quality:inventory, npm run quality:collect, npm run quality:analyze, npm run quality:system-report, git diff --check
- Commands passed: npm run docs:check, npm run aos:check, npm run test:evidence, npm run test:aos, npm run test:release, npm run memory:check, npm run lint, npm run test:run, npm run test:coverage, npm run build, npm run build:pages, npm run catalog:check, npm run test:e2e:functional, npm run test:e2e:cross-browser, npm run test:e2e:pages, npm run test:journeys, npm run test:click-audit, npm run test:route-crawl, npm run test:forms, npm run test:overlays, npm run test:responsive:interactions, npm run test:keyboard, npm run test:copy, npm run test:errors, npm run test:ux, npm run test:a11y, npm run test:performance, npm run quality:inventory, npm run quality:collect, npm run quality:analyze, npm run quality:system-report, git diff --check
- Commands failed: npm run test:visual
- Heavy local artifacts: `quality/execution/runs/2026-07-21_17-30-22_fix-1-4-0-ci-memory-visual-release/` (ignored), plus copied Playwright, coverage, and quality-generated reports when available.
- Safe to commit: Yes; latest files are sanitized summaries and contain no environment values. Review the diff before staging.
- Manual review pending: manualUxReview, manualSecurityReview, manualContentReview

## Synchronization (not executed)

```bash
git status
git branch --show-current
git fetch origin
git status -sb
git push -u origin fix/1.4.0-ci-memory-visual-release
```
