# Task classification

Before any module is loaded or any code is touched, every AOS-governed task
is classified using
[`../../.agent/loaders/task-classifier.md`](../../.agent/loaders/task-classifier.md).
This is the single decision point that determines everything else — no
agent may hand-pick modules from memory instead of running this
classification first.

## What gets determined

For a given request, the classifier determines:

1. **Task type** — exactly one of the 22 types listed in
   [`../../.agent/registry.json`](../../.agent/registry.json) `taskTypes`
   (feature, bugfix, hotfix, refactor, documentation, testing, coverage
   recovery, security review, UX review, accessibility review, research,
   knowledge ingestion, release, deployment, Git repair, data migration,
   authentication, synchronization, AI integration, MCP integration, agent
   creation, prompt creation, workflow creation). A request spanning more
   than one type is classified at its highest-risk type, loading the union
   of required modules.
2. **Risk level** — `Low`, `Medium`, `High`, or `Critical`, from
   `registry.json`'s `riskLevelDefaults`, adjusted per change. Authentication,
   data migration, and external provider integration default to `High`.
   Coverage-threshold changes and write-capable MCP tools default to
   `Critical` and are normally prohibited without explicit, separate
   authorization.
3. **Affected domains** — which `.agent/knowledge/*.md` modules apply
   (React/TypeScript UI, storage/Supabase sync, routing, i18n/RTL,
   accessibility, security, Git/release, research, AI/MCP).
4. **Required modules** — resolved from `registry.json`, never from memory.
5. **Required tests** — derived via
   [`../../.agent/quality/test-selection.md`](../../.agent/quality/test-selection.md);
   at minimum `npm run lint`, `npm run test:run`, `npm run build` for any
   code change.
6. **Required manual reviews** — cross-checked against
   [`../../.agent/quality/manual-review.md`](../../.agent/quality/manual-review.md)
   (`manualUxReview`, `manualSecurityReview`, `manualContentReview`).
7. **Required evidence profile** — which `npm run quality:evidence:*`
   profile applies, per [`evidence-system.md`](evidence-system.md).
8. **Required release impact** — whether a version bump, `CHANGELOG.md`
   entry, or release-spec update is needed.

## Stop conditions tied to classification

A `Critical` classification is always a stop condition (see
[`../../.agent/master.md`](../../.agent/master.md) §9): the agent stops and
asks before proceeding unless the user has already given explicit, specific
authorization for that exact action in the current session. Classifying a
multi-domain task at its lowest-risk component to avoid the stricter
module/test/review set is a prohibited action.

## Deliverable

A short classification record — task type, risk level, domains, resolved
module list, required tests, required manual reviews, required evidence
profile, release impact — stated at the start of the work. For `release`
and `Critical`-risk tasks this is recorded in the implementation plan (see
[`../../.agent/templates/implementation-plan.md`](../../.agent/templates/implementation-plan.md));
for routine tasks it does not need its own file.

## Related

[`architecture.md`](architecture.md) for how the resolved modules get
loaded, [`evidence-system.md`](evidence-system.md) for evidence profiles,
and [`../../.agent/precedence.md`](../../.agent/precedence.md) for how
conflicts between loaded modules are resolved.
