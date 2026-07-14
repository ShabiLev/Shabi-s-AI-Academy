# Authentication

## Purpose

Supabase authentication constraints for this repository. Authentication
changes are High risk by default per `../loaders/task-classifier.md` and
`../master.md` §3.

## Rules

- Authentication uses `@supabase/supabase-js` (see `package.json`
  dependencies). Only the anon/public key is ever present in client code
  or `VITE_*` environment variables. The service-role key never appears in
  frontend code, `.env` files committed to the repo, build configuration,
  or evidence output — see [`secrets.md`](secrets.md) and ADR-009.
- Session tokens issued by Supabase Auth are handled through the
  supabase-js client's own storage mechanism; do not duplicate tokens into
  additional localStorage/sessionStorage keys, application logs, or
  evidence artifacts. See [`logging.md`](logging.md).
- Any change to sign-in, sign-up, password reset, session refresh, social
  auth, or account linking is High risk: it requires the standard
  authentication task path in `../loaders/task-classifier.md` (focused
  tests, security review, evidence) before it can be reported done.
- Authentication state must never be inferred purely from client-side
  presence/absence of a token for the purpose of granting access to
  server-held data — that is an authorization concern, see
  [`authorization.md`](authorization.md). Authentication confirms identity;
  it does not by itself confirm what that identity may do.
- Local-only mode (no Supabase account) must remain fully usable without
  authentication, per this project's local-first architecture — see
  [`../knowledge/storage.md`](../knowledge/storage.md). Do not make cloud
  authentication a hard requirement for core app function.
- Failed authentication must fail closed (deny access to cloud-synced
  data), never fail open.

## Migration and account linking

Any local-to-cloud data migration triggered by first sign-in must not
silently overwrite existing cloud data, and must be reviewed as a data
migration task (High risk) per
[`../knowledge/storage.md`](../knowledge/storage.md) and
[`data-protection.md`](data-protection.md).

## Review checklist

- Confirm no service-role key or elevated credential is referenced
  anywhere in frontend-reachable code.
- Confirm session tokens are not logged, printed, or captured in evidence.
- Confirm local-only usage remains possible without signing in.
- Confirm the change was tested for both signed-in and signed-out states.

## Related

[`security-policy.md`](security-policy.md), [`authorization.md`](authorization.md),
[`../knowledge/supabase.md`](../knowledge/supabase.md).
