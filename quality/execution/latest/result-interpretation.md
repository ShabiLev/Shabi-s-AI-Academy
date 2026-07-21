# Result interpretation

| Command or gate | Status | Root cause and classification | Severity | Fix / verification | Residual risk and evidence |
| --- | --- | --- | --- | --- | --- |
| `npm audit --json` | warning | Transitive Lighthouse/lint dependencies; dependency issue | High | Compatible lock reconciliation completed; no breaking `--force` downgrade | Upstream advisory remains; `release-recovery-audit.json` RR-013 |
| `npm run test:visual` | pending rerun | Existing Windows baselines require current comparison; missing Linux baseline | High | Run locally and through reviewed Linux workflow | Human review required; `docs/visual-regression.md` |
| `visual-linux` | blocked | No committed `*-linux.png`; missing baseline | High | Generate artifact with exact confirmation, review, commit approved images | Human visual judgment cannot be automated |
| `npm run release:main-ready` | expected blocked | Manual reviews, missing Linux baselines, stale/pre-final evidence; external configuration/release policy | High | Guard intentionally fails closed | Owners: release reviewer and repository administrator |
| GitHub main ruleset | unverified | Repository setting outside source control; external configuration | High | Administrator follows `docs/github-branch-protection.md` | Direct-push prevention not claimed active |

Warnings from the local Node 20.17 engine are an environment issue: CI pins Node 20.19.0, which satisfies the dependency requirement. No test result is promoted to passed until its current command finishes successfully.
