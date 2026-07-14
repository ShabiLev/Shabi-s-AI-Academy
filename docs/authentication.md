# Authentication

The Academy supports local-only, Guest, and authenticated cloud-capable operation. `AuthProvider` owns session state; a centralized service owns Supabase calls; pages never instantiate clients. Supported configured flows are email/password registration and login, email verification, generic password-reset request, recovery password update, Magic Link, callback exchange, restoration, expiry handling, and sign-out.

When public Supabase configuration is absent, the application remains usable, Guest work remains local, and cloud controls show an honest unavailable state without making an auth request. Requested destinations accept only safe internal paths.

Passwords are submitted directly to the provider and are never logged, exported, or stored by Academy adapters. Supabase SDK session storage is excluded from workspace backup and migration.
