# Repository Analysis

## Purpose

Required fields and rules for analyzing a GitHub (or equivalent)
repository as a research source.

## Required fields

- `owner`
- `repo`
- `description`
- `language`
- `license`
- `stars`
- `forks`
- `release frequency`
- `recent activity`
- `last commit`
- `contributors`
- `issue activity`
- `doc quality`
- `test quality`
- `security policy` (presence/absence of a security policy or disclosure
  process)
- `archived status`
- `dependency risk`
- `install complexity`
- `maturity`
- `production readiness`
- `use cases`
- `alternatives`
- `limitations`

These map onto `research-source.schema.json` (identity/date fields) plus a
repository-specific extension carried in the source record's notes/tags
until a dedicated repository-metadata field is added to the schema.

## Rules

- **Do not rank a repository only by star count.** Star count is a
  popularity signal, not a quality, security, or maintenance signal.
  Release frequency, recent activity, last commit, contributor count, and
  issue activity together determine whether a repo is actively maintained.
- **Archived repositories are always labelled `archived: true`** and their
  `production readiness` assessment is capped accordingly — an archived
  repo is not "production ready" regardless of past quality.
- **Dependency risk** is assessed, not assumed: check the repo's own
  dependency count/freshness and known supply-chain concerns (see
  `.agent/security/supply-chain.md`, `.agent/security/dependency-security.md`).
- **Do not install or execute code from a researched repository** as part
  of analysis; assessment is based on reading the repository (README,
  manifest files, issues, releases), not running it (see
  `.agent/security/supply-chain.md`).
- **Security policy** presence (e.g. `SECURITY.md`, a disclosure email) is
  recorded explicitly as present/absent — absence is a negative signal for
  production readiness, not an automatic disqualifier.
- **Maturity vs. production readiness are separate judgments.** A repo can
  be mature (long history, stable API) but not production-ready for a
  specific use case (e.g. missing tests, no security policy), or new but
  production-ready if built by a proven team with strong tests and docs.
- **Use cases, alternatives, and limitations** are recorded as short
  factual lists, not marketing language lifted from the README.

## Related modules

`source-ranking.md` (repository activity feeds the ranking rule on
checking activity), `freshness-policy.md` (repositories section),
`.agent/security/supply-chain.md`, `.agent/security/dependency-security.md`.
