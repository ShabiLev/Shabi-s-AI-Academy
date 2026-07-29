# Release plan

1. Review scoped diff, secrets, generated artifacts and release documentation.
2. Create logical Conventional Commits and push only the feature branch.
3. Open PR titled `release: Version 1.8.0-beta.1 Agent Teams and Learning Intelligence`.
4. Require exact-SHA CI and stable mandatory jobs; fix functional failures on
   the feature branch.
5. Merge through the PR only after green gates and containment verification.
6. Verify main CI for the merge SHA.
7. Create annotated tag `v1.8.0-beta.1` on that exact merge SHA and push it.
8. Verify GitHub Pages and Vercel production deployments.
9. Smoke clean and migrated 1.7 states, Hebrew/English, desktop/mobile, mission
   create/pause/resume, preset copy, WALK ME states and backup import.

Release notes must state local-only deterministic execution, disabled connected
execution, source attribution, migration behavior, rollback and known manual
review limitations.
