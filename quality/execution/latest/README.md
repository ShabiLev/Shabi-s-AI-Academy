# Latest quality execution

- Occurred: 2026-07-14T12:16:35.297Z to 2026-07-14T12:32:12.080Z
- Branch: test/1.3.0-quality-evidence
- Commit tested: 0bdf19b729a8409b5f7d0bc990a026e2f708a2c2
- Profile: full
- Commands run: npm run docs:check, npm run test:evidence, npm run lint, npm run test:run, npm run test:coverage, npm run build, npm run build:pages, npm run catalog:check, npm run test:e2e, npm run test:e2e:full, npm run test:e2e:pages, npm run test:journeys, npm run test:click-audit, npm run test:route-crawl, npm run test:forms, npm run test:overlays, npm run test:responsive:interactions, npm run test:keyboard, npm run test:copy, npm run test:errors, npm run test:ux, npm run test:a11y, npm run test:visual, npm run test:performance, npm run test:release-candidate, npm run test:release-candidate:pages, npm run quality:collect, npm run quality:analyze, npm run quality:system-report, npm run validate:release, git diff --check
- Commands passed: npm run docs:check, npm run test:evidence, npm run lint, npm run test:run, npm run test:coverage, npm run catalog:check, npm run test:journeys, npm run test:click-audit, npm run test:route-crawl, npm run test:forms, npm run test:overlays, npm run test:responsive:interactions, npm run test:keyboard, npm run test:copy, npm run test:errors, npm run test:ux, npm run test:a11y, npm run quality:collect, npm run quality:system-report, git diff --check
- Commands failed: npm run build, npm run build:pages, npm run test:e2e, npm run test:e2e:full, npm run test:visual, npm run test:performance, npm run test:release-candidate, npm run test:release-candidate:pages, npm run quality:analyze, npm run validate:release
- Heavy local artifacts: `quality/execution/runs/2026-07-14_15-16-35_test-1-3-0-quality-evidence/` (ignored), plus copied Playwright, coverage, and quality-generated reports when available.
- Safe to commit: Yes; latest files are sanitized summaries and contain no environment values. Review the diff before staging.
- Manual review pending: manualUxReview, manualSecurityReview, manualContentReview

## Synchronization (not executed)

```bash
git status
git branch --show-current
git fetch origin
git status -sb
git push -u origin test/1.3.0-quality-evidence
```
