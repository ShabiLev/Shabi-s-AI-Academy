# AI Workspace Testing

Unit/component coverage includes search normalization/ranking/filtering, command registry/execution/history, assistant intents/honesty/actions, builder scores/tests/history/diff, workflow validation/runs/approvals/storage, activity, notifications, analytics privacy, backup validation/conflicts/rollback, migrations, corruption recovery, reset isolation, and security boundaries.

Playwright covers the 25 journeys in the release request across English/Hebrew, desktop/mobile, refresh, keyboard, assistant, workflows, backup, notifications, analytics, no-network, and RTL/LTR. Axe covers every complex surface. Reviewed visuals cover representative desktop/mobile states; validation never auto-updates snapshots. Lighthouse covers Dashboard, Search, Assistant, Workflow Builder, and Analytics without lowering thresholds.

Manual review remains explicit for Hebrew search/copy, keyboard/focus, assistant honesty, workflow usability, privacy, mobile layout, duplicated status/header, and overflow. Only observed results may be reported.

## Acceptance

No gate is weakened, skipped silently, or reported as passed without execution.
