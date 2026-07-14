# Supabase

## Purpose

State exactly what Supabase does and does not do in this app so an agent
never treats it as a full custom backend or a place secrets can live.

## Authoritative source(s)

- [.codex/adr/ADR-011-optional-supabase-authentication.md](../../.codex/adr/ADR-011-optional-supabase-authentication.md)
- [.codex/adr/ADR-012-hybrid-data-providers.md](../../.codex/adr/ADR-012-hybrid-data-providers.md)
- [.codex/adr/ADR-009-no-secrets-in-browser-storage.md](../../.codex/adr/ADR-009-no-secrets-in-browser-storage.md)
- `src/auth/authService.ts`, `src/auth/authConfig.ts`, `src/auth/authClient.ts`
- `src/data/SupabaseDataProvider.ts`, `src/data/HybridDataProvider.ts`
- `supabase/migrations/202607140001_user_data_foundation.sql`,
  `supabase/tests/rls_ownership_verification.sql`

## Project-specific interpretation

`createAuthService(client)` in `authService.ts` takes a lazily-created
Supabase client (or `null`) and returns sign-in, register, magic-link,
password-reset, update-password, and PKCE callback-exchange functions; every
branch has an explicit `null`-client fallback (`unavailable`) that returns
`{ ok: false, message: "auth-unavailable" }` rather than throwing, so missing
configuration degrades to honest local-only/Guest behavior instead of a
crash. Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the public
anonymous key) may enter the build — never a service-role key. OAuth is
explicitly deferred per ADR-011. Cloud data access for account users goes
through `SupabaseDataProvider`/`HybridDataProvider` (see
`.agent/knowledge/storage.md`), never direct table calls from a page.

Row-level security is actually implemented, not just planned: the
`202607140001_user_data_foundation.sql` migration enables RLS on every
per-user table and scopes `select`/`insert`/`update`/`delete` policies to
`auth.uid() = user_id` (or `= id` for `profiles`), and
`rls_ownership_verification.sql` exists specifically to test ownership
isolation.

## Constraints

- Never add a service-role key, or any Supabase credential beyond the public
  URL/anon key, to frontend code, env files committed to git, or CI logs.
- Any new Supabase table needs an RLS policy scoped to the owning user,
  matching the existing migration's pattern, before it ships.
- UI must never be the sole authorization boundary for cloud data — routing
  guards (`ProtectedRoute`, `AuthenticatedRoute`, `AdminRoute`) are UX
  affordances, not security enforcement; RLS is the enforcement layer.
- Client routing state (e.g. an `admin` route guard) must not be treated as
  equivalent to a verified server-side role check; per ADR-011,
  `role` in `mapSupabaseUser` reflects `app_metadata`, not a client
  decision.

## Known limitations

- Redirect-URL allowlisting for auth email links must be kept in sync
  between local dev, GitHub Pages, and the Supabase project dashboard —
  ADR-011 flags this as an easy source of broken email links if missed.
- OAuth providers (Google, GitHub sign-in, etc.) are not implemented.
- Conflict resolution for concurrent cross-device edits is not built;
  ADR-012 defers it explicitly.

## Current implementation status

Shipped: email/password, Magic Link, password recovery, PKCE callback auth
flows; RLS-protected per-user tables via a real migration; Hybrid
local-first sync with a capped, backoff-retried queue for the domains wired
to it. Not shipped: OAuth sign-in, cross-device conflict resolution UI, any
Supabase Edge Function or server-side business logic — this remains a
client + Postgres/RLS architecture, not a custom backend.
