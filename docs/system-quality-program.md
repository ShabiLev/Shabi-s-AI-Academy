# System-wide product quality program

Version 1.3.0-beta.1 adds a browser-driven quality layer for the product as experienced by real users. The source inventory is under `quality/inventory/`; exploratory charters and the structured heuristic checklist are under `quality/exploratory/` and `quality/checklists/`. Generated evidence is written to the ignored `quality/generated/` directory.

## Suites

- `npm run quality:inventory` fails when an App route has no complete page record.
- `npm run test:journeys` runs 13 critical journey files with screenshots, video, and traces retained for release review.
- `npm run test:ux` runs auth/data matrices, copy and error recovery, form and overlay checks, responsive and keyboard interactions, a route crawler, and the non-destructive click audit.
- `npm run test:visual` compares reviewed baselines without changing them. `npm run test:visual:review` builds the evidence gallery. Baseline changes require `VISUAL_UPDATE_APPROVED=1 npm run test:visual:update` and prior human review.
- `npm run test:release-candidate` and `npm run test:release-candidate:pages` exercise local BrowserRouter and GitHub Pages HashRouter candidates respectively.
- `npm run quality:system-report` creates `system-quality-report.json` and a human-readable HTML report.

Headed review is available through `test:ui:headed`, `test:journeys:headed`, and `test:ux:headed`. Headed execution complements assertions; it does not replace the headless release gates.

## Evidence and privacy

Critical journey evidence includes action traces, checkpoint screenshots, and video. Failed test evidence is retained by default. Tests must use controlled disposable data and must not type or capture real passwords, tokens, private documents, or production content. Browser console exceptions and unexpected product errors fail the shared Academy fixture.

## Manual UX gate

The `manualUxReview` record begins as `notRun`. That status yields `readyWithWarnings`; `failed` blocks, `passedWithWarnings` remains `readyWithWarnings`, and only `passed` may yield `ready` when all automated gates and severity rules also pass. Automation and Codex must not claim subjective UX approval. A human reviewer must assess comprehension, orientation, hierarchy, wording, primary actions, mobile usability, Hebrew, English, terminology, complexity, overlap, clipping, dark controls, and trust, then record reviewer and date.

Critical or unresolved High findings block release. Medium findings require a warning and owner; Low findings enter the documented backlog.
