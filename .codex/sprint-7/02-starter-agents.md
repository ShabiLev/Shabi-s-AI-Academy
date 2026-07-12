# Sprint 7 Starter Agents Specification

## Purpose and ownership

Ship a read-only built-in Starter Agents Catalog distinct from My Agents. Entries are bilingual, immutable, approved, and educational; planned tools are capability labels, not connected integrations. Explicit import creates a new editable local agent at version 1 with sourceCatalogId, source hash, timestamps, and import attribution. Existing copies trigger Open Existing, Import Another, or Cancel; no silent overwrite/duplicate.

## Catalog schema and validation

Each entry requires stable ID, category, Hebrew/English names, description, role, goal, expected inputs, instructions, planned tools/status, memory strategy, validation rules, retry policy, approval points, output format, completion criteria, risk notes, deterministic Mock example, import policy, quality target, immutable flag, schema version, and approved status. IDs/source hashes and normalized bodies are unique. Only approved entries ship.

## Curated definitions

### QA Release Analyst

- **ID/category:** `qa-release-analyst` / `qa`
- **Hebrew / English:** מנתח/ת איכות לשחרור / QA Release Analyst
- **Description, role, goal:** Educational specialist that helps learners assess release evidence and expose blockers. Role: QA Release Analyst. Goal: Assess release evidence and expose blockers.
- **Expected inputs:** release scope, test results, defects, known risks.
- **Instructions:** Compare evidence to explicit gates; cite supplied facts; separate blockers, warnings, and unknowns.
- **Planned tools:** planned: read-only QA evidence parser, risk matrix. Display as planned/unconnected.
- **Memory strategy:** run-scoped facts only.
- **Validation:** requires release criteria and evidence; no invented pass status.
- **Retry policy:** retry once for malformed structured evidence.
- **Approval points:** human confirms final go/no-go recommendation.
- **Output format:** JSON summary plus reviewable Markdown.
- **Completion criteria:** all criteria mapped or marked unknown.
- **Risk notes:** May overstate readiness; recommendation is advisory.
- **Mock Run example:** Given two failed critical tests, Mock returns No-Go with cited blockers.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **90/100**.

### Test Case Generator

- **ID/category:** `test-case-generator` / `qa`
- **Hebrew / English:** מחולל/ת מקרי בדיקה / Test Case Generator
- **Description, role, goal:** Educational specialist that helps learners produce risk-based traceable test cases. Role: Test Case Generator. Goal: Produce risk-based traceable test cases.
- **Expected inputs:** requirements, acceptance criteria, constraints.
- **Instructions:** Cover positive, negative, boundary, accessibility, recovery, and assumptions.
- **Planned tools:** planned: requirements parser, test table formatter. Display as planned/unconnected.
- **Memory strategy:** none beyond current run.
- **Validation:** reject empty/title-only requirements; each case needs expected result.
- **Retry policy:** no retry unless formatter validation fails.
- **Approval points:** approval before importing generated cases.
- **Output format:** structured test-case table.
- **Completion criteria:** risks traced and missing criteria listed.
- **Risk notes:** Generated coverage requires human review.
- **Mock Run example:** Mock creates six representative cases and flags one ambiguity.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **88/100**.

### Bug Triage Agent

- **ID/category:** `bug-triage-agent` / `qa`
- **Hebrew / English:** סוכן/ת מיון תקלות / Bug Triage Agent
- **Description, role, goal:** Educational specialist that helps learners improve reproducibility and propose severity. Role: Bug Triage Agent. Goal: Improve reproducibility and propose severity.
- **Expected inputs:** bug report, environment, evidence.
- **Instructions:** Separate facts from inference; identify missing steps; suggest duplicates only as candidates.
- **Planned tools:** planned: defect schema validator, duplicate-search placeholder. Display as planned/unconnected.
- **Memory strategy:** run-scoped report.
- **Validation:** expected/actual and environment gaps explicit.
- **Retry policy:** one retry after corrected input.
- **Approval points:** human approves severity and duplicate decision.
- **Output format:** triage card with questions.
- **Completion criteria:** report is reproducible or gaps remain explicit.
- **Risk notes:** Incorrect severity affects prioritization.
- **Mock Run example:** Mock flags missing browser version and proposes Medium.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **90/100**.

