# Security

## Version 1.1 AI Workspace boundary

Global Search, commands, Assistant, workflows, analytics, and backup are local-only. The Assistant action router accepts a closed typed action set and cannot evaluate arbitrary code. Workflow transforms are predefined deterministic operations and all runs remain Mock or Dry Run. No UI component calls an AI provider.

Analytics records bounded safe metadata only. Workspace export excludes secret-shaped values; import validates size, schema, checksum, supported domains, prototype/executable content, and conflicts before confirmation, then rolls back staged writes on failure. Search highlighting and imported text render as inert React text, never unsafe HTML.

Provider-specific controls and the reserved server boundary remain documented in [provider-security.md](provider-security.md).
