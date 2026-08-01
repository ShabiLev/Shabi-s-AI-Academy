# Version 1.9 Agent role roster

## Operating rules

This roster defines delivery responsibilities; it does not claim that a role
has completed work. Actual assignments, status, evidence, and handoffs belong
in the authoritative task/PR state.

- The Conductor owns one authoritative task state and dependency order.
- No Agent approves its own implementation.
- Implementers may edit only their assigned scope.
- Evaluators, auditors, reviewers, Evidence Collector, Test Results Analyzer,
  UI Finish-Gate Reviewer, and Reality Checker are read-only unless the
  Conductor opens a separate fix task.
- Maximum three Dev–QA loops per task; unresolved failure then escalates.
- Handoffs contain decisions and evidence, never private chain-of-thought.
- Only exact executed evidence may satisfy a gate.

## Selected roles

| Role | Responsibility | Permissions | Inputs | Expected output | Quality gate | Handoff | Production source edit |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Agents Orchestrator / Conductor | task graph, isolation, status, gates | coordinate/read; assign bounded writes | master prompt, AOS, Git/evidence state | authoritative plan and handoffs | all owners/gates explicit | Reality Checker / Release Manager | No |
| Product Manager | problem, journeys, acceptance, scope | read/docs | product prompt, V1.8 behavior | product requirements and release claims | all epics trace to acceptance | Senior Project Manager | No |
| Senior Project Manager | phases, dependencies, risks, escalation | read/docs | requirements, roster, release flow | implementation/release plan | owners and exit criteria complete | Conductor | No |
| Workflow Architect | experiment and pause/continue workflow | scoped domain/docs | state models, Mission runtime | transition contract | invalid/drift paths explicit | Software Architect | Yes |
| Software Architect | module boundaries and integration | architecture review; scoped source | repo architecture, storage/routes | architecture decision and interfaces | React/domain/storage separation | Frontend / Data / Tooling | Yes |
| Multi-Agent Systems Architect | evaluator independence, handoffs, certification | scoped domain/docs | roster, rubric/runtime models | role and independence validators | no self-evaluation/approval | Runtime implementer / Security | Yes |
| Data Engineer | schemas, hashes, repositories, migration | scoped data source/tests | V1.8 storage/backup, limits | repositories and migration | idempotent, actor-isolated, transactional | QA / Security | Yes |
| Frontend Developer | Arena, Builder, trace, suites, responsive UI | scoped UI source/tests | IA, design, domain APIs, i18n | bilingual accessible components/routes | component/E2E/a11y/visual | UX/UI reviewers and QA | Yes |
| Prompt Engineer | deterministic evaluator/rubric copy | scoped catalog/docs | rubric anchors, safe-output rules | bilingual inert evaluator definitions | evidence-first, no capability inflation | Product / Security / QA | Yes |
| Developer Tooling Engineer | scripts, fixtures, test command, export parser | scoped tooling/tests | package scripts, CI/evidence conventions | `test:version-1.9` and safe tooling | deterministic, cross-platform, exact exit | QA / DevOps | Yes |
| UX Architect | information hierarchy and task completion | read-only review | routes, states, journeys | journey findings | desktop/mobile states coherent | Frontend / Product | No |
| UI Designer | Control Room layout and visual semantics | read-only review | design tokens, states, charts | visual specification/findings | no misleading chart/status | Frontend / Finish Gate | No |
| UX Researcher | comprehension and trust-label review | read-only review | copy, personas, limitations | evidence-based usability risks | simulation/preview understood | Product / UX Architect | No |
| Persona Walkthrough Specialist | Hebrew/English novice/expert walkthroughs | read-only browser review | deployed/preview UI, scenarios | journey evidence and defects | all personas complete or explicit notRun | UX Architect / QA | No |
| UI Finish-Gate Reviewer | final visual/responsive judgment | read-only review | reviewed candidates and browser UI | accept/block findings | meaningful visual defects resolved | Reality Checker | No |
| Test Automation Engineer | risk-based automated coverage | tests only unless separate fix task | test matrix, implementation | unit/component/integration/E2E tests | coverage proves requirements | Results Analyzer | No production source |
| Evidence Collector | command/SHA/result capture | read/execute tests | exact tree/SHA and gate list | sanitized evidence manifests | integrity check matches exact SHA | Results Analyzer | No |
| Test Results Analyzer | correlate failures and coverage | read-only | logs, artifacts, baselines | pass/fail/root-cause assessment | no failure softened or omitted | Conductor / developer fix task | No |
| Accessibility Auditor | WCAG 2.2 AA review | read-only | UI, axe, keyboard scenarios | accessibility findings | blocker defects resolved | Frontend fix task / Reality Checker | No |
| Performance Benchmarker | bundle/runtime/mobile measurement | read-only execute | verified build and workload fixtures | measured budget comparison | no material regression | Conductor / developer fix task | No |
| Code Reviewer | correctness, regression, maintainability | read-only | scoped diff and tests | prioritized findings | critical/high resolved | Conductor | No |
| Application Security Engineer | threat model and control verification | read-only | storage, import, export, preview paths | security findings | no exploitable boundary failure | Conductor / fix owner | No |
| AI-Generated Code Security Auditor | injection/capability/unsafe-code audit | read-only | generated code/content/export | AI-specific security findings | no execution or fabricated capability | AppSec / Conductor | No |
| Secrets and Credential Hygiene Engineer | secret/path/privacy scan | read-only execute | diff, build, artifacts, logs | scan evidence and findings | no secret or private path | AppSec / Release Manager | No |
| Git Workflow Master | branch, commits, containment, tag identity | Git read; scoped feature operations | actual Git/PR state | safe commands and containment evidence | no direct/unreviewed main push | DevOps / Release Manager | No source |
| DevOps Automator | CI/deploy workflow verification | workflow/deploy scope only | exact SHA, workflows, platform state | exact-SHA CI/deploy evidence | stable jobs and SHA parity | Release Manager / Reality Checker | Workflow only |
| Reality Checker | independent final release assessment | read-only | complete diff, evidence, manual status | Ready / warnings / Blocked with reasons | independence and exact-SHA evidence | Release Manager | No |

## Evaluated but not selected

| Role | Decision | Reason |
| --- | --- | --- |
| Backend Architect | Not selected for beta.1 implementation | The approved beta.1 boundary is browser-local deterministic simulation with no server, provider, credential, cloud-sync, or write-capable connector. Activate this role if implementation introduces any server boundary. |

## Separation examples

- Frontend/Data/Runtime implementers cannot serve as evaluator or Reality
  Checker for their own output.
- Test Automation may write tests but cannot change production code while
  evaluating a failure; the Conductor opens a separate developer fix task.
- UI Finish Gate reviews candidate images but cannot update baselines.
- DevOps verifies deployment identity but does not waive application,
  accessibility, security, or manual gates.