### Regression Scope Planner

- **ID/category:** `regression-scope-planner` / `qa`
- **Hebrew / English:** מתכנן/ת היקף רגרסיה / Regression Scope Planner
- **Description, role, goal:** Educational specialist that helps learners map changes to regression risk and coverage. Role: Regression Scope Planner. Goal: Map changes to regression risk and coverage.
- **Expected inputs:** diff summary, architecture, prior defects.
- **Instructions:** Rank likelihood/impact and link each test recommendation to changed behavior.
- **Planned tools:** planned: change-map parser, risk matrix. Display as planned/unconnected.
- **Memory strategy:** run-only change facts.
- **Validation:** unknown dependencies remain unknown.
- **Retry policy:** one retry for malformed change list.
- **Approval points:** human approves exclusions.
- **Output format:** risk-to-test matrix.
- **Completion criteria:** every high risk has evidence or test.
- **Risk notes:** Incomplete dependency map can omit risk.
- **Mock Run example:** Mock maps routing change to auth/deep-link tests.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **90/100**.

### Requirements Reviewer

- **ID/category:** `requirements-reviewer` / `qa`
- **Hebrew / English:** סוקר/ת דרישות / Requirements Reviewer
- **Description, role, goal:** Educational specialist that helps learners find ambiguity and testability gaps. Role: Requirements Reviewer. Goal: Find ambiguity and testability gaps.
- **Expected inputs:** feature brief, user value, constraints.
- **Instructions:** Review scope, edge cases, acceptance, privacy, accessibility, operations.
- **Planned tools:** planned: requirement checklist. Display as planned/unconnected.
- **Memory strategy:** run-scoped.
- **Validation:** no fabricated decisions; prioritize P0/P1/P2 questions.
- **Retry policy:** none.
- **Approval points:** human resolves P0 questions.
- **Output format:** findings and revised criteria.
- **Completion criteria:** all blocking ambiguity identified.
- **Risk notes:** May impose unnecessary scope.
- **Mock Run example:** Mock returns two P0 questions and three criteria.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **92/100**.

### Exploratory Testing Coach

- **ID/category:** `exploratory-testing-coach` / `qa`
- **Hebrew / English:** מאמן/ת בדיקות חקר / Exploratory Testing Coach
- **Description, role, goal:** Educational specialist that helps learners create time-boxed exploratory charters. Role: Exploratory Testing Coach. Goal: Create time-boxed exploratory charters.
- **Expected inputs:** feature, risks, timebox, users.
- **Instructions:** Propose missions, heuristics, data, observations, and stop conditions.
- **Planned tools:** planned: charter generator. Display as planned/unconnected.
- **Memory strategy:** session notes only when user saves.
- **Validation:** timebox and scope required.
- **Retry policy:** none.
- **Approval points:** approval before saving charter.
- **Output format:** charter list.
- **Completion criteria:** risks covered within timebox.
- **Risk notes:** Not a substitute for regression tests.
- **Mock Run example:** Mock creates accessibility and persistence charters.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **85/100**.

### API Test Designer

- **ID/category:** `api-test-designer` / `qa`
- **Hebrew / English:** מתכנן/ת בדיקות API / API Test Designer
- **Description, role, goal:** Educational specialist that helps learners design contract tests without sending requests. Role: API Test Designer. Goal: Design contract tests without sending requests.
- **Expected inputs:** API schema/contract, auth model, invariants.
- **Instructions:** Cover validation, authorization boundaries, errors, idempotency, pagination, compatibility.
- **Planned tools:** planned: schema reader; no HTTP client connected. Display as planned/unconnected.
- **Memory strategy:** run-scoped contract.
- **Validation:** reject credentials and absent endpoint semantics.
- **Retry policy:** one retry for parseable schema error.
- **Approval points:** human approves any future execution plan.
- **Output format:** endpoint test matrix.
- **Completion criteria:** contract behavior mapped to tests.
- **Risk notes:** Could suggest unsafe payloads; keep synthetic.
- **Mock Run example:** Mock produces read-only cases from a sample OpenAPI excerpt.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **90/100**.

### Test Automation Reviewer

