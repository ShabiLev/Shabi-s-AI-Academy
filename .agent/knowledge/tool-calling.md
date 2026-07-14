# Tool Calling

## Purpose

Explain how "tools" are represented in this codebase so an agent doesn't
mistake a declared, unconnected tool contract for a working function-calling
integration.

## Authoritative source(s)

- `src/agents/types.ts` (`AgentTool`, `toolCatalog`)
- `src/runtime/types.ts` (`plannedToolIds`, `ProviderStatus.capabilities`)
- [.codex/adr/ADR-004-provider-abstraction.md](../../.codex/adr/ADR-004-provider-abstraction.md)
- [.codex/adr/ADR-010-human-approval-for-risky-actions.md](../../.codex/adr/ADR-010-human-approval-for-risky-actions.md)
- `.agent/security/mcp-security.md` (risk-tier controls for a future real
  MCP tool integration)

## Project-specific interpretation

Two "tool" concepts exist, both declarative-only. `toolCatalog` in
`src/agents/types.ts` lists ten conceptual tools (`jiraReader`,
`githubReader`, `sqlQuery`, `testReport`, `fileReader`, `webSearch`,
`emailDraft`, `calendarReader`, `notification`, `none`), each with a `risk`
tier and a fixed `connectionStatus: "notConnected"` — this is metadata a
learner attaches to their designed `Agent`, not a callable function. In the
Runtime domain, `RunRequest.plannedToolIds` and
`ProviderStatus.capabilities` describe what a run *would* use; the Mock
Provider never actually invokes anything external. Neither concept performs
real function-calling against an LLM, nor exposes an MCP-style tool schema
to any client — see `.agent/knowledge/mcp.md`.

## Constraints

- Never implement a real network/file/system call behind an existing
  catalog tool entry as an incidental change; that is new `AI integration`
  or `MCP integration` scope requiring risk classification and, for
  `high`-risk tools, an explicit human-approval mechanism beyond simulation
  (ADR-010).
- Any new catalog tool entry must declare `risk` and, if `high`, must be
  paired with `requiresHumanApproval: true`, matching the existing pattern
  for `sqlQuery`/`emailDraft`/`notification`.
- Keep `connectionStatus` honest — do not set it to anything implying a
  live connection exists.

## Known limitations

- There is no shared, typed "tool contract" schema (name, input schema,
  output schema) beyond the flat `AgentTool` shape; it is sufficient for a
  learning-app label but is not what a real function-calling integration
  would need.
- No tests exercise an actual tool call, because none exists; existing tests
  only verify the declarative catalog data and the simulation's warning
  message for unconnected tools.

## Current implementation status

Shipped: declarative tool catalog with risk/approval metadata, used purely
for learner-authored Agent records and Runtime planning display. Not
shipped: any real tool execution, function-calling against a model, or MCP
tool exposure.
