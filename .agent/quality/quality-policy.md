# Quality Policy

## Purpose

Top-level quality gate philosophy for AOS, and how it composes with the
existing `quality/` tooling in this repository. This file does not replace
`quality/README.md` or any script under `quality/scripts/` — it explains how
an AI agent (Codex or Claude Code) must use them. See also
[`../workflow/testing.md`](../workflow/testing.md),
[`../release/release-checklist.md`](../release/release-checklist.md), and
[`evidence.md`](evidence.md).

## Principles

1. **Real tools, no parallel test suite.** `quality/` collects and analyzes
   results that Vitest, Playwright, Lighthouse, ESLint, and Git already
   produced — it does not duplicate them (`quality/README.md`, line 3). AOS
   quality modules describe how to invoke and interpret those real tools;
   they never invent a second implementation of testing or coverage logic.
2. **Evidence over claims.** A task is not "tested" because an agent says
   so. It is tested because the relevant npm scripts were actually run and
   their results are captured under ignored `quality/runtime/execution/latest/`
   or exact-SHA CI artifacts (see
   [`evidence.md`](evidence.md)). Fabricated, assumed, or remembered test
   results are never acceptable.
3. **Honest unavailability.** If a check does not exist in this repository,
   or a dependency did not run, it must be recorded as `notRun` /
   `notAvailable` / `notRunDueToDependency` — never as `passed`. This is
   enforced today in `scripts/run-quality-evidence.mjs` (dependency-failed
   commands are marked `notRunDueToDependency`) and in
   `quality/scripts/collect-quality-results.mjs` (missing inputs become
   `notRun`/`notAvailable`).
4. **Manual gates stay manual.** Subjective review (UX, security, content)
   is tracked in `quality/checklists/manual-*.json` and can only be
   transitioned by a human. Automation never promotes these to `passed`
   (see [`manual-review.md`](manual-review.md)).
5. **Coverage thresholds are Critical-risk to change.** They are a policy
   decision, not a test-writing decision. See [`coverage.md`](coverage.md).
6. **Heavy artifacts stay out of Git.** Full logs, Playwright traces,
   screenshots, and HTML coverage reports live under
   `quality/runtime/execution/runs/` (gitignored) or become CI artifacts.
   Generated summaries are not committed. See [`evidence.md`](evidence.md).

## Where quality logic actually lives

| Concern | Real location |
| --- | --- |
| Coverage thresholds | `quality/config/coverageThresholds.cjs` |
| Lighthouse thresholds | `quality/config/lighthouseThresholds.cjs` |
| Accessibility allowlist | `quality/config/a11yAllowlist.ts` |
| Result collection | `quality/scripts/collect-quality-results.mjs` |
| Result analysis / release status | `quality/scripts/analyze-quality-results.mjs` |
| Evidence orchestration | `scripts/run-quality-evidence.mjs` |
| Evidence output | Ignored `quality/runtime/execution/` and exact-SHA CI artifacts |

## How this applies to a task

1. Classify the task (see [`../loaders/task-classifier.md`](../loaders/task-classifier.md)).
2. Pick the right test scope from [`test-selection.md`](test-selection.md).
3. Run it for real; do not summarize from memory.
4. Capture evidence per [`evidence.md`](evidence.md).
5. If the task touches UI, UX, accessibility, visual output, or performance,
   apply the matching module in this directory
   ([`ui-validation.md`](ui-validation.md), [`ux-validation.md`](ux-validation.md),
   [`accessibility.md`](accessibility.md), [`visual-regression.md`](visual-regression.md),
   [`performance.md`](performance.md)).
6. Before calling a release ready, apply [`release-gates.md`](release-gates.md).
7. Roll everything up per [`reporting.md`](reporting.md).

Cross-reference: [`../workflow/testing.md`](../workflow/testing.md) for the
end-to-end workflow this policy plugs into, and
[`../release/release-checklist.md`](../release/release-checklist.md) for the
release-time application of these gates.
