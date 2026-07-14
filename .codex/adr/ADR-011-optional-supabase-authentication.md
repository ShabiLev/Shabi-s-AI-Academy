# ADR-011: Optional Supabase Authentication

- Status: Accepted
- Date: 2026-07-14

## Context

Version 1.3 adds accounts while the Academy must remain usable without network configuration and must preserve local guest work.

## Decision

Use one lazily-created Supabase browser client behind `authService`. Only the public project URL and anonymous client key may enter the Vite build. Missing or invalid configuration selects honest local-only behavior; Guest mode and local features remain available. Email/password, Magic Link, recovery, and PKCE callbacks are supported. OAuth is deferred.

## Alternatives considered

Mandatory hosted authentication; direct SDK calls from screens; a custom authentication server; removing Guest mode.

## Consequences

Accounts and session restoration are available when configured without making deployment depend on Supabase. Auth screens need explicit unavailable, loading, network, expired-session, Guest, and authenticated states.

## Risks

Incorrect redirect allowlists can break email links; client routing is not authorization; configuration values are public but must never be confused with privileged credentials.

## Follow-up work

Protect every cloud-owned row with RLS, document exact local and GitHub Pages redirects, and add mocked callback and session tests.

## Related documents

[ADR-003](ADR-003-local-first-storage.md), [ADR-009](ADR-009-no-secrets-in-browser-storage.md), [authentication specification](../release-1.3-auth-guided-ux/05-authentication.md).
