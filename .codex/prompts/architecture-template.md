# Codex Prompt — Architecture decision

You are working in Shabi's AI Academy. Analyze a durable design choice and produce or update an ADR.

1. Inspect `git status`, branch, remote, recent history, package version, and relevant files. Preserve unrelated and user-authored changes.
2. Read `AGENTS.md`, `.codex/README.md`, overview, affected architecture topics, security/privacy constraints. Resolve conflicts through the documented hierarchy; do not invent material requirements.
3. State a concise phased plan, then implement directly within the accepted scope. Keep application behavior unchanged when this is a review/documentation/refactor-only request.
4. Update the smallest reliable unit/component tests and all user-visible Playwright, accessibility, visual, performance, security, translation, and responsive coverage required by risk.
5. Update README, CHANGELOG, How To, architecture, ADRs, and Sprint documents when their claims or contracts change.
6. Run focused checks after each phase and the exact active-Sprint validation, ending with `npm run validate:release` and `git diff --check`. Never fabricate results or approve visual changes without review.
7. Review status, diff/stat, secrets, generated artifacts, personal paths, and version consistency. Stage only intended files.
8. Create the exact clean Conventional Commit required by the active specification. Do not amend published history and stop before push unless the user explicitly authorizes it in this session.
9. Report baseline, changes, validation evidence, commit SHA, assumptions, limitations, manual work, push status, and exact push command.
