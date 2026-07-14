# Security Review Template

## Purpose

Required structure for a security review deliverable, so reviews are
comparable across changes and nothing required gets silently skipped.

## When required

Per `../loaders/task-classifier.md`: authentication changes, authorization
changes, MCP integration, AI integration, data migration, and any change
touching this directory's rule set. Also required before release per
[`../release/release-checklist.md`](../release/release-checklist.md).

## Required sections

1. **Scope** — files/features reviewed, and what was explicitly out of
   scope.
2. **Rules checked** — which `.agent/security/*.md` files apply to this
   change (list by filename) and a pass/fail/not-applicable per file.
3. **Findings** — concrete issues found, each with: location (file/line),
   rule violated, severity (Critical/High/Medium/Low), and recommended
   fix.
4. **Secrets check** — explicit confirmation that a scan for
   secret-shaped strings was run against the diff (see
   [`secrets.md`](secrets.md)) and its result.
5. **Authorization check** — for any cloud-data-touching change, explicit
   confirmation that RLS (or equivalent) is the enforcing control, not UI
   hiding (see [`authorization.md`](authorization.md)).
6. **Dependency check** — any new/updated dependency and its
   [`dependency-security.md`](dependency-security.md) review outcome.
7. **Evidence** — the actual commands run to validate findings (never
   fabricated), per [`../quality/evidence.md`](../quality/evidence.md).
8. **Verdict** — one of: approved, approved with follow-ups (list them),
   or blocked (list what must change before re-review). A verdict of
   "approved" requires zero open Critical/High findings.
9. **Sign-off** — reviewer identity (human or named agent role, per
   [`../agents/security-reviewer.md`](../agents/security-reviewer.md)) and
   date.

## Rules for the review itself

- A review must never mark a check as passed without actually performing
  it (`../master.md` principle 13).
- Findings are never softened to make a release look more ready than it
  is — record accurately, then let [`../release/release-policy.md`](../release/release-policy.md)
  decide the resulting release state.
- If the review surfaces a Critical finding, treat it as a stop condition
  per `../master.md` §9, not something to note and continue past.

## Related

[`security-policy.md`](security-policy.md),
[`../agents/security-reviewer.md`](../agents/security-reviewer.md),
[`../handoff/security-to-release.md`](../handoff/security-to-release.md).
