# Next Actions

## ACTION-001: Review visual regression differences

- Priority: Critical
- Role: Human UX reviewer
- Reason: Release visual gate is failing against stale Windows baselines.
- Modules: quality.visual-regression, quality.manual-review
- Prerequisites: None
- Evidence: Reviewed Playwright diff report and approved baseline decision
- Complete when: Every visual mismatch is accepted and updated or fixed; npm run test:visual passes.
- Status: blocked

## ACTION-002: Complete manual release reviews

- Priority: High
- Role: Human reviewers
- Reason: Automation cannot approve subjective UX, security, or bilingual content.
- Modules: quality.manual-review
- Prerequisites: ACTION-001
- Evidence: Signed manual-review records
- Complete when: manualUxReview, manualSecurityReview, and manualContentReview have honest reviewer decisions.
- Status: pending

## ACTION-003: Merge the verified feature branch

- Priority: Medium
- Role: Release manager
- Reason: Main must remain untouched until the user executes the printed merge sequence.
- Modules: git.merge-policy, release.release-policy
- Prerequisites: ACTION-002
- Evidence: Local and remote main SHAs plus containment checks
- Complete when: Fast-forward merge, full evidence rerun, push, and containment verification all pass.
- Status: pending
