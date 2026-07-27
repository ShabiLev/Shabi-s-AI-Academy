# Version 1.7.0-beta.2 master specification

Status: implementation and validation.

## Release identity

- Baseline commit: `cca7fcce11b2dcb3f2d9cc0ea8b5b8631b1dc51d`
- Baseline version: `1.7.0-beta.1`
- Working branch: `agent/first-visit-walkthrough`
- Target version: `1.7.0-beta.2`
- Release name: **First-Visit Product Walkthrough**

## Objective

Add an optional, bilingual, local-first first-visit walkthrough by extending
the existing `GuidedTourProvider`. The walkthrough starts only after onboarding
and application readiness, supports desktop and mobile spotlight targets,
persists bounded actor-scoped progress, and remains restartable from Help and
Settings without deleting user work.

## Invariants

- Do not add a commercial WalkMe SDK or any new production dependency.
- Do not change AI Radar feeds, guest-profile retention, analytics consent,
  visual tolerances, or provider/security boundaries.
- Keep Hebrew RTL and English LTR behavior equivalent.
- Keep existing page tours and the `startTour(id)` contract working.
- Walkthrough records contain no prompt content, credentials, session data, or
  precise identity and remain excluded from guest export/import.
- Preserve the immutable `v1.7.0-beta.1` tag; this release uses a new
  `v1.7.0-beta.2` tag only after exact-SHA CI and deployment gates pass.

## Acceptance criteria

1. A fresh actor is offered an eight-step welcome walkthrough once, after
   onboarding completes on Dashboard.
2. Start, Not now, Previous, Next, Finish, Escape, focus trap/return,
   background inertness, scroll restoration, reduced motion, and an accessible
   live progress announcement work.
3. Desktop and mobile use stable `data-walkthrough` targets; the mobile
   navigation action opens the drawer explicitly.
4. Refresh resumes an in-progress step; completion and dismissal suppress
   automatic restart; Help and Settings can restart; Settings can reset only
   walkthrough state.
5. Storage is schema/version/size validated and actor-scoped with safe
   corruption recovery and no legacy completion leakage.
6. Shared Playwright fixtures seed completion by default; dedicated fresh-state
   tests cover first visit, resume, dismissal, reset, mobile, accessibility,
   and a reviewed visual baseline.

## Verification contract

Run focused unit/E2E/accessibility tests, the 68-scenario Windows visual suite
twice with one worker, `npm run validate:release`,
`npm run quality:evidence:full`, retention and baseline integrity checks,
exact-SHA GitHub CI, deployment verification, and production smoke tests.

## Delivery

Use Conventional Commit:

`feat(guidance): add first-visit local walkthrough`

Publish through a pull request to `main`. Merge, tag, and deploy only under the
explicit authorization supplied for this task and only while mandatory
automated gates remain green.