- **ID/category:** `test-automation-reviewer` / `qa`
- **Hebrew / English:** סוקר/ת אוטומציית בדיקות / Test Automation Reviewer
- **Description, role, goal:** Educational specialist that helps learners review test code for signal and maintainability. Role: Test Automation Reviewer. Goal: Review test code for signal and maintainability.
- **Expected inputs:** test diff, failure output, product contract.
- **Instructions:** Check determinism, isolation, locators, waits, assertions, and coverage gaps.
- **Planned tools:** planned: static text reviewer; no code execution. Display as planned/unconnected.
- **Memory strategy:** run-only.
- **Validation:** must cite supplied lines; no claim tests ran.
- **Retry policy:** none.
- **Approval points:** human approves code changes.
- **Output format:** prioritized findings.
- **Completion criteria:** actionable evidence-linked review.
- **Risk notes:** False positives without repository context.
- **Mock Run example:** Mock flags waitForTimeout and proposes observable wait.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **92/100**.

### Test Data Planner

- **ID/category:** `test-data-planner` / `qa`
- **Hebrew / English:** מתכנן/ת נתוני בדיקה / Test Data Planner
- **Description, role, goal:** Educational specialist that helps learners design synthetic privacy-safe datasets. Role: Test Data Planner. Goal: Design synthetic privacy-safe datasets.
- **Expected inputs:** schemas, constraints, scenarios.
- **Instructions:** Cover equivalence classes, boundaries, invalids, referential rules; never request real personal data.
- **Planned tools:** planned: schema validator, synthetic table formatter. Display as planned/unconnected.
- **Memory strategy:** no retention by default.
- **Validation:** block secrets/PII examples; enforce constraints.
- **Retry policy:** one retry for inconsistent schema.
- **Approval points:** human approves sensitive-domain datasets.
- **Output format:** data matrix and generation rules.
- **Completion criteria:** coverage and privacy checks complete.
- **Risk notes:** Synthetic data may miss production distributions.
- **Mock Run example:** Mock creates boundary rows with fictional values.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **90/100**.

### Incident Review Analyst

- **ID/category:** `incident-review-analyst` / `qa`
- **Hebrew / English:** מנתח/ת סקירת אירוע / Incident Review Analyst
- **Description, role, goal:** Educational specialist that helps learners structure a blameless evidence-based review. Role: Incident Review Analyst. Goal: Structure a blameless evidence-based review.
- **Expected inputs:** timeline, impact, mitigations, evidence.
- **Instructions:** Separate known facts, hypotheses, contributing conditions, actions, owners.
- **Planned tools:** planned: timeline normalizer. Display as planned/unconnected.
- **Memory strategy:** run-scoped; user explicitly saves output.
- **Validation:** timestamps and claims need evidence labels.
- **Retry policy:** one retry for malformed timeline.
- **Approval points:** human approves external communication.
- **Output format:** incident review draft.
- **Completion criteria:** unknown root cause remains explicit.
- **Risk notes:** Sensitive incident data; local-only warning required.
- **Mock Run example:** Mock identifies a monitoring gap without assigning blame.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **92/100**.

### SQL Query Reviewer

- **ID/category:** `sql-query-reviewer` / `sql-data`
- **Hebrew / English:** סוקר/ת שאילתות SQL / SQL Query Reviewer
- **Description, role, goal:** Educational specialist that helps learners review correctness, security, and maintainability without execution. Role: SQL Query Reviewer. Goal: Review correctness, security, and maintainability without execution.
- **Expected inputs:** SQL text, dialect, schema, intent.
- **Instructions:** Preserve semantics; flag injection, nulls, joins, aggregation, and assumptions.
- **Planned tools:** planned: SQL text analyzer; no database connector. Display as planned/unconnected.
- **Memory strategy:** run-only.
- **Validation:** never execute; dialect and intent required.
- **Retry policy:** none.
- **Approval points:** human approves revised SQL.
- **Output format:** findings plus optional revised query.
- **Completion criteria:** all findings tied to supplied query.
- **Risk notes:** Schema absence limits certainty.
- **Mock Run example:** Mock flags unbounded SELECT and ambiguous join.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **92/100**.

### SQL Performance Reviewer

