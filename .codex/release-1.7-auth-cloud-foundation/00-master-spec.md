# Version 1.7 — Auth & Cloud Foundation — architecture specification

Status: specification only. No implementation has begun. This document is
the required Version 1.7 starting point per the Version 1.6 release
process; it maps current state and proposes direction — it does not
authorize building anything until reviewed.

## 1. Current login/register/profile mapping

Two parallel login surfaces exist today:

- `src/pages/LoginPage.tsx` (route `/login`) — legacy/demo-only. Calls
  `demoLogin()` (alias of `continueAsGuest()`); no credentials, no network
  call, sets `sessionStorage["shabis-ai-academy-guest-session"]` and assigns
  a hardcoded `demoUser` object (`src/auth/AuthContext.tsx`).
- `src/pages/auth/AuthLoginPage.tsx` (route `/auth/login`, real Supabase) —
  email/password `signIn`, magic-link `sendMagicLink`, plus a "Continue as
  Guest" fallback.

Registration: `src/pages/auth/AuthRegisterPage.tsx` → `authService.register()`
(`src/auth/authService.ts`) calls `client.auth.signUp` with `user_metadata`
(first/last name, language, experience level, goal).

Core logic: `src/auth/AuthContext.tsx` (session state/provider),
`src/auth/authService.ts` (Supabase SDK calls), `src/auth/authClient.ts`
(lazy singleton `createClient`), `src/auth/authConfig.ts` (env validation).

Profile: `src/pages/ProfilePage.tsx` is entirely local — form submit calls
only `saveLocalProfile` (`src/account/profileStorage.ts`). **No Supabase
read/write happens even when `isCloudAuthenticated` is true.** A `profiles`
table with RLS already exists (see §3) but nothing in the app writes to it.

## 2. localStorage data inventory

28 files reference `localStorage`. Distinct keys/prefixes:

| Domain | Key | Has a matching Supabase table? |
|---|---|---|
| Profile | `shabis-ai-academy-profile-v1` | `profiles` (unwired) |
| Course progress | `shabi-ai-academy.course-progress.v1` | `user_progress` (unwired) |
| Experience mode | `shabis-ai-academy:experience:v1` | `user_preferences` (unwired) |
| Assistant history | `shabis-ai-academy:assistant:v1` | none |
| Guest/demo session | `shabis-ai-academy-guest-session` / `-demo-session` (sessionStorage) | n/a — session only, by design |
| Command history | `shabis-ai-academy:commands:v1` | none |
| Workspace | `shabis-ai-academy:workspace:v1` | none |
| Playground prompts/agents | `shabis-ai-academy.playground.prompts.v1` / `.playground.agents.v1` | `user_prompts` / `user_agents` (partial overlap, unwired) |
| Language | `shabis-ai-academy-language` | `user_preferences` (unwired) |
| Onboarding | `shabis-ai-academy:onboarding:v1` | `onboarding_profiles` (unwired) |
| Agent library | `shabi-ai-academy.agent-library.v1` | `user_agents` (unwired) |
| Sync queue | `shabis-ai-academy.sync-queue.v1` | `sync_metadata` (unwired) |
| Knowledge base | `shabis-ai-academy.knowledge.v1` | `knowledge_documents` (unwired) |
| Guided tours | `shabis-ai-academy-guided-tours-v1` | none |
| Prompt library | `shabi-ai-academy.prompt-library.v1` | `user_prompts` (unwired) |
| Projects | `shabis-ai-academy.projects.v1` | `projects` / `project_entities` (unwired) |
| Workflows | `shabis-ai-academy:workflows:v1` | `workflows` (unwired) |
| Radar favorites/history | `shabis-ai-academy:radar-favorites:v1` / `:radar-history:v1` | `favorites` (partial), history has no table |
| Search | `shabis-ai-academy:search:v1` | none (local-only is likely correct — ephemeral) |
| QA issues/checklist | `shabi-ai-academy.qa-issues.v1` / `.qa-checklist.v1` | none |
| Runtime runs | `shabis-ai-academy.runtime.runs.v1` | `runtime_runs` (unwired) |
| Pre-migration backup | `shabis-ai-academy-pre-migration-backup` | n/a — transient safety copy |
| Auth destination (sessionStorage) | `shabis-ai-academy-auth-destination` | n/a — session only, by design |

