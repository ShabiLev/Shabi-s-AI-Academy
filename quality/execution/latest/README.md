# Latest quality execution

- Occurred: 2026-07-15T12:45:55.865Z to 2026-07-15T13:06:51.652Z
- Branch: main
- Commit tested: c92cac91aa3dcd6c8a40f32f10ef48094a1a91d5
- Profile: full
- Commands run: npm run docs:check, npm run aos:check, npm run test:evidence, npm run test:aos, npm run lint, npm run test:run, npm run test:coverage, npm run build, npm run build:pages, npm run catalog:check, npm run test:e2e, npm run test:e2e:full, npm run test:e2e:pages, npm run test:journeys, npm run test:click-audit, npm run test:route-crawl, npm run test:forms, npm run test:overlays, npm run test:responsive:interactions, npm run test:keyboard, npm run test:copy, npm run test:errors, npm run test:ux, npm run test:a11y, npm run test:visual, npm run test:performance, npm run test:release-candidate, npm run test:release-candidate:pages, npm run quality:collect, npm run quality:analyze, npm run quality:system-report, npm run validate:release, git diff --check
- Commands passed: npm run docs:check, npm run aos:check, npm run test:evidence, npm run lint, npm run test:run, npm run test:coverage, npm run build, npm run build:pages, npm run catalog:check, npm run test:e2e, npm run test:e2e:pages, npm run test:journeys, npm run test:click-audit, npm run test:route-crawl, npm run test:forms, npm run test:overlays, npm run test:responsive:interactions, npm run test:keyboard, npm run test:copy, npm run test:errors, npm run test:ux, npm run test:a11y, npm run test:performance, npm run test:release-candidate:pages, npm run quality:collect, npm run quality:system-report, git diff --check
- Commands failed: npm run test:aos, npm run test:e2e:full, npm run test:visual, npm run test:release-candidate, npm run quality:analyze, npm run validate:release
- Heavy local artifacts: `quality/execution/runs/2026-07-15_15-45-55_main/` (ignored), plus copied Playwright, coverage, and quality-generated reports when available.
- Safe to commit: Yes; latest files are sanitized summaries and contain no environment values. Review the diff before staging.
- Manual review pending: manualUxReview, manualSecurityReview, manualContentReview

## Synchronization (not executed)

```bash
git status
git branch --show-current
git fetch origin
git status -sb
git push -u origin main
```
