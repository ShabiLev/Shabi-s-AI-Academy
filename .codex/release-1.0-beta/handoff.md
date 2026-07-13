# Codex Handoff — Implement 1.0.0-beta.1

Read in order:
1. `AGENTS.md`
2. `.codex/README.md`
3. accepted ADRs
4. referenced architecture and standards
5. every file in `.codex/release-1.0-beta/`

Then:
1. Verify repository, remote, version and working tree.
2. Create `release/1.0.0-beta.1`.
3. Produce a phased implementation plan.
4. Implement every module in the specified sequence.
5. Use the required separate commits.
6. Run focused tests after each module.
7. Preserve existing user data through migrations.
8. Keep UI bilingual and responsive.
9. Keep Mock/Dry Run active.
10. Keep Live disabled by default and server-side only if implemented.
11. Update tests, QA Center, How To, docs and metadata continuously.
12. Run every command in `11-release.md`.
13. Create the final release commit.
14. Stop before push or merge.

Do not skip modules, reduce content minimums, weaken tests, fabricate live features, expose secrets, overwrite unrelated work, push, merge, force push or amend published commits.

Final report: commits, branch, version, files, lesson count, prompt counts by pack, agent counts, Playground/Projects/KB/provider status, tests, coverage, accessibility, visual, Lighthouse, Vercel Preview, limitations, manual checks and exact push command.
