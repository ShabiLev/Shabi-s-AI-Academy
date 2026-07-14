# 1.3 Testing

Vitest covers preferences, metadata, glossary, onboarding, tours, auth configuration/validation/service boundaries, listener cleanup, repositories, queue bounds, migration preview/rollback/conflicts, secret filtering, and admin claims. SDK interactions use injected mocks and never call production Supabase.

Playwright covers first visit, Guest onboarding, both experience modes, page guidance, Help, configured/unconfigured auth states, form validation, callback errors, local migration, profile, admin denial, all 1.2 regressions, Pages hash routes, both languages, and the required viewport matrix. Axe and reviewed visuals cover every new complex state; Lighthouse retains established thresholds.

## Acceptance

No test uses production credentials, arbitrary waits, hidden backdoors, blanket axe suppression, or automatic visual approval during validation.
