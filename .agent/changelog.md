# AOS Changelog

This tracks the AOS framework itself (`.agent/VERSION`), separate from the
application's [`CHANGELOG.md`](../CHANGELOG.md). Every AOS version change
must be recorded here.

## [1.0.0] — introduced with application 1.4.0-beta.1

### Added

- Initial Agent Operating System: `master.md` orchestration entry point,
  `manifest.json` module catalog, `registry.json` task-to-module mapping,
  `precedence.md` conflict resolution, `compatibility.md` for Codex/Claude
  Code.
- Workflow modules covering development, planning, implementation, testing,
  debugging, refactoring, documentation, deployment, UI/UX/accessibility/
  performance validation, research, knowledge ingestion, self-review, and
  final reporting.
- Task classification (`loaders/task-classifier.md`) with Low/Medium/High/
  Critical risk levels.
- Knowledge modules interpreting project standards for React, TypeScript,
  state management, routing, storage, testing, accessibility, security,
  performance, i18n/RTL-LTR, Git, GitHub Actions/Pages, Supabase, and AI/
  agent-specific topics (prompt engineering, MCP, RAG, memory, tool calling,
  evaluation, observability, AI safety).
- Research operating system: policy, workflow, source ranking (four-tier
  model), freshness policy, claim verification, citation policy, duplicate
  detection, and per-source-type analysis guides (repository, paper, news,
  release notes).
- Knowledge ingestion pipeline (discover → dedupe → rank → extract → verify
  → summarize → link → generate candidates → human review → publish).
- Evidence operating system integrated with the existing
  `scripts/run-quality-evidence.mjs` and `quality/execution/` structure.
- Security operating system, including MCP-specific and AI-specific policy
  modules.
- Git operating system (branch strategy, commit policy, merge policy,
  synchronization, recovery, pull request, cleanup).
- Release operating system (versioning, changelog, checklist, evidence,
  deployment verification, rollback, release report).
- Multi-agent handoff system for Codex ↔ Claude Code continuity.
- Explicit, file-based memory model (no hidden agent memory).
- AOS dashboard at `/aos` with subroutes for modules, research, evidence,
  handoffs, security, and releases.
- AOS validation scripts (`aos:check` and subcommands).
- Research automation foundation under `research/` with explicit,
  rate-limited, attributable source handling — no uncontrolled crawling.

### Changed

- `AGENTS.md` and `CLAUDE.md` now point to `.agent/master.md` as the
  orchestration entry point instead of describing workflow steps inline.

### Security

- AOS prevents automatic destructive Git behavior (no auto push/merge,
  no `reset --hard`, no `add -A`).
- Research content is treated as inert data, never executed.
- Evidence logs are redacted of secrets before being saved or committed.
- MCP write-capable and destructive tools require explicit approval.
- Secret-bearing data is prohibited from AOS memory files.
