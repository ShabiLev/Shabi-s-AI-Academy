# AI Agents

## Purpose

Prevent the single most likely AOS confusion in this repo: "agent" means two
unrelated things here, and conflating them will produce wrong or dangerous
suggestions.

## Authoritative source(s)

- [.codex/adr/ADR-005-starter-catalog-separation.md](../../.codex/adr/ADR-005-starter-catalog-separation.md)
- [.codex/adr/ADR-010-human-approval-for-risky-actions.md](../../.codex/adr/ADR-010-human-approval-for-risky-actions.md)
- [.codex/architecture/runtime.md](../../.codex/architecture/runtime.md)
- `src/agents/` (`types.ts`, `agentSimulation.ts`, `agentQuality.ts`,
  `agentStorage.ts`), `src/agents/catalog/starterAgents.ts`,
  `src/pages/AgentsPage.tsx`, `src/pages/StarterAgentsPage.tsx`
- `.agent/agents/*.md` (AOS operational agent-role files, see
  `.agent/manifest.json` category `agents`)

## Project-specific interpretation

**Meaning 1 — in-app "Starter Agents" / Agent Builder (learning content):**
This is a course feature. Learners author an `Agent` record (role, goal,
instructions, declared tools, memory strategy, retry policy, approval
points — `src/agents/types.ts`) and can "simulate" it via
`simulateAgent()` in `agentSimulation.ts`, which walks a fixed, deterministic
sequence of labeled stages ("Goal received" → … → "Completion criteria
checked") and returns canned step results — it calls no LLM and no external
tool. Every tool in `toolCatalog` has `connectionStatus: "notConnected"`,
and the simulation explicitly appends a warning ("Tool not connected — no
external call was made") whenever a non-`"none"` tool is selected.
`StarterAgentsPage.tsx` even states this to the learner directly: "Read-only
templates for import, Mock, and Dry Run. Every tool is planned and not
connected." Nothing under `src/agents/` executes autonomously or reaches a
real system.

**Meaning 2 — AOS operational agent roles (`.agent/agents/*.md`):** These
are instruction files that tell an AI coding agent (Claude Code, Codex) what
role to adopt while doing repo work (`architect`, `developer`,
`qa-engineer`, `security-reviewer`, etc.). They are prompts for the coding
agent operating on this repository — they have nothing to do with the
in-app `Agent` data model and are never rendered in the product UI.

## Constraints

- Never describe the in-app Starter Agents/Agent Builder feature as
  "autonomous," "connected," or capable of taking real external action —
  it is explicitly simulation-only by design (ADR-010's 1.4 status: "only
  simulates approvals").
- Never let an AOS operational agent role (`.agent/agents/*.md`) be
  presented to a user as if it were an in-app Starter Agent, or vice versa.
- When an `agent creation` task (per `registry.json`) is ambiguous about
  which meaning is intended, ask — do not guess, since the required modules
  and risk profile differ completely (`prompts.ai-agent` +
  `knowledge.ai-agents` for the in-app feature vs. `agents.agent-designer`
  for an AOS role).

## Known limitations

- The in-app feature's name ("Starter Agents," "Agent Builder," "Agent
  Playground," "Agent Simulation") strongly implies real agent execution to
  a first-time reader; this is a naming/UX ambiguity worth flagging in any
  future documentation or onboarding work, not something to silently work
  around in code.
- There is no code path anywhere in `src/` that connects an in-app `Agent`
  record to a live model or external tool call.

## Current implementation status

Shipped: fully simulated in-app Agent Builder/Starter Catalog/Simulation
feature; fully separate AOS operational agent-role documents. Not shipped,
anywhere in this repo: an autonomous or externally-connected AI agent of any
kind.
