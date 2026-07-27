# Version 1.7.0-beta.3 master specification

## Release identity

- Target version: `1.7.0-beta.3`
- Branch: `feature/1.7.0-beta.3-walkthrough-help`
- Conventional commit: `feat(guidance): deliver global walkthrough and public help`
- Tag after merge/deployment gates: `v1.7.0-beta.3`

## Scope

1. Replace module-level tour banners and local tour definitions with one global eight-step WALK ME product walkthrough.
2. Persist bounded, validated, actor-scoped `not-started`, `in-progress`, and `completed` state with resumable progress and completion-only replay.
3. Provide a neutral dim layer, one target spotlight, adaptive speech bubble/pointer, mobile bottom sheet, bilingual RTL/LTR copy, keyboard operation, focus management, reduced motion, and 200% zoom support.
4. Make `/help` public and guest-safe with one semantic heading, localized typed filters/area labels, improved contrast and borders, responsive filters, and aligned cards.
5. Preserve Radar feed behavior, retention behavior, provider boundaries, analytics consent, and visual tolerances.

## Acceptance gates

- Targeted unit and Playwright walkthrough/Help regression.
- Full unit, lint, build, functional E2E, cross-browser, accessibility, storage, security, performance, and release validation.
- Human-reviewed Windows and Linux visual baselines; run the complete visual suite twice with the visual-only clock fixed at `2026-07-26T12:00:00Z`.
- Exact-SHA CI, merge-SHA deployment verification, and production smoke tests.
- Generated reports, traces, videos, coverage, `dist`, and logs are not committed.

## Rollback

Revert the release merge through a normal branch and pull request, rerun the complete validation contract, and redeploy the previous known-good release. Do not delete guest-owned data. The existing walkthrough key is backward-compatible; beta.2 ignores the newer resumable fields safely.
