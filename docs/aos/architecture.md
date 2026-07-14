# AOS architecture

How the AOS's files fit together: one entry point, one machine-readable
catalog, one task lookup table, and a set of small subject-area modules
loaded on demand.

## The core files

| File | Role |
| --- | --- |
| [`../../.agent/master.md`](../../.agent/master.md) | Orchestration entry point: loading sequence, precedence summary, task classification pointer, mandatory final workflow, stop conditions, non-negotiable principles. |
| [`../../.agent/manifest.json`](../../.agent/manifest.json) | The authoritative catalog of every module: id, path, title, purpose, category, `requiredFor`, `dependsOn`, version, owner, status. |
| [`../../.agent/registry.json`](../../.agent/registry.json) | Maps each of the 22 task types to the ordered list of module IDs required for that task. |
| [`../../.agent/precedence.md`](../../.agent/precedence.md) | The eight-tier instruction precedence order and conflict-resolution rule. |
| [`../../.agent/compatibility.md`](../../.agent/compatibility.md) | What Codex and Claude Code must each do to bootstrap, and what their entry-point files must never contain. |

## How a task actually resolves modules

1. An agent reads `master.md`, then its own bootstrap file
   (`.codex/workflows/aos.md` or `.claude/workflows/aos.md`).
2. `.agent/loaders/task-classifier.md` determines task type and risk level.
3. The task type is looked up in `registry.json`'s `taskTypes` map, which
   yields an ordered list of module IDs (or, for `research`/`knowledge
   ingestion`, some bare paths — see that file's `taskTypeModuleListsNote`).
4. Each entry is resolved against `manifest.json` to get its real file path.
5. Only those modules are loaded — never the whole `.agent/` tree.
6. If two loaded instructions conflict, `precedence.md` decides which wins;
   an unresolvable conflict is a stop condition, not a guess.

## Subdirectories, by category

| Directory | Contains |
| --- | --- |
| [`workflow/`](../../.agent/workflow/) | Step-by-step process modules (development, testing, debugging, release, UX/accessibility/performance validation, self-review, final report). |
| [`loaders/`](../../.agent/loaders/) | Task classification logic. |
| [`knowledge/`](../../.agent/knowledge/) | Project-specific interpretation of technical domains, linking back to `.codex/standards/`. |
| [`research/`](../../.agent/research/) | Research intake policy, source ranking, freshness, and the knowledge-ingestion pipeline. See [`research-system.md`](research-system.md). |
| [`quality/`](../../.agent/quality/) | Test selection, evidence, coverage, release gates. See [`evidence-system.md`](evidence-system.md). |
| [`security/`](../../.agent/security/) | Security policy modules, including MCP and AI-specific risk. See [`security.md`](security.md). |
| [`git/`](../../.agent/git/) | Branching, commit, merge, and recovery policy. See [`git-workflow.md`](git-workflow.md). |
| [`release/`](../../.agent/release/) | Versioning, release checklist, rollback. See [`release-workflow.md`](release-workflow.md). |
| [`templates/`](../../.agent/templates/) | Reusable document templates (plans, reports, reviews). |
| [`prompts/`](../../.agent/prompts/) | Task-type prompt templates that load shared AOS workflows. |
| [`agents/`](../../.agent/agents/) | Operational role definitions (developer, QA engineer, reviewer, etc.) — not autonomous agents. |
| [`memory/`](../../.agent/memory/) | Explicit, file-based memory policy and categories. |
| [`handoff/`](../../.agent/handoff/) | Cross-agent (Codex ↔ Claude Code) handoff protocol. See [`handoffs.md`](handoffs.md). |
| [`schemas/`](../../.agent/schemas/) | JSON Schemas for research and evidence data structures. |

## Single source of truth

`.agent/` is authoritative. Agent bootstrap files
(`.codex/workflows/aos.md`, `.claude/workflows/aos.md`) must only be thin
pointers into it — never full workflow rules. `npm run aos:check` detects
drift: duplicated workflow content, broken links, orphan modules, and stale
version references. See [`module-system.md`](module-system.md).

## The in-app view

The same structure is browsable at `/aos` (overview) and its subroutes
`/aos/modules`, `/aos/research`, `/aos/evidence`, `/aos/handoffs`,
`/aos/security`, `/aos/releases`, backed by the generated snapshot
(`npm run aos:snapshot`, written to `public/generated/aos-snapshot.json`).
