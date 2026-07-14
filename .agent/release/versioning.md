# Versioning

## Purpose

Describe the current application version scheme so every version
reference (package.json, footer, About page, AOS manifest) stays
consistent, per [`../../.codex/standards/versioning.md`](../../.codex/standards/versioning.md).

## Scheme

- The application uses **SemVer with a prerelease tag**:
  `MAJOR.MINOR.PATCH-beta.N`.
- The current application version, per `package.json`'s `"version"`
  field, is **`1.4.0-beta.1`**, matching `.agent/manifest.json`'s
  `applicationVersion` and `.agent/master.md`'s header. All three were
  bumped together in the same change that introduced the AOS, per the
  rule below — do not let these drift silently.
- `-beta.N` increments (`beta.1` → `beta.2`) for iterations that are not
  yet a final release of that MAJOR.MINOR.PATCH. Dropping the prerelease
  tag entirely (e.g. `1.3.0-beta.1` → `1.3.0`) marks a final release.
- AOS itself (`.agent/`) has its own independent version
  (`.agent/master.md` "AOS version," backed by `.agent/VERSION`), separate
  from the application version — per
  [`../../.codex/standards/versioning.md`](../../.codex/standards/versioning.md),
  documentation/Kit versioning and application versioning are never
  equated.

## Rules

- Never bump the version unless the task actually requires it (a real
  release, not routine documentation work) — per
  `../../.codex/standards/versioning.md` "Forbidden practices," unrequested
  bumps are not allowed.
- Never reuse a version number that has already been released.
- Every visible/generated version reference (package.json, UI footer/About
  surface if present, `.agent/master.md` header, `.agent/manifest.json`
  `applicationVersion`) is checked together — see
  [`../quality/reporting.md`](../quality/reporting.md) and `docs:check`
  (`npm run docs:check`) for automated consistency checks already in this
  repo.
- CHANGELOG entries are added only when application behavior actually
  changes — see [`changelog.md`](changelog.md).

## Related

[`release-policy.md`](release-policy.md), [`changelog.md`](changelog.md),
[`../../.codex/standards/versioning.md`](../../.codex/standards/versioning.md).
