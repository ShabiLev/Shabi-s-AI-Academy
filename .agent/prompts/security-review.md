# Security Review Prompt

## Purpose

Frame a dedicated security review task, on top of the governing security
policy and review template.

## Task-specific checklist

- Review the diff/surface against every rule in
  `.agent/security/security-policy.md`; do not sample only the files the
  task description names.
- Check secrets handling, frontend security, authentication/authorization
  boundaries, dependency provenance, and logging per the matching files in
  `.agent/security/`.
- Classify any MCP tool involved by risk tier per
  `.agent/security/mcp-security.md`.
- Treat any authentication, data migration, or external provider change as
  High risk by default.
- Record findings using `.agent/security/security-review-template.md`; do
  not substitute an informal summary for the required structure.
- Escalate any Critical-risk finding (secret exposure, write-capable tool
  without approval) as a stop condition, not a note for later.

## Shared workflow to load

Load `.agent/security/security-review-template.md` for the full process;
this file adds nothing to that process except task-specific framing.
