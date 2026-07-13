# 1.1.0-beta.1 Release

## Version and commits

Set all app/build/docs metadata to `1.1.0-beta.1` and create, in order:

1. `feat(search): add unified Workspace search`
2. `feat(commands): add Command Palette and shortcut registry`
3. `feat(assistant): add local Assistant and safe action routing`
4. `feat(builders): enhance Prompt and Agent builders`
5. `feat(workflows): add deterministic Workflow Builder`
6. `feat(workspace): add notifications, recents and analytics`
7. `feat(backup): add complete Workspace export and import`
8. `test(workspace): add AI Workspace regression coverage`
9. `chore(release): prepare Shabi's AI Academy 1.1.0-beta.1`

## Gates

Run the individual docs, lint, unit, coverage, build, catalog, fast/full E2E, accessibility, visual, performance, quality collection/analysis, `validate:release`, and `git diff --check` commands. Record observed outcomes and manual checks. Definition of Done requires every module, translations, accessibility/responsiveness, complete docs, correct commits/version, clean tree, and no push or merge.

After explicit user approval only: `git push -u origin feature/1.1.0-ai-workspace`.

