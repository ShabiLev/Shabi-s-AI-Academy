# Version 1.7.0-beta.4 master specification

## Release identity

- Target version: `1.7.0-beta.4`
- Branch: `fix/1.7.0-beta.4-walkthrough-auto-launch`
- Conventional commit: `fix(guidance): restore first-visit walkthrough auto-launch`
- Tag after merge and deployment gates: `v1.7.0-beta.4`

## Scope

1. Launch WALK ME once for every fresh local actor on an eligible, ready Academy shell route, independently of onboarding completion.
2. Keep landing, onboarding, authentication, account, and administration routes free of automatic walkthrough overlays.
3. Launch after onboarding Finish or Skip navigates to Dashboard without requiring a reload.
4. On safe deep links, show the welcome step in place, move to Dashboard when the tour starts, and preserve the internal route for return after completion or temporary close.
5. Defer for visible blocking dialogs, ignore hidden dialog markup, and prevent duplicate initialization during Strict Mode, rerenders, and shell mutations.
6. Preserve actor-scoped storage, language, resume, completion-gated replay, Radar behavior, retention behavior, provider boundaries, analytics consent, and visual tolerances.

## Acceptance gates

- Targeted unit/component tests and the complete first-visit Playwright regression.
- Full unit, lint, build, functional E2E, cross-browser, accessibility, storage, security, performance, and release validation.
- The complete 68-scenario visual suite passes twice without baseline or tolerance changes.
- Exact-SHA CI, pull-request merge, `v1.7.0-beta.4` tag, merge-SHA deployment verification, and clean-profile production smoke.
- Generated reports, traces, videos, coverage, `dist`, and logs are not committed.

## Rollback

Revert the beta.4 merge through a normal branch and pull request, rerun the complete validation contract, and redeploy beta.3. Do not delete or migrate guest-owned data. The walkthrough storage schema and key are unchanged and backward-compatible.