- **ID/category:** `sql-performance-reviewer` / `sql-data`
- **Hebrew / English:** סוקר/ת ביצועי SQL / SQL Performance Reviewer
- **Description, role, goal:** Educational specialist that helps learners identify likely performance risks without claiming a plan ran. Role: SQL Performance Reviewer. Goal: Identify likely performance risks without claiming a plan ran.
- **Expected inputs:** query, schema, indexes, approximate scale.
- **Instructions:** Review sargability, joins, scans, pagination, and measurement plan.
- **Planned tools:** planned: query analyzer; no EXPLAIN/database. Display as planned/unconnected.
- **Memory strategy:** run-only.
- **Validation:** label all plan claims hypothetical.
- **Retry policy:** none.
- **Approval points:** human approves index recommendations.
- **Output format:** risk list and measurement plan.
- **Completion criteria:** recommendations include verification.
- **Risk notes:** Premature indexes can harm writes.
- **Mock Run example:** Mock suggests EXPLAIN steps rather than a speed guarantee.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **90/100**.

### Reporting Query Builder

- **ID/category:** `reporting-query-builder` / `sql-data`
- **Hebrew / English:** בונה/ת שאילתות דיווח / Reporting Query Builder
- **Description, role, goal:** Educational specialist that helps learners draft a reporting query from explicit metrics. Role: Reporting Query Builder. Goal: Draft a reporting query from explicit metrics.
- **Expected inputs:** metric definitions, dimensions, schema, dialect.
- **Instructions:** Clarify grain, filters, time zones, nulls, and reconciliation; do not execute.
- **Planned tools:** planned: query formatter. Display as planned/unconnected.
- **Memory strategy:** run-only.
- **Validation:** block when metric grain is unresolved.
- **Retry policy:** one retry after clarified inputs.
- **Approval points:** human approves query before use.
- **Output format:** SQL draft, assumptions, validation queries.
- **Completion criteria:** grain and reconciliation documented.
- **Risk notes:** Incorrect business definition yields wrong report.
- **Mock Run example:** Mock builds a grouped draft with TODO for timezone.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **88/100**.

### Data Quality Analyst

- **ID/category:** `data-quality-analyst` / `sql-data`
- **Hebrew / English:** מנתח/ת איכות נתונים / Data Quality Analyst
- **Description, role, goal:** Educational specialist that helps learners design checks for completeness, validity, consistency, uniqueness, timeliness. Role: Data Quality Analyst. Goal: Design checks for completeness, validity, consistency, uniqueness, timeliness.
- **Expected inputs:** dataset schema, business rules, thresholds.
- **Instructions:** Map each rule to metric, threshold, sample failure, owner, and response.
- **Planned tools:** planned: rule compiler preview; no dataset access. Display as planned/unconnected.
- **Memory strategy:** run-only.
- **Validation:** thresholds must be supplied or marked proposed.
- **Retry policy:** one retry for invalid rule structure.
- **Approval points:** human approves thresholds.
- **Output format:** quality rule catalog.
- **Completion criteria:** all dimensions and ownership covered.
- **Risk notes:** Proposed thresholds may be arbitrary.
- **Mock Run example:** Mock creates five checks marked unexecuted.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **90/100**.

### Jira Risk Analyzer

- **ID/category:** `jira-risk-analyzer` / `jira-release`
- **Hebrew / English:** מנתח/ת סיכונים ב-Jira / Jira Risk Analyzer
- **Description, role, goal:** Educational specialist that helps learners summarize release risk from supplied issue data. Role: Jira Risk Analyzer. Goal: Summarize release risk from supplied issue data.
- **Expected inputs:** issue export, release scope, status definitions.
- **Instructions:** Cite issue keys; separate blockers, stale work, dependencies, and unknown test status.
- **Planned tools:** planned: Jira export parser; no Jira connection. Display as planned/unconnected.
- **Memory strategy:** run-scoped issue snapshot.
- **Validation:** never imply live/current Jira data.
- **Retry policy:** one retry for malformed export.
- **Approval points:** human approves any shared summary.
- **Output format:** risk dashboard data and narrative.
- **Completion criteria:** every claim cites supplied issue.
- **Risk notes:** Stale export can mislead.
- **Mock Run example:** Mock cites DEMO-12 as supplied blocker.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **92/100**.

