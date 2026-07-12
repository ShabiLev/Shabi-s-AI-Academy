# Release Checklist — <version>

## Scope and versions

Baseline/target, included commits, excluded changes: <details>

## Required documentation

- [ ] README / CHANGELOG / How To
- [ ] Architecture/standards/Sprint specs
- [ ] Versioned manual checklist and known limitations

## Automated evidence

- [ ] lint, unit, coverage, build
- [ ] domain validators
- [ ] fast/full E2E, axe, visual, Lighthouse
- [ ] quality collection/analyzer
- [ ] docs:check and git diff check

Command: `npm run validate:release`

## Manual evidence

Directions/viewports, keyboard/screen reader, changed visuals, persistence/resets, external content/attribution, browser controls: <results>

## Security and artifacts

- [ ] no secrets/personal paths/transient output
- [ ] risky actions and live claims reviewed

## Commit and handoff

Commit: `<exact message>` · SHA: <after commit> · Pushed: No

Push command for user: `git push origin main`

Known limitations/rollback signals: <details>
