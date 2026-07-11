# Visual regression testing

Deterministic Playwright screenshot comparisons against committed baseline images, scoped to a single canonical browser project.

## Architecture

- **Project**: `visual-chromium` in `playwright.config.ts` — fixed viewport (1280×900 desktop, 390×844 per-test for mobile via `test.use`), fixed `locale` (`he-IL`), fixed `timezoneId` (`Asia/Jerusalem`), fixed `colorScheme` (`dark`), fixed `reducedMotion` (`reduce`).
- **Spec**: `e2e/specs/visual.spec.ts`.
- **Determinism helper**: `e2e/fixtures/visual.ts` — `stabilize(page)` disables CSS animations/transitions and waits for `document.fonts.ready` before every screenshot; `dynamicMasks(page)` returns the elements marked `[data-visual-mask]` (currently the QA Center header's real git commit SHA and branch name, which vary by machine/build and are masked out of comparison).
- **Baseline path**: `e2e/specs/__screenshots__/{projectName}/{testFilePath}/{arg}-{platform}{ext}` — the `{platform}` token is the important part: Playwright automatically suffixes baseline filenames with the OS they were captured on (`-win32`, `-linux`, `-darwin`). A Windows-generated baseline and a Linux-generated baseline are **different files**, so Windows baselines can never silently satisfy a Linux CI comparison — a missing platform-specific baseline fails clearly instead.
- **Scope**: only Chromium, only this one project. Visual comparisons deliberately do not run across every browser/OS combination.

## Screens covered (22 as of Sprint 5)

Desktop Hebrew: Login, Dashboard, Lessons catalog, Lesson details, Prompt Library (populated), Prompt Builder, Prompt Details, Settings, QA Center (sample data loaded).
Desktop English: Dashboard, Prompt Builder, QA Center.
Mobile Hebrew (390×844): Login, Dashboard, navigation drawer open, Lesson details, Prompt Builder, delete-confirmation dialog, QA Center.
Mobile English: Dashboard, Prompt Library (populated), QA Center.

Full-page screenshots are used for regular-length pages. QA Center — the longest page — uses a viewport-only screenshot rather than full-page, per the guidance below.

## Determinism rules actually applied

- Demo Login always starts from a freshly cleared `localStorage`/`sessionStorage` (via the shared `login()` fixture).
- A "Prompt Library populated" state is created by actually filling and saving one prompt through the UI — safe because neither its generated ID nor its timestamps are ever rendered in the Library grid, only its title/description/category/tags/score/version, all of which are deterministic.
- The QA Center's sample-data screenshots load the bundled `sampleQualityReport`, which has a hardcoded `generatedAt` — real, non-deterministic values (the actual git commit SHA and branch from `buildMetadata`) are explicitly masked via `data-visual-mask`.
- No arbitrary `page.waitForTimeout` calls are used for stabilization — only `stabilize()` (animations + fonts) and Playwright's built-in auto-waiting.
- The Dashboard's progress numbers are computed live from course-progress state, not hardcoded, but a freshly-cleared Demo Login always starts at the same zero-progress state, making them deterministic in practice.

## Baseline provenance: Windows vs. Linux

**The baselines currently committed in this repository were generated on a Windows development machine** (Sprint 5, 2026-07-11), not on CI. This is intentional and documented, not an oversight:

- It lets `npm run test:visual` run and pass end-to-end today, on this machine, as a real working feature.
- Per the `{platform}` token above, these Windows baselines (`-win32.png`) are structurally incapable of being mistaken for Linux CI baselines (`-linux.png`) — CI running `npm run test:visual` today would report **missing baseline**, not a false pass and not a false diff.
- The `regenerate-visual-baselines` job in `.github/workflows/ci.yml` (triggered only via `workflow_dispatch`, never on push/PR) runs `npm run test:visual:update` on an actual Ubuntu GitHub Actions runner and uploads the resulting `-linux.png` files as a downloadable artifact.
- A human must download that artifact, review every image (are the differences from "no baseline" to "this baseline" actually correct?), and commit them intentionally. The workflow never commits anything itself.

Until that manual step happens, this is the known gap: visual comparisons are real and passing locally, but not yet CI-canonical for Linux. Report this distinction explicitly rather than claiming full CI coverage.

## Approved process for changing a baseline intentionally

1. Run `npm run test:visual` and review the failure.
2. Run `npm run test:visual:report` to open the HTML report with expected/actual/diff images.
3. Confirm the visual change is an intentional product change, not a regression.
4. Run `npm run test:visual:update` (only ever run manually — never inside `validate:quality`/`validate:release`, and never triggered automatically after a failure).
5. Review `git diff --stat` for the changed `.png` files — every changed baseline should map to an intentional change you can explain.
6. Commit the updated baselines together with the feature/fix that caused them.

There is no in-app "approve" button. Baseline updates are always a deliberate, reviewed developer action.

## Tolerance

Playwright's default pixel-diff threshold is used (no custom `maxDiffPixelRatio`/`threshold` override) — a conservative default, not loosened. A large tolerance would hide real regressions; none is configured here.

## Adding a new visual baseline

Add a `test()` in the matching `describe` block of `visual.spec.ts` following the existing pattern (navigate → `stabilize(page)` → `expect(page).toHaveScreenshot(name, { mask: dynamicMasks(page) })` if the page could show dynamic build metadata). Prefer a small number of high-value, representative states over snapshotting every page variation.