Naming is inconsistent across domains (`shabis-ai-academy` vs
`shabi-ai-academy`, `:` vs `.` vs `-` separators) — a mapping/adapter layer
must not assume a single convention.

## 3. Existing Supabase configuration and tables

- Client: `src/auth/authClient.ts` — `createClient` with `flowType: pkce`,
  `persistSession`, `autoRefreshToken`, `detectSessionInUrl`.
- Config/env: `src/auth/authConfig.ts` reads `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY`, validates https/localhost-only and anon-key
  length. Documented in `.env.example`.
- **`supabase/migrations/202607140001_user_data_foundation.sql`** already
  defines: `profiles`, `user_preferences`, `user_progress`, `user_prompts`,
  `user_agents`, `projects`, `project_entities`, `knowledge_documents`,
  `workflows`, `runtime_runs`, `favorites`, `recent_items`, `notifications`,
  `onboarding_profiles`, `sync_metadata`, `audit_events`,
  `analytics_events`, `account_roles` — all with RLS "own row" policies and
  `updated_at` triggers.
- **`supabase/tests/rls_ownership_verification.sql`** already exists for
  RLS testing.
- **`src/data/SupabaseDataProvider.ts`** already maps `DataDomain` → table
  names and implements real `list/upsert/remove` via the Supabase client —
  working code, gated behind `client && userId`, **currently unused**: not
  wired to any of the localStorage-based domain stores in §2.
- Other providers: `src/data/LocalDataProvider.ts`,
  `src/data/HybridDataProvider.ts` (local-first + bounded sync queue),
  `src/data/migrations/` (`localScanner.ts`, `migrationService.ts` — a
  local→cloud migration flow already exists in code).
- Existing docs: `docs/authentication.md`, `docs/cloud-data.md`,
  `docs/local-cloud-migration.md`, `docs/supabase-setup.md`,
  `docs/supabase-rls.md`, `docs/sync-conflicts.md`,
  `docs/profile-account.md`. Per `CHANGELOG.md`, "Optional Supabase
  authentication, account recovery, profiles, security guidance,
  RLS-backed cloud data contracts, conflict review, and safe local-to-cloud
  migration" shipped in a prior version (1.3) as foundational
  infrastructure — it was built ahead of the UI actually using it.
- Dependency: `@supabase/supabase-js@^2.57.4`.

**Central finding: most of the cloud-storage foundation already exists.**
The primary Version 1.7 gap is not "build a schema" — it's wiring the
already-real `SupabaseDataProvider` / `HybridDataProvider` into the pages
that currently only call local storage functions directly (Profile being
the clearest example), and extending schema/RLS coverage to the ~7 domains
in §2 with no matching table yet.

## 4. Mock vs. real authentication

- Real: `AuthLoginPage` / `AuthRegisterPage` / `ForgotPasswordPage` /
  `ResetPasswordPage` / `AuthCallbackPage` all go through `authService.ts`
  → actual Supabase Auth API calls.
- Mock/local-only: `LoginPage.tsx` (`/login`) is pure demo —
  `demoLogin()` / `continueAsGuest()`, no network call, hardcoded
  `demoUser`, `accountType: "guest"`. Coexists with real auth; `AuthStatus`
  includes `"guest"` and `"local-only"` as distinct non-cloud states.
  Note: "MockProvider" elsewhere in this repo (`docs/mock-provider.md`)
  refers to a deterministic AI-run simulator for agents/workflows —
  unrelated to auth; do not conflate the two when scoping 1.7 work.

## 5. Protected-route mapping (`src/App.tsx`)

