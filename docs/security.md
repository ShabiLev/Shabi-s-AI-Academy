# Security

## Version 1.3 account and data boundary

Supabase is optional and centralized behind `src/auth`. The browser accepts only public URL and anon-key configuration; service-role credentials are prohibited. Passwords are never stored, logged, exported, or placed in URLs. Provider-owned sessions are excluded from Workspace backup and migration.

Cloud tables enable Row Level Security with JWT ownership policies. UI route guards are not treated as authorization. Admin access requires protected backend-derived role evidence, never email matching or local state. Migration requires preview, explicit domain selection, a typed confirmation, conflict choices, and separate cleanup; it does not silently delete local data. See [authentication](authentication.md), [RLS](supabase-rls.md), and [privacy model](privacy-model.md).

## Version 1.1 AI Workspace boundary

Global Search, commands, Assistant, workflows, analytics, and backup are local-only. The Assistant action router accepts a closed typed action set and cannot evaluate arbitrary code. Workflow transforms are predefined deterministic operations and all runs remain Mock or Dry Run. No UI component calls an AI provider.

Analytics records bounded safe metadata only. Workspace export excludes secret-shaped values; import validates size, schema, checksum, supported domains, prototype/executable content, and conflicts before confirmation, then rolls back staged writes on failure. Search highlighting and imported text render as inert React text, never unsafe HTML.

Provider-specific controls and the reserved server boundary remain documented in [provider-security.md](provider-security.md).
