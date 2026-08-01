# Version 1.9 implementation plan

## Classification

- Task type: release-scale feature
- Risk: High
- Domains: evaluation, Mission snapshots, storage/migration/backup, UI/i18n,
  accessibility, security/privacy, analytics, export, testing, CI, deployment
- Evidence profile: focused tests followed by full release evidence and
  exact-SHA CI
- Manual reviews: UX, content, security, accessibility assistive experience,
  visual baselines, PR, and independent Reality Check

Baseline `7c528648761f0b40d1faf1a836c3c619565b75b9` is the verified Version
1.8 release base recorded by the release specification. Version 1.9
implementation is not verified at plan creation.

## Scope boundaries

Implement a local-first deterministic Evaluation Lab, immutable versions,
regression suites, safe traces/evidence, Failure Library, evidence-based
learning/recommendations, connected-action previews, and Codex TOML export.

Do not add a backend, browser credential, provider SDK, external write, public
leaderboard, cloud collaboration, billing, executable imported Agent, hidden
score, personality profile, or automatic Codex installation.

## Work breakdown

### Phase 1 — Models, validators, and test foundations

- Create an evaluation domain beside existing `src/missions`, following its
  typed validation/repository/context separation.
- Define experiments, runs, rubrics, findings, evidence, traces, versions,
  suites, Failure Cases, recommendations, previews, and export results.
- Add canonical serialization, safe IDs, checksums, injected clock/ID/seed
  helpers, and exact bounds.
- Create failing unit fixtures for the risk cases in the
  [test matrix](../.codex/release-1.9-agent-lab-evaluations/12-test-matrix.md).

Exit: schemas and adversarial validators pass focused tests; no React/storage
dependency exists in the domain layer.

### Phase 2 — Rubrics and independent evaluators

- Add immutable bilingual catalogs for eight rubrics and eight evaluators.
- Implement exact weight/anchor/evidence validation and clone provenance.
- Implement criterion findings, `not-scored`, blocking rules, confidence,
  disagreement, and Reality Checker decision.

Exit: no score without evidence; no self-evaluation; certification cases pass.

### Phase 3 — Versioning, repositories, migration, and backup

- Add immutable entity/snapshot versions and active/deprecated pointers.
- Add all nine actor-scoped evaluation repository domains, including evidence and traces.
- Implement quotas, checksum, quarantine, retention, deduplication, domain
  reset, idempotent migration, and transactional backup/import.
- Preserve all Version 1.8 keys and behavior.

Exit: clean/migrated/corrupt/oversized/cross-actor tests pass with rollback.

### Phase 4 — Deterministic runtime

- Validate/freeze experiment setup and hashes.
- Run stable competitor/repetition/evaluator ordering.
- Persist atomic checkpoints, trace/evidence, stop/cancel/retry, and
  pause/reload/continue drift detection.
- Keep real-provider and connected execution unavailable.

Exit: identical inputs are repeatable; drift forks/blocks without mixed versions.

### Phase 5 — Arena, results, and trace UI

- Add lazy routes declared by the product requirements to the existing router.
- Add typed provider/context integration and Control Room layout.
- Implement setup, results, comparison, trace filters, evidence disclosure,
  charts with table/text alternatives, and all required states.
- Integrate navigation, Dashboard, Search/Command Palette where applicable,
  bilingual copy, Help, privacy, and WALK ME regression.

Exit: component and real-browser Hebrew/English desktop/mobile flows pass.

### Phase 6 — Suites, failures, learning, recommendations

- Implement immutable suite baselines and per-case classifications.
- Add reviewed Failure Case creation and provenance.
- Derive removable Skill Map practice/demonstrated/mastered evidence.
- Derive recommendations only from comparable runs with sample/confidence/
  freshness limitations.

Exit: critical regression blocks publication and learning has no visit shortcut.

### Phase 7 — Preview and Codex export

- Implement local expiring previews with real availability boundary and no
  network write path.
- Implement allowlisted TOML serialization, escaping, parse-back validation,
  checksum, preview/download, and omitted-field report.
- Instrument security and E2E tests to prove preview never writes or installs.

Exit: unsupported targets are unavailable; adversarial export inputs remain inert.

### Phase 8 — Governance and documentation

- Add only allowlisted, consent-gated, redacted analytics.
- Update architecture, evaluation/rubric/trace/export guides, Help, privacy,
  release notes, rollback, README, AGENTS/AOS metadata, and changelog after
  implemented behavior is verified.
- Add `test:version-1.9` using repository test conventions.

Exit: docs match code, docs check passes, and no planned capability is described
as shipped.

### Phase 9 — Verification and release

- Run focused tests, full commands from the test strategy, complete visuals
  twice, performance/security/storage, hygiene, and exact-SHA evidence.
- Conduct independent reviewers and Reality Check.
- Follow PR → exact PR SHA → main merge SHA → tag → deployment → smoke flow.

Exit: only current evidence and actual manual statuses determine release state.

## Risk-to-control map

| Risk | Prevention | Proof |
| --- | --- | --- |
| Misleading AI comparison | persistent capability label and no provider path | component/E2E/copy review |
| Score without evidence | `not-scored` domain invariant | unit/integration |
| Mixed versions | frozen refs, hashes, drift fingerprint | unit/E2E pause/reload |
| Self-certification | role independence validator | negative security tests |
| Data loss/leakage | actor scope, transaction, quarantine | storage/import tests |
| Silent external write | no write API, unavailable default, instrumented network | security/E2E |
| Export injection | allowlist, escaping, parser round-trip | fuzz/round-trip tests |
| Inaccessible/misleading result | semantic tables, text alternatives, confidence/sample | a11y/manual/visual |
| Performance collapse | bounded data and long-run fixtures | measured performance gate |

## Dev–QA loop

Each unit of work follows implement → focused developer test → independent QA
analysis → smallest fix. After three failed loops, stop that unit, preserve
evidence, and escalate the exact unresolved root cause to the Conductor.
