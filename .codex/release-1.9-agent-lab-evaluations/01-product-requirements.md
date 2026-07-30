# Version 1.9 product requirements

## Problem and outcome

Version 1.8 can coordinate a Mission but does not answer which Agent, prompt,
team, or workflow performs best and why. Version 1.9 adds controlled,
inspectable evaluations without implying live-model or connected execution.

A learner must be able to define a fair comparison, inspect criterion-level
evidence, understand uncertainty and disagreement, detect regressions, turn
failures into practice, and export a validated Agent definition safely.

## Primary journeys

1. **Compare:** create an evaluation, select 2–5 versioned competitors, freeze
   one Mission and Context Pack, choose rubric/evaluators/seed/repetitions, run,
   inspect evidence, and certify or request evidence.
2. **Build a rubric:** clone a built-in rubric or create a user rubric, define
   anchors and evidence requirements, reach exactly 100 weight, preview its
   effect, and save an immutable version.
3. **Investigate:** filter a trace by Agent, phase, result, permission, retry,
   and evidence type without exposing chain-of-thought.
4. **Regress:** run a reusable suite against a protected baseline, inspect
   per-case changes, and block publication for a critical regression.
5. **Learn:** save a reviewed failure case, attach evidence, and derive
   removable practice evidence and recommendations.
6. **Preview/export:** inspect a local connected-action draft or Codex TOML
   export. Nothing is installed or written externally by the browser.

## Routes

- `/evaluations`
- `/evaluations/new`
- `/evaluations/:evaluationId`
- `/evaluations/:evaluationId/results`
- `/evaluations/:evaluationId/trace`
- `/evaluation-suites`
- `/evaluation-suites/:suiteId`

Unknown or actor-inaccessible IDs render a safe not-found state without
revealing whether another actor owns the record.

## Functional requirements

### Arena and results

- Compare Agent A/B, prompt versions, teams, guidance modes, QA/no-QA, preset
  versus custom team, and Mission versions.
- Display per-criterion status, score when allowed, confidence, evidence,
  missing evidence, evaluator, versions, sample size, and limitations.
- Charts include honest axes and equivalent text/table summaries.

### Rubrics and evaluators

- Ship eight immutable built-ins: General Mission Quality, React UI Feature,
  SQL / Data Query, Prompt Quality, Agent Definition, Release Readiness,
  Accessibility Review, and Security Review.
- Ship read-only Requirements, Code Quality, Security, Accessibility, UX, SQL
  Correctness, Test Coverage, and Reality Checker evaluators.
- Preserve evaluator disagreement. A low-confidence PASS cannot certify release
  readiness and Reality Checker may block certification.

### Runtime and trace

- Freeze inputs after start, preserve exact progress on pause, detect version
  drift on continue, and fork instead of mixing changed versions.
- Record input/result hashes, all entity versions, evaluator progress,
  timestamps, evidence references, retries, gates, and next action.
- Never expose hidden chain-of-thought.

### Versions, suites, failures, and learning

- Version Agents, prompts, teams, presets, and rubrics immutably.
- Compare versions, show changelog/usage, mark active/deprecated, and roll back
  by creating a new version.
- Preserve all suite runs and require an explicit reviewed action to establish
  or replace a baseline.
- Store reviewed Failure Cases separately from system examples.
- Skill evidence requires repeated high-confidence independent evidence for
  `mastered`; visits and one successful run never confer mastery.

### Recommendations

Every recommendation shows source (`System default`, `Observed locally`,
`Community-derived`, or `User preference`), comparable run count, success
rate, average retries, common failures, confidence, freshness, and limitations.
Small samples are visibly low confidence.

### Preview and export

- Preview GitHub, Jira, Confluence, Gmail, Calendar, and Codex draft actions.
- Unsupported or disconnected targets show `Unavailable`.
- Connected previews expire and remain local; they never perform a write.
- Codex TOML export is previewed, parsed back, checksummed, and accompanied by
  an omitted-field report. Browser installation is forbidden.

## UI states

Cover empty, invalid setup, draft, ready, running, paused, needs evidence,
completed, disagreement, regression, blocked, cancelled, unavailable, expired,
and corrupted recovery. Mobile order is setup, summary, expandable criteria,
then trace/evidence, with sticky actions that do not obscure focus.

## Non-functional requirements

- Local-first, actor-isolated, bounded, deterministic, migration-safe.
- Hebrew RTL and English LTR with WCAG 2.2 AA target.
- Keyboard complete, visible focus, live progress announcements, 44x44 targets,
  reduced motion, 200% zoom, accessible tables/charts, and no 320px overflow.
- No credentials, external writes, provider claims, personality profiling,
  public leaderboard, cloud collaboration, billing, or arbitrary Agent import.

## Product acceptance

Each epic is accepted only with automated evidence appropriate to its risk,
bilingual UI execution, storage and corruption tests, security review, and
traceable exact-SHA CI. Human UX/security/content and visual-baseline approval
remain explicit manual gates.
