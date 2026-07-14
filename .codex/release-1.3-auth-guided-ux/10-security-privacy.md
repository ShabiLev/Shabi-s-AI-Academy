# Security and privacy

Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are accepted. Build and test scans reject service-role names/values, credentials, tokens, passwords, private emails, callback secrets, localhost production metadata, and local machine paths. Auth errors are normalized to generic bilingual messages and never reveal account existence.

Supabase's browser session storage is owned by its SDK and excluded from Workspace export/import. Academy storage adapters never read, copy, log, or delete Supabase token keys. RLS is mandatory on every exposed private table. Privacy and Terms routes distinguish local data, optional cloud data, external providers, exports, deletion, analytics, and beta limitations.

## Acceptance

Negative tests and production-bundle scans find no service credential, password, auth token, private fixture email, callback secret, or local machine path.