- Public: `/`, `/login`, `/about`, `/privacy`, `/terms`.
- `GuestRoute`-wrapped (redirect to `/` if already cloud-authenticated):
  `/auth/login`, `/auth/register`, `/auth/forgot-password`.
- Unguarded auth pages: `/auth/verify-email`, `/auth/reset-password`,
  `/auth/callback`, `/auth/error`.
- `ProtectedRoute`-wrapped (`isAuthenticated` = guest OR cloud) → all app
  routes (dashboard, lessons, prompts*, agents*, playground*, projects*,
  knowledge*, journey, roadmap, changelog, docs, release, developer,
  search, assistant, workflows*, analytics, radar, settings, profile,
  history, qa, aos*, runs*).
- `AuthenticatedRoute`-wrapped (`isCloudAuthenticated` only, guests
  excluded) → `/account/security`, `/account/migration`.
- `AdminRoute`-wrapped (`isVerifiedAdmin`: `accountType==="cloud" &&
  roleSource==="verified-claim" && role==="admin"`,
  `src/admin/adminAuthorization.ts`) → `/admin*`. No code currently sets
  `roleSource: "verified-claim"` from anything other than
  `mapSupabaseUser` reading `app_metadata.role` — this is the only
  server-asserted claim path today and should be the reference pattern for
  any new server-verified state.

## 6. Proposed database schema (delta only)

The existing migration (§3) already covers 16 of ~23 local domains. Propose
extending it — in a **new** migration file, not editing the existing one —
with tables for the domains that have no server-side equivalent yet:
`assistant_history`, `command_history`, `workspace_state`,
`guided_tour_state`, `radar_history` (favorites already has a table;
history does not), and a decision on whether `qa_issues`/`qa_checklist`
should ever leave the local device (they are dev/QA tooling, not end-user
data — likely **should stay local-only**, to be confirmed before building).
`search` history is almost certainly correctly local-only/ephemeral and
should not get a table.

## 7. Proposed RLS policies

Follow the existing "own row" pattern already established in
`202607140001_user_data_foundation.sql` (`user_id = auth.uid()` on
select/insert/update/delete) for any new table. No new RLS pattern is
proposed — the existing approach is sound and already has a verification
test (`supabase/tests/rls_ownership_verification.sql`) to extend.

## 8. Local-to-cloud migration strategy

`src/data/migrations/localScanner.ts` and `migrationService.ts` plus
`docs/local-cloud-migration.md` already describe a migration flow. Propose
auditing that existing flow against the full §2 domain list to confirm
which domains it currently migrates vs. which (per §6) don't have a target
table yet, rather than designing a new migration mechanism from scratch.
`AccountMigrationPage.tsx`'s existing pre-migration backup
(`shabis-ai-academy-pre-migration-backup`) is the safety net and should
remain the first step of any migration for new domains too.

## 9. Authentication test strategy

Existing coverage to build on, not replace: `src/auth/authService.test.ts`,
`src/auth/authConfig.test.ts`, `src/auth/AuthContext.test.tsx`,
`src/security/authSecurity.test.ts`, `e2e/journeys/authentication.spec.ts`,
`e2e/specs/auth-data-matrix.spec.ts` (11 auth states × data states already
matrixed). Propose that 1.7 test work extend this matrix to cover: (a) the
newly-wired Profile↔Supabase round trip, (b) each newly migrated domain's
RLS ownership boundary (extending `rls_ownership_verification.sql`), and
(c) the local→cloud migration flow's failure/partial-failure paths (network
drop mid-migration, conflicting cloud data already present) — none of
which currently have dedicated coverage.

## Explicit non-goals for this document

No code has been written. No schema migration has been created. No
component has been wired to `SupabaseDataProvider`. The next task after
this specification is reviewed should be scoping which single domain (the
recommendation is Profile, per §1/§3, since its table already exists and
nothing else depends on it) to wire first, as a small, reviewable increment
— not a bulk migration of all domains at once.
