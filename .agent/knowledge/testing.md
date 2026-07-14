# Testing

## Purpose

Point an agent to the right test layer and script for a given change instead
of guessing a command.

## Authoritative source(s)

- [.codex/architecture/testing.md](../../.codex/architecture/testing.md)
- [.codex/standards/testing.md](../../.codex/standards/testing.md)
- [.codex/adr/ADR-007-playwright-quality-platform.md](../../.codex/adr/ADR-007-playwright-quality-platform.md)
- `package.json` scripts

## Project-specific interpretation

Vitest (`test:run`, `test:coverage`) covers domain logic and component
behavior — most feature folders (`agents/`, `prompts/`, `knowledge/`,
`runtime/`, `workspace/`, `onboarding/`, `experience/`, `data/`) ship a
co-located `*.test.ts`/`*.test.tsx` file. Playwright covers everything
user-visible, split across dedicated configs and npm scripts rather than one
monolithic suite: `test:e2e` (fast, Desktop Chromium only), `test:e2e:full`,
`test:e2e:pages` (against the GitHub Pages build via
`playwright.pages.config.ts`), `test:journeys` and `test:ux` (dedicated
configs), `test:a11y` (axe, `Accessibility` project), `test:visual`
(`visual-chromium` project, committed screenshot baselines), plus narrow
specs (`test:click-audit`, `test:route-crawl`, `test:forms`,
`test:overlays`, `test:responsive:interactions`, `test:keyboard`,
`test:copy`, `test:errors`). `test:performance` runs a production build then
Lighthouse collect/assert.

`validate:release` chains nearly all of the above and is the release-time
gate; `.agent/quality/test-selection.md` governs which subset applies to a
given AOS task type/risk level — this file only orients on where the
scripts live and what they cover.

## Constraints

- New domain logic gets a Vitest test in the same folder; new user-visible
  behavior gets Playwright coverage in the matching existing spec file
  under `e2e/specs/` rather than a new ad hoc script.
- Never weaken an assertion, add an arbitrary `waitForTimeout`, or suppress
  an axe rule globally to make a red test green — root-cause per
  `.agent/workflow/debugging.md`.
- Visual baselines only update via the deliberate `test:visual:update` /
  `regenerate-visual-baselines` CI path (manual `workflow_dispatch`), never
  as a side effect of a feature change.

## Known limitations

- `test:e2e:full` and `test:visual` require Playwright browsers installed
  (`playwright install`); these are not guaranteed available in every
  execution environment — record as `notAvailable` per
  `.agent/quality/evidence.md` rather than skipping silently.
- Coverage thresholds are a Critical-risk change per AOS task classification;
  do not touch them to make a failing coverage run pass.

## Current implementation status

Shipped: layered Vitest + multi-config Playwright suite (functional, a11y,
visual, journeys, UX, performance), CI wiring in `.github/workflows/ci.yml`
running these as parallel jobs with a `quality-summary` rollup. No test
layer here targets a live AI provider — Runtime/provider tests exercise the
deterministic Mock Provider only, consistent with `runtime.md`.
