# AOS release workflow

How AOS models a release's lifecycle and how those states map onto the
existing `npm run validate:release` gate. Full detail lives in
[`../../.agent/release/`](../../.agent/release/); this page is the map
between the two.

## Release states

[`../../.agent/release/release-policy.md`](../../.agent/release/release-policy.md)
defines seven states: **planning** → **implementation** → **validation** →
(**readyWithWarnings** | **ready** | **blocked**) → **released**. A manual
review that is "not run" or "assumed fine" keeps a release at
`readyWithWarnings` at best — it is never silently promoted to `ready`. Only
an explicit user decision moves a release to `released` (i.e. authorizes
the push/merge/deploy); no state transition implies that authorization by
itself. A state regression (e.g. `ready` → `blocked` because a late issue
surfaced) is reported plainly, never smoothed over.

## Mapping to `npm run validate:release`

`validate:release` runs the full automated gate chain — lint, unit tests,
coverage, build, catalog check, docs check, quality inventory, full E2E,
journeys, UX, accessibility, visual, performance, quality collection/
analysis/system-report, Pages E2E, and `git diff --check` — see
[`../quality-gates.md`](../quality-gates.md) for the complete gate table.
A **validation**-state release runs this chain (and
`npm run quality:evidence:full`, per
[`../../.agent/release/release-evidence.md`](../../.agent/release/release-evidence.md))
to generate the evidence a state transition requires. The chain passing
moves a release to `readyWithWarnings` or `ready` depending on whether the
three manual reviews (`manualUxReview`, `manualSecurityReview`,
`manualContentReview`) are actually complete — see
[`evidence-system.md`](evidence-system.md). Any failed required gate keeps
the release at `blocked`.

## Module index

| Module | Governs |
| --- | --- |
| [`release-policy.md`](../../.agent/release/release-policy.md) | The state machine above. |
| [`versioning.md`](../../.agent/release/versioning.md) | SemVer + beta-tag convention across `package.json`, footer, About, and AOS. |
| [`changelog.md`](../../.agent/release/changelog.md) | Keep-a-Changelog-style rules for `CHANGELOG.md`. |
| [`release-checklist.md`](../../.agent/release/release-checklist.md) | Concrete checklist mapped to `validate:release` and the evidence system. |
| [`release-evidence.md`](../../.agent/release/release-evidence.md) | The evidence run required specifically at release time. |
| [`deployment-verification.md`](../../.agent/release/deployment-verification.md) | Post-deploy checks for GitHub Pages builds. |
| [`rollback.md`](../../.agent/release/rollback.md) | Safe rollback options if a release is found broken after merge. |
| [`release-report.md`](../../.agent/release/release-report.md) | Required structure for the release completion report. |

## Rules worth repeating

- A release only reaches **ready** if every manual review actually
  happened — not skipped, not assumed.
- Evidence backing a `validation` → `ready`/`readyWithWarnings`/`blocked`
  transition must have been generated for this specific candidate, never
  reused from an earlier, different change.
- Coverage thresholds are never lowered to reach `ready` — see
  [`../quality-gates.md`](../quality-gates.md)'s coverage policy.

## Related

[`../../.agent/quality/release-gates.md`](../../.agent/quality/release-gates.md),
[`../../.agent/git/merge-policy.md`](../../.agent/git/merge-policy.md), and
`/aos/releases` for the in-app view of release state.
