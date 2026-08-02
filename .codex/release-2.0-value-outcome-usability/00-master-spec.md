# Version 2.0 Value, Outcome and Usability release specification

## Release identity

- Target version: `2.0.0-beta.1`
- Delivery branch: `feature/2.0-value-outcome-usability`
- Verified release base: `59b4478c90bd30056d5e1bb795002caee490c17b`
- Required Conventional Commit: `feat(release): add Version 2.0 outcome experience`
- Version bump timing: only after implementation and focused tests pass
- Release order: Version 1.9 post-deployment verification, then Version 2.0

## Product boundary

Version 2.0 turns meaningful local work into explicit, reusable outcomes. It is
not an integrations release and it does not add Live AI, autonomous teams, RAG,
cloud sync, or provider execution. Every capability must disclose one of:
`Live`, `Local`, `Simulated`, `Blueprint only`, `Manual action required`, or
`Not connected`.

## Controlling documents

1. This master specification.
2. [Outcome matrix](01-outcome-matrix.md).
3. [Data and migration contract](02-data-migration.md).
4. [Verification and release plan](03-verification-release.md).
5. Repository AOS and engineering standards.

## Mandatory release gates

1. Shared Outcome, Deliverable, Evidence and Result contracts are implemented.
2. Prompt, Agent Blueprint, Team Specification, Mission, Project, Workflow,
   Knowledge and Lesson flows create or link useful results.
3. Mission and Lesson completion cannot be earned by an unsubstantiated click.
4. Version 1.9 data remains readable; migration is idempotent and recoverable.
5. Backup and restore include Version 2.0 domains without exposing secrets.
6. Hebrew/English, RTL/LTR, keyboard, screen-reader, mobile and reduced-motion
   behavior is verified.
7. Unit, integration, E2E, accessibility, visual, performance, security and
   release evidence pass without weakening thresholds or baselines.
8. Human UX, content and security reviews, plus an independent Reality Check,
   are passed before merge.
9. Exact-SHA PR CI, main CI, deployment provenance and production smoke pass.

## Stop conditions

Do not merge when any Critical or High issue is open, when a result action is a
dead end, when completion can be falsely claimed, when migration loses user
data, when a reality claim exceeds implementation, or when manual review is not
explicitly passed by a human reviewer.
