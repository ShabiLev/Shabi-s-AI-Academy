# Agent Operating System (AOS)

The AOS is the single operational framework that controls how AI coding
agents (OpenAI Codex, Claude Code, and compatible future agents) work inside
Shabi's AI Academy. It is documentation and tooling, not a running service:
every file here is either an instruction module an agent reads before acting,
or a script that validates those instructions stay consistent.

AOS version: see [`VERSION`](VERSION).
Application version this AOS ships with: `1.4.0-beta.1`.

## Why this exists

Before the AOS, agent behavior was defined by a mix of `AGENTS.md`,
`.codex/` release specs and standards, and ad-hoc conversation instructions.
That worked, but it duplicated workflow rules across files and gave no
single place to check "what modules apply to this task" or "what evidence is
required before I stop." The AOS does not replace `.codex/` or `AGENTS.md` —
it sits alongside them as the orchestration layer that tells an agent *when*
and *in what order* to read them.

## Entry point

Start at [`master.md`](master.md). It defines the loading sequence, task
classification, and stop conditions. Everything else is loaded on demand
through [`registry.json`](registry.json), never all at once.

## Structure

| Path | Purpose |
| --- | --- |
| `master.md` | Orchestration entry point: version, loading order, precedence, stop conditions |
| `manifest.json` | Machine-readable list of every module: path, purpose, category, dependencies, status |
| `registry.json` | Maps task types to the modules required for that task |
| `precedence.md` | Instruction precedence order and conflict-resolution rule |
| `compatibility.md` | What Codex and Claude Code must each do to bootstrap the AOS |
| `changelog.md` | AOS version history (separate from the application `CHANGELOG.md`) |
| `workflow/` | Step-by-step process modules (development, testing, release, etc.) |
| `loaders/` | Task classification logic |
| `knowledge/` | Project-specific interpretation of technical domains, linking to `.codex/` |
| `research/` | Research intake policy, source ranking, freshness, knowledge ingestion |
| `quality/` | Test selection, evidence, coverage, release gates |
| `security/` | Security policy modules, including MCP and AI-specific risks |
| `git/` | Branching, commit, merge, and recovery policy |
| `release/` | Versioning, release checklist, rollback |
| `templates/` | Reusable document templates (plans, reports, reviews) |
| `prompts/` | Task-type prompt templates that load shared AOS workflows |
| `agents/` | Operational role definitions (not autonomous agents) |
| `memory/` | Explicit, file-based memory policy and categories |
| `handoff/` | Cross-agent (Codex ↔ Claude Code) handoff protocol |
| `schemas/` | JSON Schemas for research and evidence data structures |

## Entry points for each agent

- OpenAI Codex: [`.codex/workflows/aos.md`](../.codex/workflows/aos.md)
- Claude Code: [`.claude/workflows/aos.md`](../.claude/workflows/aos.md)

Both files are thin pointers back into `.agent/` — see
[Single Source of Truth](#single-source-of-truth).

## Single source of truth

`.agent/` is authoritative. `.codex/workflows/aos.md` and
`.claude/workflows/aos.md` must never contain full workflow rules — only the
minimum bootstrap needed to tell that agent to come here next. Run
`npm run aos:check` to detect drift (duplicated workflow content, broken
links, orphan modules, stale version references).

## Validation

```
npm run aos:check             # full validation
npm run aos:check:manifest    # manifest schema and completeness
npm run aos:check:links       # cross-file links resolve
npm run aos:check:schemas     # schemas/*.json are valid JSON Schema
npm run aos:check:duplication # no duplicated workflow content
npm run aos:report            # human-readable status report
```

## Non-negotiables

See [`master.md`](master.md#non-negotiable-principles) for the full list.
The short version: one source of truth, no push/merge without explicit
authorization, evidence required for every substantial task, security
precedence cannot be overridden by task instructions, and no module may
duplicate another module's workflow rules.
