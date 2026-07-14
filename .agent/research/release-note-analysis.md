# Release Note Analysis

## Purpose

How to extract release-impact claims from upstream release notes and
changelogs. A specialization of `news-analysis.md`'s "release" category
for structured, version-tagged sources.

## Required fields

- `project` / `repository`
- `version`
- `release date`
- `breaking changes`
- `deprecations`
- `security fixes`
- `new features`
- `migration steps` (if the release notes specify any)
- `upstream source` (link to the actual release/tag/changelog, not a
  secondary summary)

## Rules

- Extract claims from the release notes text as a starting point, but
  verify materially important claims (breaking changes, security fixes)
  against the actual diff or issue tracker when feasible, rather than
  trusting changelog prose alone (see `claim-verification.md`) —
  changelogs are written by maintainers and are generally Tier 1 as a
  statement of "what the maintainers say changed," but severity/impact
  framing can be optimistic.
- Classify severity: breaking change > deprecation > security fix (handle
  per `.agent/security/security-policy.md` in addition) > new feature >
  internal/no external impact.
- A release note claim feeds `freshness-policy.md`'s repository rules
  (recent releases move a repo toward `current`) and can generate a
  Release-impact note content candidate (see `content-generation.md`).

## Related modules

`news-analysis.md`, `repository-analysis.md`, `freshness-policy.md`,
`content-generation.md`.
