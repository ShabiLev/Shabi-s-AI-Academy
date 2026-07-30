# Version 1.9 test strategy

## Test principles

- Prove behavior at the narrowest stable layer, then cover integrated journeys.
- Use fixed clocks, injected IDs, canonical fixtures, and deterministic seeds.
- Never use arbitrary sleeps, blanket retries, skipped assertions, threshold
  weakening, or silent baseline updates to hide defects.
- Every test distinguishes Academy deterministic evaluation, unavailable real
  provider evaluation, preview-only connected action, and unavailable connected
  execution.
- Preserve independent storage per test and cover clean, migrated, corrupt,
  malformed, oversized, and actor-isolated states.

The concrete case inventory is in [12-test-matrix.md](12-test-matrix.md).

## Required automated layers

- **Unit:** schemas, weights, anchors, not-scored, blocking, setup bounds,
  determinism, hashes, immutable snapshots/versions, evaluator independence,
  disagreement, certification, regression/baseline protection, failures,
  learning confidence, preview, TOML round-trip, storage/migration/analytics.
- **Component:** Arena, picker, Rubric Builder, criteria/evaluators, run controls,
  results/trace, disagreement, suites, Failure Case, version diff, preview,
  export, RTL/LTR, keyboard, live regions, reduced motion, and corrupt states.
- **Integration:** full run lifecycle, needs evidence/resume, version
  comparisons, regression suites, blocking regression, Failure Case to Skill
  Map, preview non-write, backup/reset/import, and preserved Version 1.8 Mission.
- **E2E:** 12 mandatory journeys in both capability truth and persistence
  boundaries, including 320x568 and core Version 1.8 regression.
- **Cross-browser:** Chromium, Firefox, WebKit, Mobile Chromium, Mobile WebKit.
- **Accessibility:** axe, keyboard, focus, 200% zoom, accessible tables/charts,
  live progress, reduced motion, RTL/LTR, mobile, and 44x44 targets.
- **Visual:** Arena, Rubric Builder, running/completed/disagreement/regression,
  Failure Case, version diff, preview, and export across representative
  Hebrew/English desktop/mobile states. Run the complete visual suite twice.
- **Performance:** bundle, long traces, 100+ runs, histories, suites, backup, and
  mobile interaction. Budgets must be established from measured baseline, not
  guessed in this planning spec.
- **Security:** dependency/secret review, import fuzz, XSS, permission,
  independence, tamper, actor isolation, export injection, and redaction.

## Required release commands

Run focused tests first, then:

```bash
npm ci
npm run test:version-1.9
npm run validate:release
npm run quality:evidence:full
npm run storage:audit
npm run retention:apply
npm run retention:verify
```

Run the complete visual suite a second time as a separate command. Also run
repository hygiene from the master prompt, including `git diff --check`,
untracked/stat/name-status review, and dry-run clean commands; never run
`git clean -fdx`.

## Evidence and stop rules

Record exact commands, exit codes, exact tested SHA, important output, and
whether a failure predates the change. A running command is not a pass. Block
for functional, accessibility, security, performance, data-integrity, connected
write, misleading evaluation, or meaningful visual failures. Harmless pixel
noise requires investigation and review but does not justify weaker tolerance.

Manual UX, content, security, screen-reader, visual-baseline, PR, and Reality
Check decisions remain explicit and independent.
