# Security

## Version 1.3 account and data boundary

Supabase is optional and centralized behind `src/auth`. The browser accepts only public URL and anon-key configuration; service-role credentials are prohibited. Passwords are never stored, logged, exported, or placed in URLs. Provider-owned sessions are excluded from Workspace backup and migration.

Cloud tables enable Row Level Security with JWT ownership policies. UI route guards are not treated as authorization. Admin access requires protected backend-derived role evidence, never email matching or local state. Migration requires preview, explicit domain selection, a typed confirmation, conflict choices, and separate cleanup; it does not silently delete local data. See [authentication](authentication.md), [RLS](supabase-rls.md), and [privacy model](privacy-model.md).

## Version 1.1 AI Workspace boundary

Global Search, commands, Assistant, workflows, analytics, and backup are local-only. The Assistant action router accepts a closed typed action set and cannot evaluate arbitrary code. Workflow transforms are predefined deterministic operations and all runs remain Mock or Dry Run. No UI component calls an AI provider.

Analytics records bounded safe metadata only. Workspace export excludes secret-shaped keys, credential/token/JWT-shaped values, and private absolute or UNC paths. Import validates size, schema/domain versions, outer and inner checksums, ownership, supported domains, prototype/executable content, and complete evaluation graph relationships in memory before the first persistent write; a later storage failure rolls back every touched key. Imported evaluation certification is removed until a separate local revalidation run completes. Search highlighting and imported text render as inert React text, never unsafe HTML.

Dependency review on 2026-08-01 retained `react-router-dom` 7.18.2. `npm audit --omit=dev` reports the React Router RSC Action CSRF advisory, but this Vite SPA has no RSC mode, server actions, action routes, SSR request handler, or React Router server runtime. The finding is therefore not reachable in this deployment architecture; it remains tracked until an upstream patched `react-router-dom` release is available. This applicability assessment is not a waiver for adding RSC or server actions later.

The remaining full-audit advisories are transitive development-tooling paths used by local/CI reporting and interactive CLIs, not shipped browser runtime code. They remain tracked and must be re-evaluated when those tools execute untrusted archives, templates, or shell input; this is an applicability record, not a claim that the dependencies are patched.

Provider-specific controls and the reserved server boundary remain documented in [provider-security.md](provider-security.md).

## AOS security modules

The Agent Operating System adds a dedicated policy layer for AI coding agents at [`.agent/security/`](../.agent/security/) (secrets, frontend security, authentication, authorization, data protection, dependency security, MCP security, AI security, prompt injection, supply chain, logging). These modules interpret and enforce the same security precedence described above for any agent-driven change — they do not loosen or duplicate it. See [`docs/aos/security.md`](aos/security.md) for the pointer index, or `/aos/security` for the in-app view.
