# Quality Assurance Handbook

## Purpose

Define the evidence required to call work ready, complete, and releasable. Quality reports must describe observed results; they never substitute automation for human review.

## Definition of Ready

A change is ready for implementation when its problem, user value, scope/out-of-scope, UX states, data model, security/privacy constraints, Hebrew/English copy, accessibility behavior, acceptance criteria, dependencies, version impact, and test plan are reviewable. Material unknowns have owners or blocking decisions.

## Definition of Done

Implementation, tests, translations, documentation, migrations, negative states, and release notes are complete; no unrelated behavior changed; automated gates pass; reviewed visuals are intentional; manual checklist status is disclosed; the staged diff is clean and contains no secrets/transient artifacts.

## Test pyramid and responsibilities

1. **Unit/domain tests:** validators, state transitions, hashing, import/duplicate rules, storage parsing, retries, cancellation, and deterministic providers.
2. **Component/integration tests:** context integration, form behavior, errors, local persistence, and route composition where browser fidelity is unnecessary.
3. **E2E tests:** protected navigation and every critical user-visible workflow.
4. **Accessibility automation:** axe on every new complex screen/state plus manual keyboard review.
5. **Visual regression:** representative stable screens, directions, mobile layouts, dialogs, and attribution.
6. **Performance:** Lighthouse and route smoke coverage for primary workflows.
7. **Manual exploration:** copy, visual coherence, assistive experience, platform-specific controls, and claims automation cannot verify.

## Required coverage dimensions

- Hebrew RTL and English LTR, including translated accessible names.
- Desktop, tablet, and mobile with no horizontal overflow.
- Persistence across refresh and independent storage per test.
- Empty, loading, success, failure, cancellation, retry, and approval states.
- Malformed, legacy, unavailable, and oversized storage.
- Untrusted text rendered inert; live/connected claims remain disabled unless proven.
- Reset actions affect only their declared domain.
- Catalog data remains separate from user-owned data.

### Viewport matrix

| Viewport    | Required focus                              |
| ----------- | ------------------------------------------- |
| 320 × 568   | minimum-width overflow, dialogs, navigation |
| 360 × 800   | common compact mobile                       |
| 390 × 844   | long copy and touch targets                 |
| 768 × 1024  | tablet portrait wrapping                    |
| 1024 × 768  | tablet/desktop landscape                    |
| 1440 × 900  | canonical desktop visuals                   |
| 1920 × 1080 | wide-layout bounds                          |

## Test policies

- Tests start from controlled data and do not depend on order.
- Use fixed clocks, IDs, and deterministic Mock Provider outputs.
- Prefer roles, labels, names, and test IDs only when no semantic locator exists.
- No arbitrary Playwright sleeps; wait for observable application state.
- No blanket retries, quarantines, skipped assertions, or global axe disables to hide defects.
- A flaky test is a defect: reproduce, identify nondeterminism, fix the cause, and retain equivalent coverage.
- Every production defect receives the smallest reliable regression test before closure.
- Fixtures contain no credentials or personal data and remain scoped to their test.
- Generated reports, coverage, Playwright traces, Lighthouse output, and downloads are transient unless an intentionally reviewed baseline is version-controlled.

## Release gates

Required baseline gate: `npm run validate:release`. Sprint specifications may add gates but may not weaken established ones. The quality report records lint, unit tests, coverage, build, catalog validation, E2E, accessibility, visual, performance, manual checklist, and Git diff independently.

## Manual release checklist

Review both languages and directions; viewport matrix; keyboard/focus/dialog behavior; changed visuals; external attribution and inert content; persistence/reset boundaries; error copy; browser-native controls; documentation accuracy; and absence of secrets/personal paths. Manual evidence is versioned so prior release history is not overwritten.

## Quality-report honesty

- `passed` means the gate actually ran and met its assertion.
- `failed` records a real failure; do not rewrite it as warning.
- `notRun` remains explicit.
- An incomplete manual checklist produces `readyWithWarnings`, never unconditional Ready.
- Do not fabricate live provider, connector, security, or production status.

## Review checklist

Confirm risk-to-test mapping, negative cases, bilingual/RTL coverage, viewport selection, isolation, artifact policy, regression coverage, manual status, and exact command output.

## Related validation and exceptions

Run `npm run lint`, `npm run test:run`, `npm run test:coverage`, `npm run test:e2e:full`, `npm run test:a11y`, `npm run test:visual`, `npm run test:performance`, and `npm run validate:release`. Exceptions require a documented owner, reason, expiry, compensating evidence, and approval; security/accessibility/release gates require an ADR when durable.

Related: [Testing architecture](../architecture/testing.md), [testing standard](testing.md), [security](security.md), [Sprint 7 tests](../sprint-7/07-tests.md), [release template](../templates/release.md).
