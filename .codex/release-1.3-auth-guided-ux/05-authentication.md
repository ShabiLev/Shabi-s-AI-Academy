# Authentication

The auth domain exposes local-only, guest, authenticated, loading, expired, unavailable, and network-unavailable states through one context. A lazy singleton Supabase client is created only when both public Vite values are valid. Components call `authService`; they never call the SDK directly.

Supported configured flows are email/password registration and login, email verification, generic forgot-password, recovery update, Magic Link, callback exchange, session restoration, and sign-out. Requested routes are safe internal paths. OAuth is intentionally out of scope. Missing configuration keeps Guest and all local work available and labels cloud controls unavailable.

## Acceptance

The configured adapter follows current Supabase JavaScript contracts; the unconfigured adapter performs no network call and never blocks Guest use.
