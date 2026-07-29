# Version 1.8.0-beta.1 — Agent Teams and Learning Intelligence

## Release identity

- Baseline SHA: `fe1e63843db436098a6d4888c4c58289814c2339`
- Baseline version: `1.7.0-beta.4`
- Branch: `feature/1.8-agent-teams-learning-intelligence`
- Target: `1.8.0-beta.1`
- Risk: High — user-owned storage migration, complex UI, release and deployment

## Product objective

Turn the Academy into a guided, explainable Agent Team workspace. A mission
must expose interpretation, acceptance criteria, a recommended team, a
sequential plan, approval gates, evidence, learning outcomes and durable
Pause/Continue state. Version 1.8 never represents simulation as autonomous or
connected execution.

## Controlling modules

1. [Product requirements](01-product-requirements.md)
2. [Information architecture](02-information-architecture.md)
3. [Agent Team model](03-agent-team-model.md)
4. [Mission runtime](04-mission-runtime.md)
5. [Learning intelligence](05-learning-intelligence.md)
6. [Community adaptation](06-community-agent-import.md)
7. [Security and privacy](07-security-privacy.md)
8. [Test strategy](08-test-strategy.md)
9. [Release plan](09-release-plan.md)
10. [Rollback plan](10-rollback-plan.md)

## Scope

In scope: Team Builder, Conductor, permissions, mission workspace, explanation,
guidance modes, Skill Map, presets, curated community templates, safe execution
levels, Context Packs, dashboard/help integration, actor-scoped persistence,
migration, backup, tests and release.

Out of scope: unrestricted autonomy, browser-held credentials, external writes,
network agent imports, live AI providers, background execution and cloud sync.
Existing lessons, prompts, Radar, AOS and WALK ME remain supported.

## Implementation plan

1. Define bounded domain models, validators, catalogs and deterministic state
   transitions.
2. Add actor-scoped repositories with quarantine, migration, independent reset
   and transactional backup support.
3. Add a provider/context boundary and the Team Builder/Mission routes.
4. Integrate navigation, dashboard, Help Center, i18n and responsive styles.
5. Add unit, component, E2E, accessibility, visual and storage coverage.
6. Update version, docs, release metadata and rollback guidance.
7. Run focused gates, full release evidence, PR exact-SHA CI, main CI, tag,
   deployments and production smoke.

## Acceptance contract

- Exactly one Conductor and no more than eight unique active agents.
- Built-in teams/templates are immutable; user copies are editable and retain
  attribution.
- No agent can approve its own work; connected execution always requires a
  fresh explicit human approval and remains unavailable in this release.
- Pause persists the exact phase and Continue detects state drift before any
  mutation.
- Skill progress is derived only from completed lessons, exercises or missions.
- Import is bounded, inert, checksummed, previewed and rolled back on failure.
- Every user-visible flow is bilingual and keyboard-operable.
- Release is authorized only by green exact-SHA CI and post-deploy smoke.
