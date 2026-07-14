# Release Evidence

## Purpose

The evidence run required specifically at release time, distinct from the
lighter-weight evidence expected during ordinary development.

## Rule

At release time, run:

```
npm run quality:evidence:full
```

(`package.json` script: `"quality:evidence:full": "node
scripts/run-quality-evidence.mjs full"`) — the `full` mode, not
`quality:evidence` / `quality:evidence:fast`. Day-to-day feature/bugfix
work may use the fast profile per
[`../quality/evidence.md`](../quality/evidence.md) and
[`../quality/test-selection.md`](../quality/test-selection.md), but a
release candidate requires the full evidence run because it exercises the
broader suite the fast profile intentionally skips.

## Rules

- The command must actually be executed for this specific release
  candidate; evidence from an earlier commit or a different branch does
  not satisfy this requirement, since the point is to prove *this* code
  state.
- Output lands under `quality/execution/latest/` (summaries, tracked) and
  `quality/execution/runs/` (full artifacts, gitignored per `../master.md`
  principle 14) — see [`../quality/evidence.md`](../quality/evidence.md)
  for the exact file set produced by `scripts/run-quality-evidence.mjs`.
- A command that does not exist or cannot run in the current environment
  is recorded as `notAvailable`, never as passed — per `../master.md` §6.
- `quality:evidence:full` runs alongside, not instead of,
  `npm run validate:release` (see
  [`release-checklist.md`](release-checklist.md)) — they are
  complementary, not redundant: `validate:release` is the CI-style gate
  sequence, `quality:evidence:full` produces the AOS-consumable structured
  evidence artifacts.
- Evidence output must be scrubbed of secrets/personal data per
  [`../security/logging.md`](../security/logging.md) before being treated
  as committable.
- The release state determination in
  [`release-policy.md`](release-policy.md) is based on what this evidence
  run actually shows, not on an assumption that it would pass.

## Related

[`release-checklist.md`](release-checklist.md), [`release-policy.md`](release-policy.md),
[`../quality/evidence.md`](../quality/evidence.md).
