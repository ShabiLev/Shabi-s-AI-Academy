# Version 1.9 test matrix

Status legend: **Planned** means coverage is required but not yet implemented or
executed. This matrix records no Version 1.9 pass result.

## Unit and domain

| ID | Area | Required scenario | Expected result | Status |
| --- | --- | --- | --- | --- |
| U01 | Rubric | weights below/above/exactly 100, duplicates, non-finite | only exact valid schema accepted | Planned |
| U02 | Rubric | blocking fail with weighted passing result | certification blocked | Planned |
| U03 | Evidence | required evidence missing | `not-scored`, no numeric zero | Planned |
| U04 | Setup | 1, 2, 5, 6 and duplicate competitors | only 2–5 unique accepted | Planned |
| U05 | Runtime | identical snapshot/seed/repetitions | identical checksum and decisions | Planned |
| U06 | Runtime | changed seed or competitor version | distinct immutable run identity | Planned |
| U07 | Snapshot | mutate source after start | frozen input unchanged | Planned |
| U08 | Evaluator | owner evaluates own implementation | rejected and blocked | Planned |
| U09 | Evaluator | conflicting findings | disagreement preserved | Planned |
| U10 | Certification | low-confidence PASS / Reality Check block | cannot certify | Planned |
| U11 | Versioning | edit/rollback/deprecate active entity | new version; history preserved | Planned |
| U12 | Regression | improve/regress/no-change/not-comparable | correct evidence-based class | Planned |
| U13 | Baseline | failure attempts silent replacement | baseline unchanged | Planned |
| U14 | Failure | all categories, missing evidence, unconfirmed cause | safe validated record | Planned |
| U15 | Skill | visit, one run, repeated independent evidence | only eligible evidence changes level | Planned |
| U16 | Recommendation | zero/small/stale/comparable samples | limitations/confidence explicit | Planned |
| U17 | Preview | unavailable/expired/forged connector state | no write; safe status | Planned |
| U18 | Codex | escaping, omitted fields, parser round-trip | safe TOML plus checksum | Planned |
| U19 | Storage | bounds, safe IDs, checksums, corruption | reject/quarantine safely | Planned |
| U20 | Migration | repeated migration and Version 1.8 data | idempotent; 1.8 preserved | Planned |
| U21 | Isolation | cross-actor ID/key/import | generic denial; no leakage | Planned |
| U22 | Analytics | every allowed event plus content/ID/path injection | allowlisted redacted event only | Planned |
| U23 | Trace | ordering, retry, missing event, oversized metadata | append-only bounded trace | Planned |
| U24 | Security | prototype pollution and nested dangerous keys | rejected before merge/store | Planned |

## Component and accessibility

| ID | Component | Required scenario | Accessibility/UX assertion | Status |
| --- | --- | --- | --- | --- |
| C01 | Arena | empty, invalid, draft, ready | clear next action and error association | Planned |
| C02 | Picker | keyboard select 2–5 competitors | names, count, focus, removal | Planned |
| C03 | Rubric Builder | edit criteria/weights/anchors, clone built-in | live validation; immutable source | Planned |
| C04 | Evaluators | choose, independence conflict | conflict announced and start disabled | Planned |
| C05 | Run controls | start/pause/reload/continue/cancel/retry | focus and live progress restored | Planned |
| C06 | Results | pass/fail/partial/not-scored | table semantics; no colour-only state | Planned |
| C07 | Disagreement | two evaluator findings | side-by-side evidence, no averaging | Planned |
| C08 | Trace | filters, pagination, evidence disclosure | keyboard complete; safe summaries | Planned |
| C09 | Suites | baseline, critical regression, history | baseline protection visible | Planned |
| C10 | Failure Case | create/link/remove practice evidence | private preview and consent | Planned |
| C11 | Version diff | long bilingual content | inert text, directional isolation | Planned |
| C12 | Preview | supported/unavailable/expired | preview-only wording; no send CTA | Planned |
| C13 | Codex export | validation, preview, download | omissions/errors discoverable | Planned |
| C14 | Responsive | 320px, 200% zoom, long Hebrew/English | no clipping/overflow; 44x44 targets | Planned |
| C15 | Motion | running/progress with reduced motion | no required animation | Planned |
| C16 | Recovery | corrupted repositories | scoped recovery without data loss | Planned |

## Integration and E2E

| ID | Journey | Required result | Status |
| --- | --- | --- | --- |
| I01 | Full experiment lifecycle | setup → freeze → run → evaluate → compare → certify | Planned |
| I02 | Needs evidence | persist missing evidence, add valid evidence, resume safely | Planned |
| I03 | Agent versions | compare exact versions and preserve previous run | Planned |
| I04 | Prompt regression | exact baseline/version/evidence classification | Planned |
| I05 | Suite baseline | all cases, preserved history, explicit baseline action | Planned |
| I06 | Blocking regression | publication/certification blocked | Planned |
| I07 | Failure to Skill Map | reviewed failure adds removable practice evidence | Planned |
| I08 | Connected preview | instrumented network/storage proves no external write | Planned |
| I09 | Backup/reset/import | preview, transactional apply/rollback, domain reset | Planned |
| I10 | Version 1.8 regression | existing Mission/Team/Pause/Skill data remains usable | Planned |
| E01 | Hebrew Agent comparison | RTL comparison with evidence and capability label | Planned |
| E02 | English Prompt A/B | LTR versioned prompt comparison | Planned |
| E03 | Rubric create/clone | built-in unchanged; user clone persisted | Planned |
| E04 | Evaluator disagreement | independent findings remain visible | Planned |
| E05 | Pause/reload/continue | exact checkpoint and drift detection | Planned |
| E06 | Blocking suite | critical regression blocks publication | Planned |
| E07 | Failure Case | save reviewed, redacted linked case | Planned |
| E08 | Skill Map update | eligible evidence only | Planned |
| E09 | GitHub preview | exact draft shown; no network write | Planned |
| E10 | Codex export | TOML download, parse-back and checksum | Planned |
| E11 | Mobile 320x568 | complete journey with no overflow/clipping | Planned |
| E12 | V1.8 regression | Missions, Teams, WALK ME, Help, Radar, backup | Planned |

## Browser, visual, performance, and security

| Gate | Matrix | Blocking conditions | Status |
| --- | --- | --- | --- |
| Cross-browser | Chromium, Firefox, WebKit, Mobile Chromium, Mobile WebKit | functional or semantic divergence | Planned |
| Accessibility | axe, keyboard, focus, tables, chart alternatives, live regions, 200%, reduced motion, RTL/LTR | WCAG 2.2 AA regression or incomplete flow | Planned |
| Visual | 10 named Version 1.9 states plus full existing suite, twice | clipping, wrong data, direction, contrast, misleading chart, broken focus, instability | Planned |
| Performance | bundle, long traces, 100+ runs, history, suites, backup, mobile | measured budget or usability gate failure | Planned |
| Security | audit, secrets, fuzz, XSS, permissions, independence, tamper, redaction, actor leakage, TOML injection | exploitable or privacy/integrity failure | Planned |
| Storage | clean/migrated/corrupt/oversized, retention, backup rollback | data loss, actor leakage, orphaned certification | Planned |

## Release evidence

The implementation must add `npm run test:version-1.9`, then run every command
listed in [09-test-strategy.md](09-test-strategy.md). Visuals run twice
sequentially. Exact PR-head CI, independent Reality Check, exact main merge-SHA
CI, deployments, and production smoke are separate gates. A missing or not-run
gate remains explicit and never becomes a pass.
