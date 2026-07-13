# Shabi's AI Academy Engineering Kit

## Purpose and versions

This directory is the authoritative engineering source of truth for architecture, standards, decisions, and Sprint specifications. It turns product intent into implementable constraints without replacing the application README or CHANGELOG.

- Engineering Kit: **1.0.0**
- Current application: **1.1.0-beta.1**
- Planned application: **1.2.0-beta.1**
- Active work: **AI Radar & UX Hardening 1.2 release**

## Table of contents

- [Architecture overview](architecture/overview.md)
- [Architecture folder](architecture/folder-structure.md)
- [Coding standards](standards/coding.md)
- [QA handbook](standards/qa.md)
- [Security standard](standards/security.md)
- [Accessibility standard](standards/accessibility.md)
- [ADR index](adr/README.md)
- [Roadmap](roadmap/roadmap.md)
- [Sprint 7 master specification](sprint-7/00-master-spec.md)
- [Sprint 7 handoff](sprint-7/handoff.md)
- [1.0 beta master specification](release-1.0-beta/00-master-spec.md)
- [1.0 beta handoff](release-1.0-beta/handoff.md)
- [1.1 AI Workspace master specification](release-1.1-ai-workspace/00-master-spec.md)
- [1.1 AI Workspace handoff](release-1.1-ai-workspace/handoff.md)
- [1.2 AI Radar & UX Hardening master specification](release-1.2-ai-radar-ux/00-master-spec.md)
- [Templates](templates/feature.md)
- [Codex prompts](prompts/feature-template.md)

## Source hierarchy

Apply the first applicable source in this order:

1. Root [AGENTS.md](../AGENTS.md)
2. This index
3. [Architecture overview](architecture/overview.md)
4. [Engineering standards](standards/coding.md)
5. Active Sprint master specification
6. Referenced Sprint module specifications
7. Templates and ADRs

An active accepted ADR overrides older architecture prose. Security and privacy constraints override feature convenience. The active Sprint overrides generic templates. Never invent application behavior where the hierarchy is silent; record an assumption only when reversible and non-material, otherwise request a decision.

## Folder map

- `architecture/`: current system boundaries and dependency direction.
- `standards/`: mandatory daily engineering and review rules.
- `adr/`: durable accepted decisions and alternatives.
- `roadmap/`: completed, committed, planned, and idea-level work.
- `sprint-7/`: archived 0.7.0 implementation specification.
- `release-1.0-beta/`: preserved 1.0.0-beta.1 release specification.
- `release-1.1-ai-workspace/`: controlling 1.1.0-beta.1 release specification.
- `release-1.2-ai-radar-ux/`: controlling 1.2.0-beta.1 release specification.
- `templates/`: fill-in engineering artifacts.
- `prompts/`: operational prompts for Codex workflows.
- `VERSION`: Engineering Kit version only.

## Operating workflows

### Develop a feature

Read the hierarchy, copy [feature.md](templates/feature.md), resolve open decisions, implement in small phases, update tests/docs, run `npm run validate:release`, create the Sprint-defined commit, and stop before push.

### Report and fix a bug

Capture reproduction and evidence using [bug.md](templates/bug.md). Search for the responsible boundary, add a regression test, implement the smallest safe correction, validate, and document user-visible effects.

### Create an ADR

Copy [adr.md](templates/adr.md), use the next available ID, document alternatives and consequences, link affected architecture/Sprint files, and mark it Proposed until accepted.

### Begin a Sprint

Copy [sprint.md](templates/sprint.md); declare baseline, target version, scope, dependencies, delivery sequence, gates, and commit contract. Link every module specification from its master spec.

### Close a Sprint

Complete the Definition of Done and manual checklist, run all release gates, update README/CHANGELOG/How To/roadmap, create one clean Conventional Commit, report limitations, and stop before push.

## Versioning and maintenance

Application versions follow [versioning.md](standards/versioning.md); Kit versions are independent semantic versions. Update docs in the same change as the behavior they govern. Links must remain relative and pass `npm run docs:check`. Remove obsolete sources only after references and unique content are migrated. Accepted ADRs are historical records and are superseded, not silently rewritten.