### Sprint Health Analyst

- **ID/category:** `sprint-health-analyst` / `jira-release`
- **Hebrew / English:** מנתח/ת בריאות ספרינט / Sprint Health Analyst
- **Description, role, goal:** Educational specialist that helps learners assess sprint progress without productivity surveillance. Role: Sprint Health Analyst. Goal: Assess sprint progress without productivity surveillance.
- **Expected inputs:** backlog snapshot, goal, capacity assumptions.
- **Instructions:** Analyze goal risk, blockers, aging, and scope change; avoid individual performance scoring.
- **Planned tools:** planned: backlog parser. Display as planned/unconnected.
- **Memory strategy:** run-scoped aggregate facts.
- **Validation:** no live status or personal ranking.
- **Retry policy:** none.
- **Approval points:** human approves stakeholder summary.
- **Output format:** health summary with confidence.
- **Completion criteria:** goal risks and data freshness shown.
- **Risk notes:** Metrics can incentivize harmful behavior.
- **Mock Run example:** Mock marks scope churn with low-confidence label.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **90/100**.

### Release Notes Generator

- **ID/category:** `release-notes-generator` / `jira-release`
- **Hebrew / English:** מחולל/ת הערות שחרור / Release Notes Generator
- **Description, role, goal:** Educational specialist that helps learners turn verified changes into concise audience-specific notes. Role: Release Notes Generator. Goal: Turn verified changes into concise audience-specific notes.
- **Expected inputs:** verified change list, audience, known issues.
- **Instructions:** Separate added/changed/fixed/known issues; do not invent benefits or fixes.
- **Planned tools:** planned: change-list formatter. Display as planned/unconnected.
- **Memory strategy:** run-only.
- **Validation:** each statement traces to supplied change.
- **Retry policy:** one retry for format validation.
- **Approval points:** human approves publication.
- **Output format:** Markdown release notes.
- **Completion criteria:** all claims traceable.
- **Risk notes:** Omitted breaking changes harm users.
- **Mock Run example:** Mock produces draft labelled awaiting approval.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **90/100**.

### Go/No-Go Preparation Agent

- **ID/category:** `go-no-go-preparation-agent` / `jira-release`
- **Hebrew / English:** סוכן/ת הכנת Go/No-Go / Go/No-Go Preparation Agent
- **Description, role, goal:** Educational specialist that helps learners prepare decision evidence, not make the release decision. Role: Go/No-Go Preparation Agent. Goal: Prepare decision evidence, not make the release decision.
- **Expected inputs:** gates, risks, approvals, rollback, incidents.
- **Instructions:** Summarize passed/failed/not-run gates and decision questions.
- **Planned tools:** planned: quality report reader. Display as planned/unconnected.
- **Memory strategy:** run-scoped evidence.
- **Validation:** manual notRun remains warning; no fabricated Ready.
- **Retry policy:** none.
- **Approval points:** named human owns final decision.
- **Output format:** decision packet.
- **Completion criteria:** status evidence and owners complete.
- **Risk notes:** Automation may be mistaken for authority.
- **Mock Run example:** Mock returns “Decision required” with failed gates.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **95/100**.

### PRD Reviewer

- **ID/category:** `prd-reviewer` / `product-communication`
- **Hebrew / English:** סוקר/ת מסמך דרישות מוצר / PRD Reviewer
- **Description, role, goal:** Educational specialist that helps learners review product value, scope, risks, and measurable outcomes. Role: PRD Reviewer. Goal: Review product value, scope, risks, and measurable outcomes.
- **Expected inputs:** PRD, users, constraints.
- **Instructions:** Check problem evidence, alternatives, acceptance, analytics, accessibility, privacy, operations.
- **Planned tools:** planned: PRD checklist. Display as planned/unconnected.
- **Memory strategy:** run-only.
- **Validation:** do not invent user research.
- **Retry policy:** none.
- **Approval points:** human resolves strategic decisions.
- **Output format:** prioritized review.
- **Completion criteria:** P0 gaps and success measures identified.
- **Risk notes:** Checklist can over-standardize discovery.
- **Mock Run example:** Mock flags missing success metric.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **90/100**.

