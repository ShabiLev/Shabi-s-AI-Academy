# Version 2.0 verification and release plan

## Focused verification

- Outcome validation, state transitions, reality mapping and actor isolation.
- Project schema migration and outcome-based progress.
- Workflow Run Report migration and deterministic execution report.
- Mission/Lesson completion rejection without substantiation.
- Context links, referential integrity and backup/restore rollback.
- Shared Result actions, persistence, direct route and refresh.

## System verification

Run `npm run test:version-2.0`, `npm run validate:release`,
`npm run quality:evidence:full`, `git diff --check`, secret scanning and an
independent hard-ass QA/Reality review. Visual captures must be serialized and
human-reviewed; thresholds and baselines must not be weakened to hide changes.

## Release sequence

1. Complete implementation and focused tests while package version remains 1.9.
2. Bump to `2.0.0-beta.1`, update release metadata and rerun all gates.
3. Record human UX, content and security approvals.
4. Commit and push the feature branch; open a PR with exact-SHA evidence.
5. Require green PR CI and resolved review findings.
6. Merge without force or history rewrite, validate main and tag
   `v2.0.0-beta.1`.
7. Verify GitHub Pages and Vercel deployment provenance against the merge SHA.
8. Run production smoke in Hebrew/English and desktop/mobile, including result
   persistence, backup/restore and absence of unexpected writes.
