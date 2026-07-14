# Planning

## Purpose

Turn a classified task into a concrete implementation plan before any code
is touched. This is phase 6 of [`development.md`](development.md) and is
required for `feature`, `refactor`, and `data migration` task types per
[`../manifest.json`](../manifest.json).

## When to load

Load immediately after [`../loaders/task-classifier.md`](../loaders/task-classifier.md)
has produced a task type, risk level, and domain list, and before
[`implementation.md`](implementation.md). Skip for pure `documentation`,
`bugfix`, or `hotfix` tasks — those go straight to
[`debugging.md`](debugging.md) once a root cause is found, since a
reproduction *is* the plan.

## Prerequisites

- Task classification from [`../loaders/task-classifier.md`](../loaders/task-classifier.md)
  is complete.
- `.codex/architecture/overview.md` and the relevant
  `.agent/knowledge/*.md` module for the affected domain have been read.
- Any accepted ADR in `.codex/adr/` touching the affected area has been
  checked.

## Required actions

1. State the problem and user value in one or two sentences — what
   observable behavior changes and for whom.
2. State scope and out-of-scope explicitly. List files/components/routes
   expected to change and name anything adjacent that will *not* change.
3. Identify UX states affected (empty, loading, success, failure,
   cancellation, retry, approval) per
   [`.codex/standards/qa.md`](../../.codex/standards/qa.md) "Required
   coverage dimensions".
4. Identify data model impact: does this read/write local storage, Supabase
   cloud sync, or built-in catalogs — see
   [`../knowledge/storage.md`](../knowledge/storage.md) and
   [`../knowledge/supabase.md`](../knowledge/supabase.md). Catalog data and
   user-owned data must remain separate.
5. Identify security/privacy constraints using
   [`../security/security-policy.md`](../security/security-policy.md) and,
   for authentication-adjacent work,
   [`../security/authentication.md`](../security/authentication.md).
6. Identify bilingual/RTL impact: every new user-facing string needs Hebrew
   and English copy and a semantic RTL/LTR layout — see
   [`../knowledge/i18n.md`](../knowledge/i18n.md) and
   [`../knowledge/rtl-ltr.md`](../knowledge/rtl-ltr.md).
7. Define acceptance criteria as observable, testable statements, not
   implementation detail.
8. List dependencies: other in-flight work, upstream data, or a prior AOS
   module that must be loaded first (per
   [`../registry.json`](../registry.json)).
9. State version/release impact per
   [`../release/versioning.md`](../release/versioning.md) — does this land
   inside the current beta or require a changelog entry.
10. Define the test plan: which npm scripts from
    [`../quality/test-selection.md`](../quality/test-selection.md) will be
    run, and what new test cases are needed.
11. For non-trivial or `High`/`Critical`-risk work, write the plan into
    [`../templates/implementation-plan.md`](../templates/implementation-plan.md)
    rather than keeping it only in conversation.

## Prohibited actions

- Starting implementation before scope, acceptance criteria, and test plan
  are stated.
- Treating "Definition of Ready" in
  [`.codex/standards/qa.md`](../../.codex/standards/qa.md) as optional for
  anything beyond a trivial copy fix.
  Material unknowns need an owner or a blocking decision, not an invented
  answer.
- Silently expanding scope beyond what was planned without re-stating scope.
- Skipping the RTL/i18n or data-separation checks because the change "looks
  backend-only" — verify, don't assume.

## Deliverables

- A stated problem/scope/acceptance-criteria/test-plan, either inline or as
  an `implementation-plan.md`-shaped document, before phase 8 of
  `development.md` begins.

## Evidence requirements

None directly — planning produces a document, not a test run. The plan's
test list feeds [`testing.md`](testing.md) and its evidence requirements
feed [`../quality/evidence.md`](../quality/evidence.md).

## Exit criteria

Problem, scope, out-of-scope, UX states, data model impact, security
constraints, bilingual/RTL impact, acceptance criteria, dependencies, version
impact, and test plan are all stated and reviewable, per the Definition of
Ready in [`.codex/standards/qa.md`](../../.codex/standards/qa.md).
