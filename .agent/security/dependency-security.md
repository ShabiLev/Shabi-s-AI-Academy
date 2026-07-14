# Dependency Security

## Purpose

Rules for adding or upgrading dependencies in `package.json` without
introducing supply-chain risk.

## Rules

- Before adding a new dependency, check whether an existing dependency
  already covers the need (see current `dependencies`/`devDependencies` in
  `package.json`: React, React Router, Tailwind, Supabase JS, Playwright,
  Vitest, axe-core, Lighthouse CI).
- Prefer well-known, actively maintained packages with a clear
  publisher/organization over low-download or single-maintainer packages
  for anything touching authentication, data handling, or build tooling.
- New dependencies that can execute code at install time (postinstall
  scripts) or that are unusually broad in scope for the stated need are
  treated with extra scrutiny — document why the package is trusted.
- Run `npm audit`-class checks when dependency scope warrants, per
  [`../../.codex/standards/security.md`](../../.codex/standards/security.md)
  "Related validation." A new High/Critical advisory on a dependency this
  change touches must be resolved or explicitly accepted with a documented
  reason before merge.
- Lockfile changes are reviewed like code: unexpected transitive
  dependency additions or version jumps unrelated to the stated change are
  a signal to stop and check what pulled them in.
- See [`supply-chain.md`](supply-chain.md) for provenance rules that apply
  specifically to research-sourced code/repositories, which are a
  different risk surface from ordinary npm dependency management.

## Review checklist

- Is the new/updated dependency necessary, and does it duplicate existing
  capability?
- Does it have a reasonable maintenance signal (recent releases, known
  publisher)?
- Does `npm audit`-equivalent output show new advisories introduced by
  this change?
- Are lockfile changes limited to what this change actually needs?

## Related

[`security-policy.md`](security-policy.md), [`supply-chain.md`](supply-chain.md),
[`../knowledge/architecture.md`](../knowledge/architecture.md).
