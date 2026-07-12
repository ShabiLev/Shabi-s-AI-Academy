# Sprint 7 Test Specification

## Purpose and rules

Provide risk-based evidence for every new domain rule and visible workflow without weakening 0.6.1 coverage. Vitest is mandatory for domain logic; Playwright for every visible critical flow; axe for every new complex screen/state; reviewed visuals for representative screens; Lighthouse for new primary routes.

Tests use deterministic clocks/IDs/Mock scenarios, independent storage, accessible locators, no arbitrary waits, no hidden order dependency, no global axe disables, and no reduced assertions. Unexpected page and severe console errors fail tests.

## Detailed matrix

| Area              | Vitest/domain                                                             | Playwright/user flow                                                                  | Non-functional/negative                                |
| ----------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| State machine     | every valid/invalid status transition, terminal immutability, event order | visible status/timeline progression                                                   | rapid cancel, late completion, unknown event           |
| Mock Provider     | contract, deterministic same-input output, scenario fixtures, validation  | repeat run produces equivalent result                                                 | no network/random/waits; honest labels                 |
| Dry Run           | assembly/validation, execute never called, preview schema                 | preview without generated result/history claim                                        | unresolved variables, malformed input                  |
| Live Reserved     | validation rejects execution/config                                       | disabled control and explanation                                                      | no key field/storage/request                           |
| Approvals         | request schema, approve/reject, default deny                              | keyboard dialog, focus restore, exact action summary                                  | reject/cancel and repeated approval                    |
| Retry             | retryable codes, attempts 2/default max 3, exhaustion                     | attempt events and final recovery                                                     | terminal/non-retryable error                           |
| Cancellation      | idempotence, cancellable statuses, race handling                          | cancel queued/running/waiting/retrying                                                | terminal run cannot change                             |
| Run History       | schema, 50 limit, ordering, delete/clear                                  | refresh, filters, details, delete/clear                                               | corrupt/unknown/oversized/unavailable storage          |
| Starter Agents    | 22 schema, bilingual metadata, unique IDs/hashes/bodies, scores           | browse/search/filter/preview/import/edit                                              | catalog immutability, planned tools, no personal count |
| Agent duplicates  | duplicate detection/import planner                                        | open existing/import another/cancel                                                   | no silent overwrite                                    |
| Prompt Packs      | 100+ distribution, variables, search/filter, curation                     | pack/preview and one/selected/full import                                             | bulk validation, duplicate skip/override, provenance   |
| Prompt Playground | assembly, variable rules, token heuristic, export                         | preview/Mock/Dry/copy/export/history                                                  | external text inert, stale output reset                |
| Agent Playground  | selection, request mapping, scenarios                                     | starter/personal run, approvals/retry/cancel/logs                                     | tools unconnected, long content, privacy copy          |
| Learning Journey  | order/status/progress/no-lock derivation                                  | map/list/lesson/reset/refresh                                                         | corrupt progress; existing lessons open                |
| Roadmap           | versions/states/dates/translations/links                                  | groups, list/timeline, CHANGELOG                                                      | no fake metrics/live status                            |
| QA Center         | 0.7.0 checklist/gate semantics                                            | notRun warning and completion behavior                                                | 0.6.1 history preserved                                |
| How To            | anchors and bilingual content                                             | contextual links and troubleshooting                                                  | deep-link refresh                                      |
| Security          | validators, safe filenames, inert text                                    | disabled live, approval, no external calls                                            | injection strings, secret-pattern scan                 |
| RTL/LTR           | translation key completeness                                              | all primary flows in Hebrew/English                                                   | logical layout and content direction                   |
| Responsive        | pure bounds where useful                                                  | required viewport matrix                                                              | no overflow/dialog escape                              |
| Accessibility     | semantic component tests where useful                                     | axe on catalog, packs, both playgrounds, history/details, journey, roadmap, approvals | keyboard, focus, live regions, non-color meaning       |
| Visual            | stable data fixtures                                                      | canonical desktop/mobile/directions and complex states                                | deliberate review only                                 |
| Performance       | bounded/search behavior                                                   | primary-route smoke                                                                   | Lighthouse thresholds unchanged                        |

## Required Playwright scenarios

At minimum: protected/deep-linked routes; Mock success/failure/retry/cancel/approval; Dry Run non-execution; Live disabled; history persistence/corruption/delete; Starter Agent browse/import/duplicate; Prompt Pack one/selected/full imports and duplicates; both playgrounds; journey map/list/no-lock; roadmap states/links; QA/How To anchors; Hebrew/English; mobile/tablet/desktop; keyboard; inert external text; reset-domain isolation; sign-out/login persistence.

## Viewports and projects

Exercise 320×568, 360×800, 390×844, 768×1024, 1024×768, 1440×900, and 1920×1080 through parameterized responsive tests. Run established Chromium fast/full multi-browser projects as configured; do not duplicate every case on every browser when a risk-based representative matrix provides equivalent evidence.

## Visual baselines

Review Prompt Playground, Agent Playground, waiting approval, Run History/details, Starter Agents catalog/details/imported attribution, Prompt Packs overview/details/bulk dialog, Learning Journey map/list, Roadmap desktop/mobile, and changed Dashboard/navigation/QA/How To views. Never update snapshots in normal validation.

## Performance

Add smoke routes for prompt/agent playgrounds, starter agents, prompt packs, run history, learning journey, and roadmap. Keep existing thresholds. Review bundle size and prove no full external dataset or unnecessary runtime dependency is bundled.

## Release evidence

Required focused commands are defined in [release spec](08-release.md); final authority is `npm run validate:release`. Record exact pass/fail/notRun status. Manual checklist remains a warning until a human completes it.

Related: [QA handbook](../standards/qa.md), [testing architecture](../architecture/testing.md), [Playwright ADR](../adr/ADR-007-playwright-quality-platform.md).
