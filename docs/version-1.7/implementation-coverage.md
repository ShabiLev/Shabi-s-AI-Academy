# Version 1.7 implementation coverage

This matrix maps product requirements to implementation and verification. A row is not release-complete until its final release evidence is green.

| Requirement | Implemented | Primary files | Tests / evidence | Remaining release evidence |
| --- | --- | --- | --- | --- |
| A. Public no-login experience | yes | `src/App.tsx`, `src/pages/RadarPage.tsx` | Version 1.7 public-beta E2E | full route/manual review |
| A2. First-visit product walkthrough | yes | `src/guidance/tours/`, `HelpCenterPage.tsx`, `SettingsPage.tsx` | storage unit tests; first-visit desktop/mobile E2E; guided-tour a11y/visual | human bilingual/visual review |
| B. Versioned local guest profile | yes | `src/guest-profile/`, `GuestDataSettings.tsx` | repository unit/security tests; import E2E | full storage/retention gates |
| C. Interest onboarding | yes | `OnboardingPage.tsx`, `OnboardingContext.tsx` | onboarding unit/E2E/a11y | complete browser matrix |
| D. Live Radar ingestion | yes | `config/radar-sources.json`, `scripts/radar/`, workflow | ingestion integration tests; isolated 88-record cycle; source-health report | exact-SHA scheduled CI |
| E. Radar UX | yes | `RadarPage.tsx`, Radar context/styles | functional E2E | cross-browser, a11y, visual review |
| F. Local personalization | yes | `personalization.ts` | deterministic/diversity unit tests; E2E persistence | performance/browser review |
| G. Daily briefing | yes | `briefing.ts`, `RadarPage.tsx` | available/empty/partial unit and E2E coverage | content review |
| H. What changed | yes | `briefing.ts` | timestamp/read/checksum/correction/source-health unit tests | restart/manual review |
| I. Saved searches/following | yes | guest profile context and Radar UI | persistence/rename/delete/reset E2E | export download manual review |
| J. Feedback and analytics | yes, local-only feedback | `src/feedback/`, analytics/settings | feedback/privacy tests; consent E2E | privacy/security review |
| K. Offline/failure behavior | yes | provider, Radar context, reviewed fallback | provider unit; offline E2E; cache-preservation integration | manual partial/offline review |
| L. Future-auth compatibility | yes | repository/domain boundaries; migration doc | import/identity/conflict tests | no production login work in 1.7 |
| Security/privacy review | automated controls reviewed | parsers, CSP, allowlists, import validator, [security review](security-review.md) | malicious XML/JSON/URL/size/date tests; dependency reachability and source scans | final-SHA bundle scan and human review |
| Localization/accessibility/responsive | implemented | bilingual semantic UI and styles | E2E, axe, responsive/visual suites | all final gates and human review |
| Release/version/deployment | prepared | package metadata, docs, workflows | release gates | PR exact-SHA CI, merge, tag, deployments, production smoke |

## Deferred scope

Production registration/login expansion, account migration, cloud guest profiles, cross-device sync, email digests, unrestricted push notifications, public administration, arbitrary source submission, and uncontrolled scraping are not Version 1.7 capabilities.
