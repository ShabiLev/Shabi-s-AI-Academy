# Test strategy

## Automated matrix

- Unit: schemas, bounds, permissions, presets, interpretation, transitions,
  fingerprints, skill derivation, parser quarantine, analytics allowlist.
- Component: Team Builder, mode switching, approval, pause/resume/drift,
  empty/corrupt states and source attribution.
- Integration/E2E: all six routes, create-to-complete mission, persistence,
  retry/cancel, preset copy, backup preview/import/rollback, bilingual mobile.
- Cross-browser: Chromium, Firefox, WebKit, Mobile Chromium and Mobile WebKit.
- Accessibility: axe, keyboard, focus, names, dialogs and RTL/LTR.
- Visual: 76 full-suite scenarios including eight reviewed Version 1.8
  desktop/mobile Hebrew/English Mission states. Baseline changes require
  intentional review; the global `0.002` tolerance is unchanged.
- Performance: build size and Lighthouse primary-route gates. The Version 1.8
  budget is at most +15 KiB gzip on the primary application chunk and no new
  orchestration/state dependency. The local production build measured
  133.63 kB gzip versus the recorded 1.7 baseline of 130.49 kB (+3.14 kB,
  +2.4%), inside the budget.
- Storage/release: audit, retention, determinism, exact-SHA CI and Pages parity.

## Required commands

Focused Vitest and Playwright first; then `npm ci`, `npm run test:storage`,
`npm run storage:audit`, `npm run retention:apply`,
`npm run retention:verify`, `npm run validate:release`, a second complete
visual run, `npm run quality:evidence:full`, and Pages evidence. CI must test the
exact PR and main SHAs.

Manual UX, content, security, keyboard/screen-reader and visual judgment remain
human-owned and are never auto-promoted.
