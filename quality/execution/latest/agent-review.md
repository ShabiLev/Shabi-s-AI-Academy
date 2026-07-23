# Agent review

This automated policy review does not represent a second human or agent and does not approve subjective release gates. It verifies that:

- mandatory CI jobs are isolated and the aggregate summary fails closed when a result is absent or unsuccessful;
- evidence records separate source, runtime, target, tested, and recording identities across local, push, pull-request, main, and detached contexts;
- Pages consumes only a successful main-push CI result and builds the exact tested SHA;
- Playwright gates build and exercise a production preview, eliminating the reproducible cold dev-server navigation race;
- visual baseline generation remains manual, exact-phrase gated, read-only, platform-specific, and unable to commit or push;
- the authoritative full run passed every automated non-visual gate and remains blocked on 35 Windows visual mismatches, zero reviewed Linux baselines, and unperformed human reviews;
- GitHub Actions run 29838207418 proved all independent non-visual jobs green; the subsequently corrected summary artifact layout preserves the performance report at `quality/generated/lighthouse`;
- dependency findings remain disclosed rather than applying a breaking audit-force downgrade;
- no file under `.codex/` was modified.
