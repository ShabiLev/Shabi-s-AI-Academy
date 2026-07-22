# Version 1.5.0-beta.1 — AOS Core, UX Simplification and Live AI Radar

Status: implementation release candidate. Upstream dependency: `fix/1.4.0-ci-memory-visual-release`.

The release delivers the first in-application AOS Core, a safe provider-based AI Radar, and a simplified bilingual workspace. It preserves local-first ownership, human approval, exact-SHA CI evidence, and all mandatory release gates.

Controlling modules: [UX](01-ux-simplification.md), [Radar](02-live-ai-radar.md), [Event Bus](03-event-bus.md), [Scheduler](04-scheduler.md), [Capability Registry](05-capability-registry.md), [Security](06-security.md), [Testing](07-testing.md), [CI](08-ci-deployment.md), and [Release](09-release.md).

No merge or push to `main` is permitted unless every required check, including the mandatory visual gate and human approvals, succeeds for the exact current HEAD SHA.
