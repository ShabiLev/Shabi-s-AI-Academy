# AI Agent Prompt

## Purpose

Frame the task of creating a Starter Agent (in-product content) or an AOS
operational agent role, on top of `.agent/knowledge/ai-agents.md`'s
distinction between the two.

## Task-specific checklist

- Determine which kind of "agent" this task means: an in-product Starter
  Agent candidate (content, reviewed like any Knowledge Base entry) or an
  AOS operational role definition under `.agent/agents/`. They are not
  interchangeable.
- For a Starter Agent candidate, follow `.agent/templates/agent.md` and
  route it through `.agent/research/review-workflow.md`.
- For an AOS role definition, follow the required sections in every
  `.agent/agents/*.md` file (Role, Responsibilities, Allowed/Prohibited
  actions, Required inputs/modules, Output format, Handoff target,
  Approval requirements).
- State plainly that any agent produced is a role definition or content
  candidate, not an autonomous production system, unless the task
  explicitly says otherwise.
- Flag any tool-calling or MCP surface the agent would need per
  `.agent/knowledge/tool-calling.md` and `.agent/security/mcp-security.md`.

## Shared workflow to load

Load `.agent/knowledge/ai-agents.md` for the full process; this file adds
nothing to that process except task-specific framing.
