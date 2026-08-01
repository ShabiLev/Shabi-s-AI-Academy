# Version 1.9.0-beta.1 — Agent Lab, Evaluations and Regression Intelligence

## Release identity

- Baseline SHA: `7c528648761f0b40d1faf1a836c3c619565b75b9`
- Baseline version: `1.8.0-beta.1`
- Branch: `feature/1.9-agent-lab-evaluations`
- Target: `1.9.0-beta.1`
- Risk: High — actor-scoped storage, evidence integrity, versioned entities,
  security-sensitive export, and connected-action preview boundaries

The baseline release validation is recorded as passed. Version 1.9
implementation and release evidence are not yet verified; no planning document
in this folder is release authorization.

## Product objective

Provide an evidence-based Agent Evaluation Lab that compares Agents, prompts,
teams, guidance modes, and versioned workflows under repeatable controls. Every
score and PASS/FAIL result identifies its rubric, criterion, evaluator,
evidence, confidence, missing evidence, and exact compared versions. There is
no unexplained global AI score.

## Honest capability labels

- **Academy deterministic evaluation:** the beta.1 executable mode. It uses
  frozen local snapshots, a fixed seed, bounded repetitions, stored Mission
  outputs, and deterministic Academy evaluators.
- **Real provider evaluation:** not implemented in beta.1. It may be discussed
  only as unavailable future capability until a server-side credential,
  consent, cost, policy, and audit boundary exists.
- **Preview-only connected action:** creates an inert, expiring local draft
  showing target, payload summary, permissions, risk, and recovery. It never
  writes externally.
- **Actual connected execution:** unavailable in beta.1. Connector availability
  must come from real connector state and never from a fabricated UI flag.

## Controlling modules

1. [Product requirements](01-product-requirements.md)
2. [Evaluation architecture](02-evaluation-architecture.md)
3. [Rubric model](03-rubric-model.md)
4. [Experiment runtime](04-experiment-runtime.md)
5. [Trace and evidence](05-trace-and-evidence.md)
6. [Versioning and regression](06-versioning-and-regression.md)
7. [Connected preview](07-connected-preview.md)
8. [Security and privacy](08-security-privacy.md)
9. [Test strategy](09-test-strategy.md)
10. [Release plan](10-release-plan.md)
11. [Rollback plan](11-rollback-plan.md)
12. [Version 1.9 test matrix](12-test-matrix.md)

Supporting delivery documents:

- [Implementation plan](../../docs/version-1.9-implementation-plan.md)
- [Agent role roster](../../docs/version-1.9-agent-roster.md)
- [Evaluation guide](../../docs/evaluation-guide.md)
- [Rubric guide](../../docs/rubric-guide.md)
- [Trace guide](../../docs/trace-guide.md)
- [Codex export guide](../../docs/codex-export-guide.md)

## Mandatory epics

- A. Evaluation Arena
- B. Rubric Builder
- C. Independent Evaluator Agents
- D. Controlled Experiment Runtime
- E. Run Trace Viewer
- F. Agent and Prompt Versioning
- G. Regression Suites
- H. Failure Library
- I. Adaptive Learning Evidence
- J. Evidence-Based Team Recommendations
- K. Connected Workflow Preview
- L. Codex Export
- M. Migration, Backup, Analytics and Governance
- N. Full Testing and Release

## Architecture contract

- Domain validation, repositories, deterministic runtime, and export parsers
  remain framework-independent.
- React pages consume typed contexts and never call providers or connectors.
- Built-in rubrics and evaluator definitions are immutable catalog data; user
  clones and versions are actor-scoped.
- Starting a run freezes all inputs and versions. Restarting or changing a
  competitor creates a new run.
- Certified results are immutable. Cancellation never invents partial scores.
- Incomplete required evidence is `not-scored`, not zero.
- Evaluators are read-only and independent of the implementation they assess.
- Imported content is bounded, inert text. No imported Agent is executable.
- Version 1.8 Mission data remains readable and is never destructively rewritten.

## Implementation phases

1. Specifications, domain models, validators, and failing tests.
2. Rubric catalog, builder, and independent evaluators.
3. Immutable snapshots, versions, repositories, migration, and backup.
4. Deterministic experiment runtime and Pause/Continue drift protection.
5. Arena, results, comparison, trace, and accessible chart alternatives.
6. Regression suites, Failure Library, Skill Map, and team recommendations.
7. Connected preview and Codex TOML export with round-trip validation.
8. Bilingual Help, privacy, analytics governance, and release documentation.
9. Focused, full, visual-twice, security, performance, and exact-SHA evidence.
10. PR review, independent Reality Check, merge, tag, deploy, and smoke.

## Acceptance contract

- A run accepts 2–5 competitors, bounded repetitions, a non-empty seed, one
  immutable Mission snapshot, one rubric version, and at least one independent
  evaluator.
- Identical frozen inputs and seed produce identical Academy results.
- A blocking failed criterion prevents certification even when the weighted
  score passes.
- Missing required evidence prevents scoring and certification.
- Evaluator disagreement stays visible and is never silently averaged.
- No Agent or evaluator approves its own implementation.
- Regression baselines cannot be replaced silently; critical regression blocks
  publication.
- Every trace omits hidden chain-of-thought, secrets, raw local paths, private
  documents, and raw Mission content from analytics.
- Codex export contains no secrets, local paths, unsupported permissions, or
  hidden runtime claims and passes parser round-trip plus checksum validation.
- All flows are bilingual, RTL/LTR-correct, keyboard complete, responsive at
  320px, and use non-colour status cues.
- Release requires current exact-SHA CI, independent Reality Check, deployment
  verification, and production smoke. Manual review statuses remain honest.
