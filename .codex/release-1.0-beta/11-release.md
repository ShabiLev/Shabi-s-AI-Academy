# 1.0.0-beta.1 Release Specification

## Branch
Create `release/1.0.0-beta.1` from the current accepted baseline. Do not implement directly on main.

## Version
Set exactly `1.0.0-beta.1` in package files, metadata, footer, About, QA Center, Release Center, README, CHANGELOG and build metadata.

## Commits
Use the sequence in `00-master-spec.md`.

## Required validation
```text
npm run docs:check
npm run lint
npm run test:run
npm run test:coverage
npm run build
npm run catalog:check
npm run test:e2e
npm run test:e2e:full
npm run test:a11y
npm run test:visual
npm run test:performance
npm run quality:collect
npm run quality:analyze
npm run validate:release
git diff --check
```

## Production checks
Vercel Preview READY, public/protected routes, refresh, no secrets, no runtime errors and manual checklist complete.

## Final commit
`chore(release): prepare Shabi's AI Academy 1.0.0-beta.1`

## Policy
No automatic push, merge, force push or amendment of published history.

## Definition of Done
All modules, content minimums, quality gates, manual checklist, Preview READY, correct version, complete docs, final release commit, clean tree and no secrets.

## Expected command after approval
`git push -u origin release/1.0.0-beta.1`
