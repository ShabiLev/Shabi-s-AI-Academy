# MCP Integration Prompt

## Purpose

Frame the task of adding or changing an MCP tool integration, on top of the
governing MCP security policy.

## Task-specific checklist

- Classify the tool's risk tier (read-only, write-capable, destructive) per
  `.agent/security/mcp-security.md` before writing any integration code.
- Confirm current MCP status in this project per `.agent/knowledge/mcp.md`
  — there is no live MCP integration today, so treat this as new trust
  boundary, not an extension of an existing one.
- Require explicit human approval before any write-capable or destructive
  tool is enabled; treat this as Critical risk per the task classifier.
- Describe the tool's contract (inputs, outputs, side effects) per
  `.agent/knowledge/tool-calling.md`.
- Confirm no credential or token the tool needs is stored in frontend code,
  browser storage, or evidence logs.
- Have the `.agent/agents/mcp-specialist.md` role review the contract
  before implementation proceeds.

## Shared workflow to load

Load `.agent/security/mcp-security.md` for the full process; this file adds
nothing to that process except task-specific framing.
