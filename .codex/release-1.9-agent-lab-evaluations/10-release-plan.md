# Version 1.9 release plan

## Preconditions

- Feature branch starts at baseline
  `7c528648761f0b40d1faf1a836c3c619565b75b9` or a documented later verified
  main SHA.
- Version 1.8 migration, backup/import, Missions, Teams, WALK ME, Help, Radar,
  and storage gates pass before Version 1.9 implementation.
- The Version 1.9 test matrix exists before production code changes.
- No release claim is made from planning documents or stale evidence.

## Delivery sequence

1. Implement on `feature/1.9-agent-lab-evaluations` in the phases defined by
   [the master spec](00-master-spec.md), with regression tests.
2. Review scoped diff, security boundaries, dependency changes, secrets,
   generated artifacts, bundle impact, migration, docs, and release notes.
3. Run focused gates, `npm ci`, `npm run test:version-1.9`,
   `npm run validate:release`, visual twice, storage/retention gates, full
   evidence, and repository hygiene.
4. Create logical Conventional Commits and push only the feature branch.
5. Open draft PR titled
   `release: Version 1.9.0-beta.1 Agent Lab and Evaluations`.
6. Document scope, architecture, migration, security/privacy, tests, visual
   review, bundle impact, limitations, rollback, and manual review status.
7. Require green exact PR-head CI. Fix causes on the feature branch; never
   weaken policy, evidence, accessibility, visual tolerance, or security gates.
8. Independent read-only Reality Checker assesses evidence and containment.
   The implementation owner cannot approve the release.
9. After review, rerun full release validation on the exact PR head.
10. Merge through the PR, pull `main --ff-only`, and verify exact merge SHA.
11. Require exact main merge-SHA CI and stable mandatory job success.
12. Create and push annotated tag `v1.9.0-beta.1` on the verified merge SHA.
13. Verify GitHub Pages and Vercel deployments point to that SHA.
14. Production smoke clean and migrated profiles, Hebrew/English,
    desktop/mobile, comparison, rubric, pause/reload/continue, suite, preview
    non-write, Codex export/round-trip, backup, and visible production version.

## Release communication

Release notes must say:

- execution is Academy deterministic evaluation, not real-provider comparison;
- connected workflows are preview-only and never write externally;
- Codex export downloads a validated file but does not install it;
- data remains actor-scoped and local-first;
- migration/backup and rollback behavior;
- evidence, confidence, missing-evidence, and evaluator-independence rules;
- known limitations and exact manual review status.

## Monitoring and rollback readiness

Monitor deployment state, browser/runtime errors, navigation, storage
quarantine, backup/import, long trace rendering, and preview non-write behavior.
Keep the last known-good `v1.8.0-beta.1` artifact and
[rollback plan](11-rollback-plan.md) available. Deployment or smoke failure
remains unresolved until fixed or rolled back.

## Current status

Planning/specification is prepared. Version 1.9 implementation, automated
validation, manual reviews, PR, CI, tag, deployment, and smoke are not yet
verified by this document.
