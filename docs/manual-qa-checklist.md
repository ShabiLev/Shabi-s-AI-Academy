# Manual QA checklist

For 1.2.0-beta.1, review all existing beta content plus AI Radar, the profile popover/sheet, shared layer tokens, sidebar scrolling, and cross-application overflow hardening. Confirm local-data preservation, bilingual responsive behavior, intentional visual changes, absence of secrets, and the deployed GitHub Pages artifact when available. QA Center stores this separately by application version.

Automated gates (`docs/quality-gates.md`) catch a large and growing share of regressions, but they do not replace human review. This checklist is the reference for what's automated, what's manual, and what isn't covered yet. The QA Center's release checklist (`docs/qa-center.md`) implements the manual items below as persisted, per-version checkboxes.

## Accessibility

| Item | Automated | Manual | Not yet covered |
| --- | --- | --- | --- |
| Keyboard-only navigation reaches every interactive control | | ✓ | |
| Logical Tab order matches visual/reading order | | ✓ | |
| Visible focus indicator on every focusable element | partial (axe contrast/ARIA rules) | ✓ | |
| Escape closes dialogs/menus/drawers | ✓ (Playwright specs assert this) | | |
| Focus returns to the trigger after a dialog/menu/drawer closes | ✓ (Playwright specs assert this for the profile menu, drawer, delete dialog) | | |
| Usable at 200% browser zoom | | ✓ | |
| Usable at 400% browser zoom (smoke check, not full pass) | | ✓ | |
| Hebrew screen-reader reading order (NVDA/VoiceOver) | | ✓ | |
| English screen-reader reading order | | ✓ | |
| Heading hierarchy is logical (no skipped levels) | partial (axe `heading-order`) | ✓ (judgment on whether it *reads* well) | |
| Links/buttons have meaningful accessible names | ✓ (axe `link-name`, `button-name`) | | |
| Form errors are associated with their fields | ✓ (axe `aria-*` rules where applicable) | ✓ (does the error actually make sense to a user) | |
| No color-only meaning (status conveyed by text too) | | ✓ | |
| Reduced-motion preference is respected | ✓ (global CSS media query, see `src/styles/index.css`) | | |
| Mobile touch-target sizing is comfortable | | ✓ | |

## Visual / layout

| Item | Automated | Manual | Not yet covered |
| --- | --- | --- | --- |
| Hebrew desktop reviewed | ✓ (visual regression, 9 desktop-Hebrew screens) | ✓ (judgment beyond pixel diff) | |
| English desktop reviewed | ✓ (3 desktop-English screens) | ✓ | |
| Hebrew mobile reviewed | ✓ (7 mobile-Hebrew screens) | ✓ | |
| English mobile reviewed | ✓ (3 mobile-English screens) | ✓ | |
| No obvious typography defects (clipped text, wrong font, overlap) | partial (visual regression catches pixel changes) | ✓ | |
| No visible overlap at narrow widths | ✓ (`noOverflow()` checks at 320px in several specs) | ✓ | |

Additional 1.2 checks: open the profile menu with the sidebar scrolled near the bottom and the Assistant visible; repeat at 200% zoom in both directions. Review Radar cards, filters, source attribution, and freshness copy in both languages. Automation covers containment and regression, while human review owns readability and editorial judgment.

## Functional

| Item | Automated | Manual | Not yet covered |
| --- | --- | --- | --- |
| Browser refresh on every route preserves state correctly | partial (covered for auth/progress/prompts/language in existing specs) | ✓ (spot-check new routes) | |
| Exports (Prompt TXT/Markdown, QA issue JSON) open correctly in real applications | ✓ (Playwright asserts the download fires with the right extension) | ✓ (open the file in a real editor once per release) | |
| No unexpected console errors | ✓ (every Playwright spec fails on unexpected console/page errors, via the shared `page` fixture) | | |
| Release notes (CHANGELOG) reviewed for accuracy | | ✓ | |

## Not yet covered by any process

- Real assistive-technology testing (this project uses judgment-based manual review, not a certified AT lab pass).
- Real-user performance monitoring (RUM) — Lighthouse is lab-only, see `docs/performance-testing.md`.
- Cross-browser visual regression (only Chromium is compared pixel-for-pixel; Firefox/WebKit get a small functional smoke subset via `responsive.spec.ts`, not visual diffing).

## Using this checklist

The QA Center (`/qa`) surfaces the manual items above as checkboxes, persisted per application version in `localStorage` (`shabi-ai-academy.qa-checklist.v1`). A version bump starts a fresh, unchecked checklist rather than silently carrying forward prior confirmations — see `docs/qa-center.md`. Checking every manual box is necessary but not sufficient for a **Ready** release status; every automated gate must also pass.
