# Result interpretation

| Command or gate | Status | Root cause / classification | Severity | Fix and verification | Residual risk / evidence |
| --- | --- | --- | --- | --- | --- |
| `npm run test:visual` | failed (35/60) | Reviewed Windows baselines predate current rendering; visual missing/stale baseline | High | Preserve images; review expected/actual/diff before any update | `quality/execution/runs/2026-07-21_15-26-05_fix-1-4-0-ci-memory-visual-release/visual.log` |
| `visual-linux` | not locally verifiable | No committed `*-linux.png`; missing baseline | High | Run reviewed Linux workflow and commit only human-approved images | `docs/visual-regression.md` |
| `npm run quality:analyze` | warning/blocking release policy | Correctly reflects visual and manual review gates | High | No bypass; reports remain blocked | `quality/execution/latest/summary.json` |
| `npm run release:main-ready` | expected blocked | Visual, manual approvals, evidence finalization, and external rules; release policy | High | Finalize evidence then recheck; human/admin actions remain | `.agent/state/release-status.json` |
| `npm audit --json` | warning | Transitive Lighthouse/lint dependencies; dependency issue | High | Compatible lock reconciliation; no breaking force downgrade | `quality/generated/release-recovery-audit.json` RR-013 |
| GitHub main ruleset | unverified | Repository setting outside source; external configuration | High | Administrator follows documented exact steps | `docs/github-branch-protection.md` |

All other commands in the full run passed. Node 20.17 engine warnings are a local environment issue; CI pins supported Node 20.19.0.
