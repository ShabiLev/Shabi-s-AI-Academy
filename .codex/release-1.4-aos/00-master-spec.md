# Agent Operating System 1.4.0-beta.1

## Status

- Baseline: `0bdf19b729a8409b5f7d0bc990a026e2f708a2c2`, Version `1.3.0-beta.1`
- Branch: `feature/1.4.0-agent-operating-system`
- Target: `1.4.0-beta.1`
- Milestone: AOS Release Stabilization, Validation and Completion
- AOS protocol version: `1.0.0`

## Objective

Ship one repository-owned Agent Operating System that classifies work, loads
bounded instruction modules, preserves security and Git authorization, records
honest evidence, and exposes safe read-only status in the bilingual application.
All Version 1.3 capabilities remain supported.

## Controlling modules

1. [Architecture](01-architecture.md)
2. [Module registry](02-module-registry.md)
3. [Research](03-research.md)
4. [Evidence](04-evidence.md)
5. [Security](05-security.md)
6. [Git and release](06-git-release.md)
7. [UI](07-ui.md)
8. [Testing](08-testing.md)
9. [Release](09-release.md)

## Invariants

- `.agent/master.md`, its manifest, and registry are the single AOS source.
- `.codex/workflows/aos.md` and `.claude/workflows/aos.md` remain thin pointers.
- Research input is explicit, bounded, inert, cited, and never auto-published.
- Evidence reports failures, missing commands, dependencies, and manual gates honestly.
- AOS UI uses generated safe metadata; it never crawls repository files in-browser.
- Human review and push/merge authorization cannot be inferred or automated.

## Delivery contract

Complete [Release](09-release.md), record a current evidence run, preserve
manual-review statuses until a human reviewer acts, and stop before push or merge.
