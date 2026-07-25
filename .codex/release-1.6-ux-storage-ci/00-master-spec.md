# Version 1.6.0-beta.1 master specification

Status: implementation candidate; human UX, visual, content, and security approval remains required.

## Objective

Deliver UX Simplification, CI Stabilization and Runtime Storage Hygiene without removing existing user capabilities or user-owned data.

## Product acceptance criteria

- Dashboard contains a compact welcome, one continuation section, exactly four primary task tiles, and a subtle recommendation link.
- Beginner Mode is the default and exposes Home, Learn, Prompts, Agents, Projects, AI Radar, History, and Help.
- Advanced Mode additionally exposes Playgrounds, Workflows, Runtime, QA Center, AOS, Knowledge, Analytics, Capability Registry, Scheduler, and Settings.
- Onboarding contains no more than four decisions, can be skipped, shows progress, and produces an editable recommendation.
- Dashboard, navigation, Prompt, and Agent contextual hints are dismissible and Help remains persistently available.
- Preferences are scoped per user and do not leak after sign-out or user switching.
- Hebrew and English, RTL/LTR, keyboard operation, mobile drawer behavior, accessibility, and responsive layouts remain supported.

## Quality and storage acceptance criteria

- Runtime evidence is bounded to latest, last-success, last-failed, bounded history metadata, and explicit archives.
- Cleanup commands support dry-run, are idempotent, and cannot target baselines, archives, configuration, inventory, or approved evidence.
- CI records exact SHA, run attempt, job identity, environment fingerprint, file sizes, and SHA-256 checksums.
- Linux runner, Node version, timezone, locale, workers, and visual-candidate process are explicit.
- Visual-candidate generation does not auto-approve or commit baselines and must pass ten identical comparisons before review.
- Three clean builds must produce identical file hashes.

## Mandatory verification

Run `npm run validate:release`, `npm run test:storage`, `npm run quality:baseline-integrity`, `npm run quality:build-determinism`, `npm run retention:verify`, and `git diff --check`.

Release readiness is blocked until Linux visual comparison, GitHub Actions, and all required human reviews are confirmed.
