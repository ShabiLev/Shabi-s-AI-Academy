# User Accounts & Guided Experience 1.3.0-beta.1

## Status

- Baseline: `c05117dab9b84bede8175b8c867483984a1f5513`, Version `1.2.0-beta.1`
- Branch: `feature/1.3.0-auth-guided-ux`
- Target: `1.3.0-beta.1`
- Milestone: User Accounts & Guided Experience

## Objective

Make the complete Academy understandable to a first-time user while adding an optional, production-shaped Supabase authentication and user-data boundary. All 1.2 routes and browser-local records remain available. Experience mode changes presentation, never authorization.

## Controlling modules

1. [Information architecture](01-information-architecture.md)
2. [Navigation](02-navigation.md)
3. [Page guidance](03-page-guidance.md)
4. [Onboarding](04-onboarding.md)
5. [Authentication](05-authentication.md)
6. [Cloud data](06-cloud-data.md)
7. [Local migration](07-local-migration.md)
8. [Profile and account](08-profile-account.md)
9. [Admin foundation](09-admin-foundation.md)
10. [Security and privacy](10-security-privacy.md)
11. [Testing](11-testing.md)
12. [Release](12-release.md)

## Invariants

- Local-only and Guest operation remain complete when Supabase is absent.
- Passwords, service-role credentials, tokens, and callback parameters never enter application storage, logs, exports, fixtures, or screenshots.
- UI calls typed auth/data services; it does not construct Supabase clients or scatter table calls.
- Cloud authorization depends on RLS and trusted claims, never hidden links or frontend booleans.
- Migration is previewed, confirmed, rollback-aware, and preserves local data until success.
- Hebrew RTL and English LTR remain equivalent, accessible, responsive experiences.

## Delivery contract

Use the exact commit sequence in [Release](12-release.md), run every requested gate, create the final release commit, and stop before push or merge.
