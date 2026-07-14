# MCP

## Purpose

State plainly that MCP is not integrated in this application, so no future
task assumes an MCP server/client exists to extend.

## Authoritative source(s)

- [.codex/architecture/overview.md](../../.codex/architecture/overview.md)
  ("Future evolution": "A backend, live providers, MCP, and synchronization
  require new accepted ADRs and threat models.")
- `.agent/security/mcp-security.md` (risk-tier controls to apply *before*
  any MCP tool is added — dependency of this module per
  `.agent/manifest.json`)
- `src/glossary/glossaryData.ts`, `src/platform/roadmap.ts`

## Project-specific interpretation

A repo-wide search turns up exactly two references to MCP, both explicitly
non-implementation: a glossary definition ("A protocol for exposing tools
and context to AI applications... An MCP server can describe available
resources") in `glossaryData.ts`, and a roadmap entry in
`src/platform/roadmap.ts` listing "MCP and connectors" ("External tools
only after threat modeling and approvals") under `status: "planned"` /
`version: "future"`. There is no MCP client, server, tool registry
implementation, or protocol handshake code anywhere in `src/`. The app's
own `ToolRegistry` abstraction (`runtime.md`) is a same-process,
mock-backed abstraction unrelated to MCP's client-server tool-exposure
protocol.

## Constraints

- Do not add MCP client/server code, dependencies, or configuration to this
  repo speculatively; it requires a new accepted ADR and threat model first
  (overview.md), which is a `MCP integration` AOS task type — High/Critical
  risk by default per `master.md` §3.
- If asked to "add an MCP tool," first classify the task per
  `.agent/loaders/task-classifier.md` and load
  `.agent/security/mcp-security.md` before writing any code — do not
  improvise risk tiers.
- Never describe the existing `ToolRegistry`/`AgentTool` abstractions as
  "MCP-compatible" or "MCP-ready" in documentation — they are a distinct,
  unconnected concept.

## Known limitations

- Because nothing exists yet, this file cannot describe real integration
  patterns, only the constraint that one must go through
  `.agent/prompts/mcp-integration.md` and `.agent/agents/mcp-specialist.md`
  when the work is actually authorized.
- The glossary/roadmap mentions could be mistaken for a commitment or a
  partial implementation by a fast skim; they are not — verify against
  `src/` directly, as this file's research did, before asserting otherwise.

## Current implementation status

Not integrated. MCP appears only as a glossary term and a "planned/future"
roadmap line item. Zero implementation footprint in `src/`, `package.json`,
or any config file in this repo as of this writing.
