# Memory

## Purpose

Distinguish three unrelated things this repo calls "memory" so an agent
writes to the correct one and never confuses AOS's own operating memory
with in-app data.

## Authoritative source(s)

- `.agent/memory/memory-policy.md`, `.agent/memory/project-memory.md`,
  `.agent/memory/task-memory.md`, `.agent/memory/decision-memory.md`,
  `.agent/memory/failure-memory.md`, `.agent/memory/research-memory.md`
  (see `.agent/manifest.json` category `memory` for each file's one-line
  purpose)
- `src/agents/types.ts` (`MemoryStrategy` field on the `Agent` model)
- `.codex/architecture/storage.md` (browser `localStorage`)

## Project-specific interpretation

**AOS file-based memory (`.agent/memory/`):** this is the coding agent's own
durable operating memory about the *repository and the task*, categorized
as project facts, current task state, architecture/process decisions
(cross-referenced with ADRs), known failures/rejected approaches, and
research findings. It is read/written by the AI agent doing repo work, per
`memory.memory-policy` and the category-specific files; it is not rendered
in the product UI and has no runtime relationship to the app.

**In-app `MemoryStrategy` field:** a label on an `Agent` record
(`"none" | "conversation" | "session" | "longTerm" | "rag" | "custom"`) that
a learner picks in the Agent Builder to describe, conceptually, what memory
approach their designed agent *would* use if it were real. Selecting it
changes no runtime behavior — `agentSimulation.ts` does not branch on
`memoryStrategy` to actually persist or recall anything beyond the fixed
simulated steps.

**Browser `localStorage`:** the actual persistence mechanism for all
shipped app state (course progress, prompts, agents, settings, etc.), fully
described in `.agent/knowledge/storage.md` — unrelated to either of the
above "memory" concepts.

## Constraints

- Never write AOS operating memory (`.agent/memory/`) into application
  source, `localStorage`, or Supabase tables — it belongs only under
  `.agent/memory/` per `memory.memory-policy`.
- Never treat the in-app `memoryStrategy` value as if choosing `"longTerm"`
  or `"rag"` actually enables persistent or retrieval-based recall for that
  simulated agent — it does not, per `ai-agents.md` and `rag.md`.
- Follow `memory.memory-policy` for what may/may not be stored in AOS
  memory (no secrets, no fabricated task state) — this file does not
  restate those rules.

## Known limitations

- This file does not itself define memory categories in detail; read
  `.agent/memory/*.md` directly for a given task rather than relying on this
  summary alone.
- There is no code-level guard preventing someone from misreading the
  in-app `memoryStrategy` label as a real feature; the correction is
  documentary (this file, `ai-agents.md`) rather than a UI change requested
  by this task.

## Current implementation status

AOS file-based memory: active and in use per `.agent/manifest.json`.
In-app `memoryStrategy`: shipped as a descriptive form field only, with zero
runtime effect beyond being displayed back to the learner.
