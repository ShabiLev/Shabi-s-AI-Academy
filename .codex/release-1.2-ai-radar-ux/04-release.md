# Release

## Commit sequence

1. `docs(release): define AI Radar and UX hardening`
2. `feat(radar): add bilingual source-based AI Radar`
3. `fix(ux): harden profile menu and shared layouts`
4. `test(ux): expand responsive and visual regression coverage`
5. `docs(radar): document sources and freshness model`
6. `chore(release): prepare 1.2.0-beta.1`

Tests and documentation that are necessary to understand a behavior stay with its implementation commit; commit four holds cross-feature browser matrices and reviewed baselines.

## Release gate

Update package metadata, lockfile, footer, README, CHANGELOG, roadmap, How To, QA/release documentation, and quality evidence. Preserve GitHub Pages build validation and both router modes. Run `npm run validate:release`, inspect `git diff --check`, confirm the intended commit history and clean tree, and stop before push.