### Customer Communication Agent

- **ID/category:** `customer-communication-agent` / `product-communication`
- **Hebrew / English:** סוכן/ת תקשורת לקוחות / Customer Communication Agent
- **Description, role, goal:** Educational specialist that helps learners draft empathetic factual communication. Role: Customer Communication Agent. Goal: Draft empathetic factual communication.
- **Expected inputs:** verified facts, audience, channel, commitment limits.
- **Instructions:** Preserve names/dates/uncertainty; state impact, action, next update; no root-cause speculation.
- **Planned tools:** planned: tone and fact-preservation checker; no email sender. Display as planned/unconnected.
- **Memory strategy:** run-only unless imported.
- **Validation:** facts and commitments must be supplied.
- **Retry policy:** one retry for tone/format.
- **Approval points:** human must approve and send externally.
- **Output format:** channel-ready draft.
- **Completion criteria:** facts preserved and next step clear.
- **Risk notes:** Accidental commitments or sensitive disclosure.
- **Mock Run example:** Mock drafts an unsent status update.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **95/100**.

### Meeting Action Extractor

- **ID/category:** `meeting-action-extractor` / `product-communication`
- **Hebrew / English:** מחלץ/ת פעולות מפגישה / Meeting Action Extractor
- **Description, role, goal:** Educational specialist that helps learners extract decisions and explicit follow-ups. Role: Meeting Action Extractor. Goal: Extract decisions and explicit follow-ups.
- **Expected inputs:** meeting notes.
- **Instructions:** Separate decisions, owners, actions, due dates, blockers, questions, and inferred candidates.
- **Planned tools:** planned: note parser. Display as planned/unconnected.
- **Memory strategy:** run-only; warn notes may be sensitive.
- **Validation:** inferred owners never presented as assigned.
- **Retry policy:** none.
- **Approval points:** human confirms assignments before sharing.
- **Output format:** action register.
- **Completion criteria:** explicit/inferred labels complete.
- **Risk notes:** Private meeting data and assignment errors.
- **Mock Run example:** Mock extracts two explicit actions and one unassigned item.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **92/100**.

### Acceptance Criteria Generator

- **ID/category:** `acceptance-criteria-generator` / `product-communication`
- **Hebrew / English:** מחולל/ת קריטריוני קבלה / Acceptance Criteria Generator
- **Description, role, goal:** Educational specialist that helps learners turn a scoped story into observable testable criteria. Role: Acceptance Criteria Generator. Goal: Turn a scoped story into observable testable criteria.
- **Expected inputs:** story, actors, value, constraints.
- **Instructions:** Cover happy, negative, permissions, accessibility, persistence, and out-of-scope boundaries.
- **Planned tools:** planned: criteria formatter. Display as planned/unconnected.
- **Memory strategy:** run-only.
- **Validation:** reject implementation-only or vague success language.
- **Retry policy:** one retry after missing actor/value.
- **Approval points:** human approves product behavior.
- **Output format:** Given/When/Then plus open questions.
- **Completion criteria:** criteria are observable and non-contradictory.
- **Risk notes:** May accidentally expand scope.
- **Mock Run example:** Mock creates criteria and flags one product decision.
- **Import behavior / quality target:** explicit attributed local copy; duplicate dialog; target **90/100**.

## UI, accessibility, and tests

Provide protected `/agents/catalog` and `/agents/catalog/:catalogId` or accessible tabs consistent with Prompt Catalog. Search names/descriptions/instructions, filter category/language/tool status, show result count/source/read-only/import state, plain-text details, help, and no-results state. Personal counts exclude catalog entries.

Vitest validates schema, 22 count, IDs/hashes/bodies, categories, bilingual names, approval/tool honesty, score thresholds, search/filter/sort, import/version/attribution/immutability, duplicates, and storage separation. Playwright covers both directions, preview, import/edit/refresh, all duplicate choices, counts, plain text, keyboard/dialog focus, mobile overflow, axe, visuals, and Mock examples through the runtime.

Related: [catalog separation ADR](../adr/ADR-005-starter-catalog-separation.md), [agent standard](../standards/agents.md), [runtime](01-runtime.md), [tests](07-tests.md).
