# Accessibility testing

Automated accessibility coverage uses [`@axe-core/playwright`](https://github.com/dequelabs/axe-core-npm) against every required page and interaction state, in both Hebrew (RTL) and English (LTR).

## What runs

`e2e/specs/accessibility.spec.ts`, via the shared helper `e2e/fixtures/a11y.ts` (`runAxeScan`):

- Scans WCAG 2.0/2.1 **A and AA** rule sets (`withTags(['wcag2a', 'wcag2aa'])`).
- Attaches the full axe JSON result to the Playwright report for every scan.
- Fails the test with a readable summary (rule ID, impact, help text, affected selectors, docs URL) for any violation that isn't covered by the typed allowlist.

Scanned pages/states (17 scans total as of Sprint 5): Login, Dashboard, Lessons catalog, Lesson details, Settings, Prompt Library, Prompt Builder, Prompt Details, QA Center (empty and with sample data), mobile navigation drawer open, profile menu open, delete-confirmation dialog, quiz interaction state after submit — each in Hebrew, plus Login/Dashboard/Prompt Builder/QA Center repeated in English.

Run locally:

```bash
npm run test:a11y
```

This targets the dedicated `Accessibility` Playwright project (`playwright.config.ts`), which is excluded from the normal `Desktop Chromium` functional runs via `testIgnore` so accessibility scans never silently duplicate into `test:e2e`/`test:e2e:full`.

## Current result

As of Sprint 5 (v0.5.0), a full sweep found **zero violations** across every scanned page and state. One real pre-existing issue was found and fixed during this sprint: insufficient color contrast on the mobile sidebar's version/status text (`.sidebar-system span:last-child`), corrected by switching it to the shared `--muted` design-token color, which is already proven accessible elsewhere in the same dark UI.

## The allowlist policy

`quality/config/a11yAllowlist.ts` holds a typed, empty-by-default allowlist. An entry is added **only** when a real violation is found that cannot be fixed immediately, and each entry:

- Is scoped to one axe rule ID **and** one CSS selector — never a whole page or container.
- Requires a `reason`, an `owner`, a `createdAt` date, and a `targetRemovalVersion`.
- Does not suppress the violation from the report — it is still counted and visible, just not treated as a test failure.

An undocumented violation always fails the build. Prefer fixing the real issue over adding an allowlist entry.

## What automated scans do not replace

Axe-core catches a meaningful subset of accessibility defects (missing labels, contrast, landmark/heading structure, ARIA misuse, etc.) but cannot verify:

- Keyboard-only navigation and logical tab order
- Screen-reader reading order and announcements (NVDA/JAWS/VoiceOver)
- Usability at 200%/400% browser zoom
- Cognitive usability (clarity of language, task complexity, error recovery)
- Whether a visually-present focus indicator is actually usable in practice

These remain manual — see `docs/manual-qa-checklist.md`, which tracks what's automated, what's manual, and what's not yet covered.

## Adding a new page

When adding a new route or a new interactive state (dialog, drawer, expanded panel), add a corresponding `runAxeScan` call to `accessibility.spec.ts` in the same pattern as the existing tests, in both languages if the page has translated content that could plausibly introduce new issues (e.g. longer text truncation, RTL-specific layout).
