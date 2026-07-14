# Task Classifier

## Purpose

Determine, before any module is loaded or any code is touched, a task's
type, risk level, affected domains, required modules, required tests,
required manual reviews, required evidence, and required release impact.
This is the single decision point [`../master.md`](../master.md) §3 and §5
depend on — no agent may hand-pick modules from memory instead of running
this classification first.

## When to load

Load first, for every task, before any other `.agent/` module. It is listed
in `requiredModules` in [`../manifest.json`](../manifest.json) with
`requiredFor: ["*"]`.

## Prerequisites

- `.agent/master.md` has been read.
- `AGENTS.md` and, if present, `CLAUDE.md` have been read.
- The user's request has been read in full, including any linked issue,
  spec section, or `.codex/release-*/` reference.

## Required actions

1. **Determine task type.** Match the request to exactly one of the 22 task
   types in [`../registry.json`](../registry.json) `taskTypes`:

   - `feature`
   - `bugfix`
   - `hotfix`
   - `refactor`
   - `documentation`
   - `testing`
   - `coverage recovery`
   - `security review`
   - `UX review`
   - `accessibility review`
   - `research`
   - `knowledge ingestion`
   - `release`
   - `deployment`
   - `Git repair`
   - `data migration`
   - `authentication`
   - `synchronization`
   - `AI integration`
   - `MCP integration`
   - `agent creation`
   - `prompt creation`
   - `workflow creation`

   If a request spans more than one type (for example, a feature that also
   touches authentication), classify it as the highest-risk type present and
   load the union of required modules for every type involved.

2. **Determine risk level.** Assign exactly one of `Low`, `Medium`, `High`,
   `Critical` using [`../registry.json`](../registry.json)
   `riskLevelDefaults` as the baseline, then adjust for this specific
   change. Concrete anchors from the governing specification:

   | Change | Risk | Why |
   | --- | --- | --- |
   | Authentication change | High | Supabase auth, session, or credential handling — see [`../security/authentication.md`](../security/authentication.md) |
   | Data migration | High | User-authored or customer data can be lost or corrupted — see [`../security/data-protection.md`](../security/data-protection.md) |
   | UI copy update | Low | No behavior, storage, or security surface changes |
   | Coverage threshold change | Critical, normally prohibited | Silently weakens the quality gate every other task relies on — see [`../quality/coverage.md`](../quality/coverage.md) |
   | External provider integration | High | New network/trust boundary, credential handling, and failure modes |
   | MCP tool with write capability | Critical unless an approval architecture exists | Can mutate state outside the sandbox with no human in the loop — see [`../security/mcp-security.md`](../security/mcp-security.md) |

   Any `Critical` classification is a stop condition per `master.md` §9:
   stop and ask before proceeding unless the user has already given explicit,
   specific authorization for that exact action in the current session.

3. **Determine affected domains.** List every domain the change touches
   (React/TypeScript UI, storage/Supabase sync, routing, i18n/RTL,
   accessibility, security, Git/release process, research pipeline, AI/MCP
   integration). Use the matching `.agent/knowledge/*.md` module per domain,
   for example [`../knowledge/supabase.md`](../knowledge/supabase.md) for
   sync work or [`../knowledge/rtl-ltr.md`](../knowledge/rtl-ltr.md) for
   layout-direction work.

4. **Resolve required modules.** Look up the task type in
   [`../registry.json`](../registry.json) `taskTypes` and load exactly that
   module list (plus `loaders.task-classifier` and `quality.quality-policy`,
   which apply implicitly to every task type). Resolve each entry against
   [`../manifest.json`](../manifest.json) — both a bare path and a manifest
   module ID are valid, per the `taskTypeModuleListsNote` in `registry.json`.
   Never substitute a module list from memory or a prior task.

5. **Determine required tests.** Derive the npm scripts required from the
   task type and risk level via
   [`../quality/test-selection.md`](../quality/test-selection.md) and
   [`workflow/testing.md`](../workflow/testing.md). At minimum: `npm run
   lint`, `npm run test:run`, and `npm run build` for any code change; add
   `npm run test:e2e` / `test:e2e:full`, `test:a11y`, `test:visual`,
   `test:performance` as the risk level and affected domain require.

6. **Determine required manual reviews.** Cross-check against
   [`../quality/manual-review.md`](../quality/manual-review.md). UX-facing
   changes require `manualUxReview`; anything touching authentication,
   secrets, or external calls requires `manualSecurityReview`; user-facing
   copy changes require `manualContentReview`. These three gates exist today
   as `notRun` records in `quality/execution/latest/manual-review.md` and
   must never be marked passed by automation.

7. **Determine required evidence.** Resolve which
   `npm run quality:evidence*` profile applies via
   [`../quality/evidence.md`](../quality/evidence.md): `quality:evidence:fast`
   for routine feature/bugfix work, `quality:evidence:full` for release-scale
   or High/Critical-risk changes, `quality:evidence:pages` when the GitHub
   Pages build is affected, `quality:evidence:headed` when a manual headed
   run is needed to observe a UI journey.

8. **Determine required release impact.** Decide whether the change needs a
   version bump, `CHANGELOG.md` entry, or update to the active
   `.codex/release-*/` specification, using
   [`../release/versioning.md`](../release/versioning.md) and
   [`../release/changelog.md`](../release/changelog.md). Most `Low`/`Medium`
   risk changes land inside the current beta without a version bump; `High`/
   `Critical` changes and anything in `release`/`deployment` task types
   almost always do.

## Prohibited actions

- Loading modules from memory instead of resolving them from
  `../registry.json` and `../manifest.json`.
- Assigning `Low` or `Medium` risk to authentication, data migration,
  external provider integration, or synchronization work by default — these
  are `High` unless a specific, narrow reason is documented.
- Treating a coverage threshold change or a write-capable MCP tool as
  anything other than `Critical` without an existing, documented approval
  architecture.
- Proceeding past a `Critical` classification without stopping to ask, per
  `master.md` §9.
- Classifying a multi-domain task at its lowest-risk component to avoid the
  stricter module/test/review set.

## Deliverables

A short classification record (task type, risk level, domains, resolved
module list, required tests, required manual reviews, required evidence
profile, release impact) stated at the start of the work, before
implementation begins. This does not need its own file for routine tasks;
for `release` and `Critical`-risk tasks, record it in the implementation
plan per [`../templates/implementation-plan.md`](../templates/implementation-plan.md).

## Evidence requirements

The classification itself is not evidence, but it determines which evidence
this task must produce — see step 7 above and
[`../quality/evidence.md`](../quality/evidence.md). If the classification
changes mid-task (new information reveals a higher-risk domain), re-run this
classifier and re-resolve modules; do not keep working under the original,
now-stale classification.

## Exit criteria

Task type, risk level, affected domains, required modules, required tests,
required manual reviews, required evidence profile, and release impact are
all explicitly stated before implementation begins, and every required
module from step 4 has actually been loaded (not just named).
