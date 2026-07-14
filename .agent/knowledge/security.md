# Security

## Purpose

Translate the security standard into concrete do/don't rules for this
codebase's actual trust boundaries.

## Authoritative source(s)

- [.codex/architecture/security.md](../../.codex/architecture/security.md)
- [.codex/standards/security.md](../../.codex/standards/security.md)
- [.codex/adr/ADR-009-no-secrets-in-browser-storage.md](../../.codex/adr/ADR-009-no-secrets-in-browser-storage.md)
- [.codex/adr/ADR-010-human-approval-for-risky-actions.md](../../.codex/adr/ADR-010-human-approval-for-risky-actions.md)
- `.agent/security/security-policy.md` (AOS precedence: security rules
  outrank every other AOS instruction, including this file)

## Project-specific interpretation

The browser is untrusted by design here: imported prompts/agents, pasted
Knowledge Base content, route parameters, and (if ever connected) provider
output are all treated as inert data, rendered as text, never executed.
Concretely: every entry in `toolCatalog` (`src/agents/types.ts`) is marked
`connectionStatus: "notConnected"`, and tools flagged `risk: "high"`
(`sqlQuery`, `emailDraft`, `notification`) also carry
`requiresHumanApproval: true` — this is the in-app expression of ADR-010.
Only the Supabase project URL and anonymous client key may reach the Vite
build (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, injected as GitHub
Actions secrets in `deploy-pages.yml`); no service-role key or provider API
key exists in this repo's frontend code.

## Constraints

- Never introduce `eval`, `Function`, or raw HTML injection for
  externally-sourced or user-authored content.
- Never add a secret, API key, or service-role credential to source, env
  files committed to git, localStorage, exports, screenshots, or logs.
- Any new "risky" simulated tool action must declare a risk tier and require
  explicit approval before it "executes" (still simulated) — follow the
  `AgentTool`/`ApprovalPoint` shape already in `src/agents/types.ts`.
- Cloud tables added under `supabase/migrations/` must enable row-level
  security scoped to `auth.uid()`, matching the existing pattern in
  `supabase/migrations/202607140001_user_data_foundation.sql`.

## Known limitations

- Live AI provider execution is architecturally reserved but not built;
  there is no server-side secret boundary yet because there is no server —
  this is the correct, honest current state, not a gap to silently close.
- `npm audit`-level dependency review is manual/on-demand, not enforced as
  a blocking CI gate today.

## Current implementation status

Shipped: no-secrets-in-browser-storage boundary honored end to end, tool
risk/approval typing in the Agent domain, RLS-protected Supabase tables for
the domains that use cloud sync. Not shipped: live provider credentials,
server-side execution, any form of automatic/unattended risky-action
execution — approval is always simulated per ADR-010's own 1.4 status.
