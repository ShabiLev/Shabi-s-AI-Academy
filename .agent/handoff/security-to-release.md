# Security to Release Handoff

## Purpose

Defines the specific handoff contract from `security-reviewer` to
`release-manager` when a security review of release-bound changes is
complete. Uses the field set defined in `.agent/handoff/handoff-template.md`.

## Field guidance for this pair

- **Task / Scope** — which changes were in scope for this security review;
  note anything explicitly out of scope.
- **Branch / Starting commit / Latest commit** — the release branch and
  commit reviewed.
- **Files changed** — files reviewed for security-relevant surface
  (secrets, auth, frontend security, dependencies, logging, MCP).
- **Tests executed** — any automated security/dependency check run; most
  security review is manual, so state that explicitly rather than
  implying automated coverage.
- **Evidence path** — the completed
  `.agent/security/security-review-template.md` document.
- **Open failures** — any unresolved finding, by severity; a Critical
  finding blocks release regardless of other gates.
- **Warnings** — lower-severity findings accepted for this release with a
  stated reason.
- **Manual review** — confirmation that a human performed this security
  review; automation alone cannot satisfy this gate.
- **Next action** — whether `release-manager` can treat security as
  cleared, or what must be resolved first.
- **Prohibited assumptions** — `release-manager` must not assume "no
  findings reported" means "fully reviewed" without checking the review
  document exists and is complete; must not waive a Critical finding
  without explicit user authorization.

## Shared reference

See `.agent/handoff/handoff-template.md` for the full field list and
`.agent/agents/security-reviewer.md` / `.agent/agents/release-manager.md`
for the roles' responsibilities.
