# Secrets

## Purpose

No secret in code, evidence, memory, or AOS content; correct use of
environment variables and secret managers instead.

## Rules

- No API key, token, password, connection string, or credential is ever
  written into: source files, `.agent/` content, `.codex/` content,
  commit messages, evidence files under `quality/execution/`, memory files
  under `.agent/memory/`, handoff documents, or research/knowledge
  artifacts.
- No secret is ever placed in frontend-reachable code or configuration.
  Anything shipped in the Vite bundle is public — see
  [`frontend-security.md`](frontend-security.md) and ADR-009
  (`../../.codex/adr/ADR-009-no-secrets-in-browser-storage.md`).
- No service-role or elevated-privilege key is ever used client-side. See
  [`authentication.md`](authentication.md).
- Environment variables (`import.meta.env.VITE_*` for build-time public
  config only) are the mechanism for configuration that must vary by
  environment. Anything genuinely secret has no client-side environment
  variable at all in this repository's current architecture — it requires
  a server boundary that does not yet exist (per ADR-009 follow-up work).
- If a task appears to need a secret client-side, that is a Critical-risk
  stop condition per `../master.md` §9 — stop and ask, do not invent a
  workaround (obfuscation, base64, splitting the string, etc. are not
  mitigations).

## Detection before commit

Before any commit, scan staged content for likely secret patterns (API key
shapes, `sk-`, `Bearer `, connection strings, private key headers). This
is part of the review checklist in
[`../../.codex/standards/security.md`](../../.codex/standards/security.md)
and [`../git/commit-policy.md`](../git/commit-policy.md). If a secret is
found staged, unstage it and stop — do not commit "to fix later."

## Evidence and logging interaction

Evidence collection (`npm run quality:evidence:*`) must never capture
tokens, cookies, or session identifiers in its output files. See
[`logging.md`](logging.md) and
[`../quality/evidence.md`](../quality/evidence.md).

## If a secret was already committed

Treat this as a Git recovery situation, not a documentation fix: rotating
the credential takes priority over history rewriting, and history rewrite
(if any) requires explicit user authorization per
[`../git/git-policy.md`](../git/git-policy.md). Do not attempt a silent
force-push cleanup.

## Related

[`security-policy.md`](security-policy.md),
[`../knowledge/supabase.md`](../knowledge/supabase.md).
