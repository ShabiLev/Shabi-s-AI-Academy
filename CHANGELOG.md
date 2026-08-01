# Changelog

## [1.9.0-beta.1] - 2026-07-30

### Added

- Actor-scoped Agent Evaluation Lab for deterministic comparisons of Agents,
  prompts, teams, guidance modes, and Mission versions against immutable inputs.
- Eight transparent built-in rubrics, independent read-only evaluators,
  criterion-level evidence, confidence, missing-evidence, disagreement, and
  certification rules.
- Pause/Continue-safe evaluation runs, sanitized trace inspection, immutable
  version references, regression suites, a local Failure Library, and
  evidence-based learning and team recommendations.
- Immutable local Agent, Prompt, Team, Mission, and rubric snapshots with
  exact-version provenance, rubric rollback/deprecation, and protected history.
- Preview-only connected workflow plans and validated Codex Agent TOML export
  with preview, round-trip parsing, checksum, and omitted-field reporting.
- Transactional backup/import for all nine Version 1.9 evaluation domains with actor
  isolation, pre-write candidate validation, atomic run/evidence/trace graphs,
  bounds, quarantine, retention, tamper detection, immutable collision
  protection, and an explicit imported-result revalidation flow.

### Changed

- Navigation, Help, backup, analytics governance, and release evidence now
  include the Evaluation Lab while preserving Version 1.8 Missions and Teams.

### Security and privacy

- Version 1.9 performs no real-provider comparison and no external connector
  write. Every beta result is labelled `Academy deterministic evaluation`.
- Trace, analytics, previews, and exports exclude raw Mission content, secrets,
  standalone provider tokens, credentials, unsupported permissions, and private
  absolute or UNC paths.
- Result certification is recomputed against the exact frozen rubric during
  both repository save and load; internally re-checksummed forgeries are
  quarantined instead of trusted.

### Known limitations

- Connected workflows are previews only. Codex export downloads a validated
  TOML file but never installs it from the browser.
- Local checksum validation detects accidental or local-record tampering; it is
  not a cryptographic signature and does not establish authenticity against an
  attacker who can rewrite both browser storage and its checksum; imported
  evaluation results therefore require local revalidation.

## [1.8.0-beta.1] - 2026-07-29

### Added

- Explainable Agent Team Builder with one Conductor, at most eight unique active members, bounded permissions, five immutable presets, and editable local copies.
- Mission Workspace with interpretation, acceptance criteria, explicit plan approval, sequential phases, independent review, PASS/FAIL evidence, safe execution levels, four guidance modes, and persistent Pause/Continue drift detection.
- Twelve inert, manually adapted specialist templates from `msitarzewski/agency-agents`, pinned to revision `8ef49232e02431f7ca4792b487e5a85a7939ff3a` with MIT attribution and no runtime network import.
- Evidence-derived 12-domain Skill Map and bounded local Context Packs.
- Actor-scoped repositories for missions, teams, skill evidence, Context Packs, and allowlisted mission analytics, including corruption quarantine, independent reset, and transactional backup/rollback.
- Bilingual, responsive routes for Missions, Mission Builder, Mission Workspace, Agent Teams, Plan, and Evidence.

### Changed

- Dashboard priorities now lead with Continue mission, Start mission with a team, and Learn a skill while preserving Radar as a secondary learning surface.
- Complete Workspace backup now previews, merges/replaces, and rolls back the five Version 1.8 domains.

### Security and privacy

- Connected and local execution levels are visible for learning but disabled. No browser credential field or external action is introduced.
- Agents cannot approve their own phases; imported/stored content remains inert, bounded, actor-scoped, and excluded from analytics.

## [1.7.0-beta.4] - 2026-07-28

### Fixed

- WALK ME now auto-launches for every fresh local actor on an eligible, ready Academy shell route, independently of onboarding completion.
- Finishing or skipping onboarding launches the walkthrough on Dashboard without requiring a page reload.
- Fresh safe deep links such as Help and Radar keep their route for the welcome step, move to Dashboard when the tour starts, and return after completion or temporary close.
- Visible blocking dialogs defer launch until they close, while hidden dialog markup no longer blocks first-visit guidance.
- A per-actor launch guard prevents duplicate initialization during Strict Mode, rerenders, and shell mutations.

### Security and privacy

- Actor-scoped walkthrough storage, completion semantics, local-only persistence, Radar behavior, retention policy, and visual tolerances remain unchanged.

## [1.7.0-beta.3] - 2026-07-27

### Added

- One global, bilingual eight-step WALK ME product walkthrough with speech-bubble placement, a focused spotlight, mobile bottom-sheet adaptation, and completion-gated replay in the sidebar, mobile drawer, Help Center, and Settings.
- Typed, centralized Help Center area and level localization with direct public access.

### Changed

- Closing with Escape or `Not now` now preserves `in-progress` state and resumes on the next visit; only the final `הבנתי` / `Got it` action marks the actor-scoped walkthrough complete.
- Help Center now has one semantic `h1`, localized filters and area metadata, stronger muted contrast, clearer panel affordance, responsive filters, and aligned card actions.

### Removed

- Module-level tour banners, repeated local tour CTAs, and generic per-module tour definitions.

### Security and privacy

- Walkthrough state remains bounded, validated, actor-scoped, browser-local, and excluded from exported user work. No commercial WalkMe SDK or new provider integration was added.

## [1.7.0-beta.2] - 2026-07-27

### Added

- Accessible eight-step first-visit product walkthrough with Hebrew RTL and English LTR copy, responsive spotlight targets, keyboard focus management, reduced-motion support, and mobile navigation guidance.
- Actor-scoped, bounded and validated walkthrough progress with refresh resume, one-time completion/dismissal behavior, and restart/reset controls in Help and Settings.

### Changed

- Playwright fixtures now seed first-visit completion by default so existing regression and visual suites remain isolated; dedicated first-visit tests opt into fresh state.

### Security and privacy

- Walkthrough state remains browser-local, contains no prompt content or precise identity, is excluded from guest export/import, and records no analytics without the existing explicit consent boundary.

## [1.7.0-beta.1] - 2026-07-26

### Added

- No-login public Academy and Live AI Radar views: Latest, Important, Following, Israel First, Saved/Read Later, Recently Viewed, filters, saved searches, related coverage, local daily briefing, and “what changed.”
- Fixed-registry scheduled RSS/Atom ingestion with bounded retrieval, retry/backoff, parser isolation, source health, quarantine, deduplication/clustering, provenance, and atomic cache-preserving publication.
- Versioned local guest profile with optional interest onboarding, favorites, read/dismissed/recent state, following, feedback, consent, retention, corruption recovery, reset, and validated checksum-protected export/import with merge/replace preview and rollback.
- Deterministic local recommendation ranking with explanations, freshness, explicit preferences/feedback, Israel relevance, and source diversity.

### Security and privacy

- External content stays inert text and all feed/import schemas, strings, arrays, URLs, timestamps, payloads, and storage are bounded.
- Analytics is opt-in and resettable. Radar feedback remains local-only until a trusted same-origin submission endpoint is approved.
- Added source-specific allowlists and Content Security Policy headers. No provider credentials or source-management secrets are present in the browser.

### Known limitations

- Guest state is device-local and does not sync. Production login, account migration, cloud profiles, email digest, push notifications, and public source administration are deferred.
- The Israel Innovation Authority feed is registered but disabled because its edge policy rejects the supported Node retrieval path; the reviewed Israeli education fallback remains available.

## [1.6.0-beta.1] - 2026-07-25

### Added

- Four-step, skippable onboarding with a deterministic starting recommendation.
- Per-user onboarding, experience-mode, navigation, and contextual-hint preferences.
- Bounded quality-runtime retention, storage audit, cleanup, integrity, fingerprint, and determinism commands.
- Dedicated Recent Items history route and contextual help hints.

### Changed

- Replaced the Dashboard card collection with one continuation section and four primary task tiles.
- Reduced Beginner Mode navigation to eight task-oriented destinations; advanced tooling remains available behind an explicit mode switch.
- Pinned Linux CI runners and added provenance checks, build determinism, baseline integrity, and ten-run visual-candidate verification.

### Fixed

- QA Center's sample quality report no longer drifts into a false "stale data" warning as calendar days pass; its `generatedAt` is computed at load time instead of a fixed past date, and the "Last Validated" field is excluded from visual comparison.
- About page's Commit/Build visual mask now covers the full row container instead of only the value, removing a source of Linux baseline non-determinism.
- Eliminated a QA Center scroll-position source of Linux visual non-determinism.

### Safety

- Runtime cleanup preserves approved visual baselines, archives, configuration, inventory, and human-reviewed evidence.
- Visual candidates remain review-only and are never committed or approved automatically.
- One localized, human-reviewed Linux visual condition is waived for this release; see [`docs/release-waivers/1.6.0-beta.1-linux-visual.md`](docs/release-waivers/1.6.0-beta.1-linux-visual.md).

All notable changes to this project are documented here following the Keep a Changelog format.

## [1.5.0-beta.1] - 2026-07-22

### Added

- Live source-based AI Radar, seven-day history, favorites, provider states, and source-quality/freshness metadata
- AOS Event Bus, Scheduler, background-job model, and Capability Registry foundations
- Profile Recent Items history, expanded overlay regression coverage, and a global form-control design standard

### Changed

- Dashboard simplified and layouts use available space more efficiently
- Sidebar groups are collapsed by default; Recent Items moved from Dashboard to Profile/History
- RTL/LTR alignment hardened and AI Radar moved from static presentation to a validated provider architecture
- Form controls remain visually identifiable when unfocused

### Removed

- Dashboard Workspace Overview, Workspace Status, duplicate Recent Items, and redundant workspace-state indicators

### Fixed

- Local Notifications dismissal, focus restoration, unclear unfocused controls, default-open sidebar sections, and directional alignment inconsistencies

### Security

- Online Radar content is schema-validated and inert; source content cannot execute commands
- Provider secrets remain outside frontend bundles; Scheduler and Capability Registry use explicit permissions; Event Bus payloads are typed

## [1.4.0-beta.1] - 2026-07-14

### Added

- Agent Operating System (AOS) at `.agent/`: a modular, versioned instruction framework with a `master.md` orchestration entry point, `manifest.json` module catalog, `registry.json` task-to-module mapping, and a documented precedence order
- Workflow modules covering development, planning, implementation, testing, debugging, refactoring, documentation, deployment, UI/UX/accessibility/performance validation, research, knowledge ingestion, self-review, and final reporting
- Task classification with Low/Medium/High/Critical risk levels covering 22 task types
- Codex and Claude Code compatibility entry points (`.codex/workflows/aos.md`, `.claude/workflows/aos.md`) and a new repository-root `CLAUDE.md`
- Knowledge modules interpreting existing project standards for React, TypeScript, state management, routing, storage, testing, accessibility, security, performance, i18n/RTL-LTR, Git, GitHub Actions/Pages, Supabase, and AI-specific topics (MCP, RAG, memory, tool calling, evaluation, observability, AI safety)
- Research operating system: source ranking (four-tier model), freshness policy, claim verification, citation policy, duplicate detection, and per-source-type analysis guides, plus an explicit, non-crawling research data pipeline under `research/` with validation/scoring/freshness/candidate-generation scripts
- Security, Git, and release policy modules, including MCP tool risk classification
- Multi-agent handoff protocol for Codex/Claude Code continuity and an explicit file-based memory model
- Explicit Agent Memory and Progress with ten schema-validated runtime records, bounded durable summaries, deterministic update/check/report scripts, and cross-agent startup/shutdown continuity
- AOS validation scripts (`npm run aos:check` and subcommands) detecting broken links, orphan modules, circular dependencies, invalid schemas, and stale version references
- Authenticated AOS dashboard at `/aos` with `/aos/modules`, `/aos/research`, `/aos/evidence`, `/aos/handoffs`, `/aos/security`, and `/aos/releases`, backed by a generated status snapshot (`npm run aos:snapshot`) — never a hardcoded status
- `docs/aos/` documentation set covering the AOS architecture, task classification, research system, evidence system, security, Git workflow, release workflow, handoffs, troubleshooting, and extension guide

### Changed

- `AGENTS.md` and `CLAUDE.md` now point to `.agent/master.md` as the orchestration entry point instead of describing workflow steps inline
- The quality evidence runner (`scripts/run-quality-evidence.mjs`) now also copies `environment.json`, `commands.json`, `git-state-before.txt`, and `git-state-after.txt` into `quality/execution/latest/`, matching the AOS evidence requirements
- Application, Runtime, workspace exports, local histories, quality fixtures, visible footer, About, Release Center, and search metadata now identify Version 1.4.0-beta.1

### Security

- AOS prevents automatic destructive Git behavior: no auto push/merge, no `reset --hard`, no blind `add -A`
- Research content is treated as inert data and is never executed
- Evidence logs remain sanitized; MCP write-capable and destructive tools require explicit approval per the new MCP security policy
- Secret-bearing data is explicitly prohibited from AOS memory files
- Sanitized `/aos/progress` and `/aos/memory` views never present stale evidence as current, and memory validation rejects secret-like values and unnecessary absolute private paths

## [1.3.0-beta.1] - 2026-07-14

### Added

- Guided Beginner and Advanced experiences with grouped navigation, personalized onboarding, page introductions, breadcrumbs, contextual Help, Glossary, and restartable tours
- Optional Supabase authentication, account recovery, profiles, security guidance, RLS-backed cloud data contracts, conflict review, and safe local-to-cloud migration
- Secure role-gated Admin foundation that denies standard and unverified users without exposing privileged data
- Machine-readable product-quality inventory for 68 routes, 68 pages, 221 expected controls, 13 journeys, 8 personas, 11 auth states, 13 data states, and 7 required viewports
- Browser journey, click, route, form, overlay, responsive, keyboard, copy, error-recovery, visual-review, and system-report tooling

### Changed

- Application, Runtime, workspace exports, local histories, quality fixtures, visible footer, About, Release Center, and search metadata now identify Version 1.3.0-beta.1
- Visual baseline updates require explicit `VISUAL_UPDATE_APPROVED=1`; baseline generation alone is never treated as UX approval
- The unified system-quality report records severity counts and an explicit `manualUxReview` gate

### Fixed

- Unknown routes now show a bilingual recovery page instead of a blank application
- How To no longer nests a second `main` landmark inside the application shell
- Route, form, overlay, profile-menu, RTL/LTR, viewport, and browser-error auditing now exercises the real UI

### Security and privacy

- Browser tests use controlled local and mocked states and do not record passwords, tokens, secrets, or private content
- Guest/local work remains available when Supabase is unconfigured, unavailable, or offline
- No browser component stores provider secrets or calls an AI provider directly

## [1.2.0-beta.1] - 2026-07-13

### Added

- Bilingual AI Radar with eight curated signals from official first-party sources
- Search plus topic and horizon filters, direct attribution, publication dates, verification dates, and stale-snapshot disclosure
- Desktop portal profile menu and full-width mobile profile sheet
- Controlled design-system layer tokens and reviewed Hebrew/English desktop/mobile profile baselines

### Changed

- Dashboard Radar card now opens the complete source-based experience
- Sidebar navigation owns its scroll region while portal overlays remain viewport-anchored
- Shared color, surface, radius, status, spacing, and z-index tokens now have explicit fallbacks
- Roadmap, How To, QA, source policy, testing, visual regression, and release documentation cover 1.2 behavior

### Fixed

- Profile content no longer clips inside or overlaps sidebar navigation without a separating surface
- RTL and LTR profile anchoring now follow the trigger's logical edge and clamp to the viewport
- Escape, outside activation, Tab, focus entry/return, menu arrow keys, long labels, and repeated opening behave predictably
- Mobile profile access no longer uses a narrow floating popover or conflicting nested scroll region
- Radar and shared application layouts remain free of horizontal overflow at the required viewport matrix

### Security and privacy

- Radar is an immutable bundled snapshot: it performs no fetch, scraping, tracking, telemetry, or background refresh
- Only allowlisted first-party HTTPS sources are admitted; source summaries are Academy-authored bilingual paraphrases
- Existing local-only storage, Mock/Dry Run execution, disabled Live mode, and secret boundaries remain unchanged

## [1.1.0-beta.1] - 2026-07-13

### Added

- Global Search
- Command Palette
- Local Assistant Sidebar
- Local AI Chat with safe action routing
- Advanced Prompt Builder
- Advanced Agent Builder
- Workflow Builder foundation
- Notification Center
- Browser-local analytics
- Recent and favorite entities
- Workspace export and import
- Keyboard shortcuts
- Workspace storage manager

### Changed

- Dashboard is now an integrated Command Center
- Navigation is grouped by Learn, Build, Workspace and System
- Existing Prompts, Agents, Projects and Runs are connected across the Workspace
- Assistant suggestions use current route and entity context
- GitHub Pages now publishes the built `dist` artifact with a repository-aware Vite base path and HashRouter while local development and Vercel retain BrowserRouter

### Fixed

- GitHub Pages no longer publishes the Vite source entry from `main`/root, which caused a blank site
- Favicon, manifest, canonical, Open Graph, JavaScript, and CSS paths now resolve correctly under `/Shabi-s-AI-Academy/`

### Security

- Assistant cannot execute arbitrary code
- Workflow execution remains Mock and Dry Run only
- No live provider is required
- No secrets are exported
- Imported Workspace data is validated before use

## [1.0.0-beta.1] - 2026-07-13

### Added

- Complete open bilingual curriculum: 45 lessons across 10 modules, with objectives, examples, exercises, quizzes, mini-projects, related resources, references, and recommended prerequisites
- 250 structured bilingual prompts across 11 curated packs, with safe one/selected/pack import into user-owned local records
- 32 immutable bilingual starter-agent templates with local import and clearly disconnected planned tools
- Prompt and Agent Playgrounds powered by the shared Runtime Engine, including Mock, Dry Run, local history, token estimates, timelines, and project links
- Versioned browser-local Projects and Knowledge Base workspaces with validated persistence, safe import, search, and non-cascading links
- About, Learning Journey, Roadmap, Changelog, Documentation, Release, and Developer pages
- Reserved server-side live-provider boundary with consent/origin/size validation; no live adapter is enabled in this beta
- Vercel SPA routing, safe public build metadata, discovery assets, security headers, and deployment/rollback documentation

### Changed

- Dashboard, navigation, Help, Settings, QA Center, Release Center, automated suites, visual baselines, and documentation now cover the complete beta platform
- Production bundle uses route-level loading and a deterministic React vendor chunk without weakening performance thresholds

### Security

- Live execution remains disabled, browser API keys are rejected, external text is rendered inert, and local import/storage boundaries are validated
- Serverless `/api` routes are excluded from the SPA rewrite and the reserved provider endpoint never calls an external provider

### Known limitations

- Demo Login is not production authentication; data is browser-local and origin-specific
- RAG, cloud sync, real tools, real MCP, billing, and production provider execution are not included
- Vercel Preview readiness and the human release checklist require post-push review and are never fabricated by local automation

## [0.7.0-alpha.1] - 2026-07-12

### Added

- Deterministic Runtime Engine and typed state machine
- MockProvider and Dry Run generation
- Provider and planned-tool registries
- Approval, retry, and cancellation flows
- Browser-local Run History, Runtime demo, and detail routes
- Runtime QA Center metrics, How To guidance, and automated regression coverage

### Changed

- Agent architecture now has a reusable execution foundation
- QA Center now reports Runtime capability and test status
- Application navigation includes Run History

### Security

- Live execution remains disabled
- No API keys are accepted or stored
- No external tools are executed
- Mock and Dry Run remain browser-local

## [0.6.1] - 2026-07-12

### Added

- Curated prompts.chat Starter Catalog
- Safe external Prompt import workflow
- Source and CC0-1.0 license attribution
- Controlled developer tooling for Catalog validation and updates
- Prompt Catalog and third-party data documentation
- Automated Catalog regression coverage

### Changed

- Prompt Library header now uses a consistent page-header layout
- Prompt Library filters now use a responsive aligned toolbar
- Dashboard distinguishes personal Prompts from Starter Catalog Prompts
- How To explains Catalog browsing, importing, duplicates, and attribution
- Shared spacing and form-control alignment were standardized

### Fixed

- Misaligned New Prompt action and excessive blank spacing above filters
- RTL favorites-checkbox, select-arrow, and form-control alignment
- Inconsistent filter-control heights, toolbar overlap, and mobile overflow

## [0.6.0] - 2026-07-11

### Added

- Twelve-step Agent Builder, browser-local Agent Library, five templates, Blueprint export, and deterministic simulation scenarios
- Deterministic Agent design-quality score with explicit production-readiness limitations
- “Anatomy of an Agent” lesson, dashboard Agent metrics, and a searchable bilingual How To guide
- Explicit `manualChecklist` quality gate with versioned local override semantics

### Fixed

- Lighthouse preview startup now uses HTTP readiness polling and guaranteed cleanup instead of log-pattern detection

## [0.5.0] - 2026-07-11

### Added

- Bilingual QA Center (`/qa`) with a release-status header, all 10 quality gates, test/coverage/accessibility/visual/performance summaries, a known-issues overview, and a deterministic (non-AI) analyzer summary
- Vitest code coverage via `@vitest/coverage-v8` with enforced, measured thresholds (statements/lines 75%, branches 65%, functions 70%; real baseline ~95/84/80/95%)
- Playwright accessibility suite (`@axe-core/playwright`, WCAG2A/AA) across 17 scans in Hebrew and English, plus a typed, empty-by-default allowlist policy
- Deterministic Playwright visual regression (`visual-chromium` project) with 22 baselines across desktop/mobile and Hebrew/English, fixed viewport/locale/timezone/color-scheme/reduced-motion, and a documented Windows-vs-Linux baseline provenance policy
- Lighthouse CI performance gates against a production build, covering both public (`/login`) and authenticated (Dashboard, QA Center) routes via a custom Lighthouse User Flow script, desktop and mobile profiles
- Lightweight Playwright performance-smoke checks (no failed requests, no unhandled errors, generous non-flaky interactivity bounds) complementing Lighthouse
- Machine-readable quality-report pipeline (`quality/scripts/collect-quality-results.mjs`, `analyze-quality-results.mjs`, `write-build-metadata.mjs`) producing `quality/generated/latest-quality-report.json`, never fabricating a "Passed" result for a tool that didn't run
- Internal, browser-local QA issue register (create/edit/resolve/reopen/filter/search/delete/export/import) and a per-version release-readiness checklist (automated gates + manual checkboxes)
- Non-sensitive build metadata (app version, commit SHA, branch, build timestamp) injected via Vite `define`, with safe fallbacks when unavailable
- `docs/quality-gates.md`, `docs/accessibility-testing.md`, `docs/visual-regression.md`, `docs/performance-testing.md`, `docs/manual-qa-checklist.md`, `docs/qa-center.md`, and `quality/README.md`
- GitHub Actions CI split into `quality-core`, `e2e`, `accessibility`, `visual`, `performance`, and `quality-summary` jobs with diagnostic artifact uploads, plus a manual `workflow_dispatch` job to regenerate canonical Linux visual baselines for review

### Changed

- `docs/testing.md` now documents the full quality-command surface and a permanent rule requiring accessibility/visual/performance/persistence coverage for every future feature or bug fix
- README documents the new Quality Engineering platform, updated project structure, and updated current-limitations/roadmap sections
- Bumped `vitest`/`@vitest/coverage-v8` to 3.2.7, resolving a critical upstream advisory in the Vitest UI dev server (unused in this project's scripts, but no longer present regardless)

### Fixed

- Insufficient color contrast on the mobile sidebar's version/status text, found by the new accessibility suite
- Missing distinction between quality-gate states Passed, Failed, Warning, Not run, and Not available (previously no representation existed at all)
- Lack of automated WCAG regression coverage
- Lack of stable, deterministic visual-change detection
- Lack of enforceable code-coverage thresholds

## [0.4.0] - 2026-07-11

### Added

- Interactive Prompt Workshop, live preview, deterministic quality score, four samples, and browser-local Prompt Library
- Prompt create, edit, duplicate, delete, favorite, search, filters, sorting, TXT/Markdown export, and Lesson 2 integration
- Prompt Library Vitest and Playwright coverage

### Changed

- Dashboard Prompt Library card now uses stored metrics
- Prompt Library placeholder replaced by a functional workspace
- Validation expanded with prompt regression coverage

### Fixed

- Empty generated sections are omitted and malformed storage is handled safely
- Improved mobile prompt forms and confirmation dialog behavior

## [0.3.0] - 2026-07-11

### Added

- Playwright E2E infrastructure, automatic server startup, desktop/mobile projects, reports, traces, screenshots, and videos
- GitHub Actions validation and failure artifacts
- Typed bilingual course model, catalog, lesson pages, local progress, quizzes, drafts, reset, and two complete lessons

### Changed

- Dashboard progress and Continue Learning now use saved progress
- Validation now includes browser regression tests

### Fixed

- Removed hardcoded progress and excluded Coming soon lessons from calculations
- Improved responsive lesson, table, and quiz behavior

## [0.2.0] - 2026-07-11

### Added

- Authentication-ready architecture
- Demo login page
- Protected routes
- User profile menu
- Mobile Home and Back navigation
- Language selection in Settings

### Changed

- Improved desktop and mobile headers
- Language selector moved from the header to Settings
- Responsive behavior improved
- Hebrew user display name corrected to שבי

### Fixed

- Mobile layout overlap risks
- Empty placeholder layout region
- RTL and LTR responsive inconsistencies
- Unsafe fixed-size layout behavior

## [0.1.0] - 2026-07-09

### Added

- Initial React, TypeScript, Vite application foundation
- Bilingual dashboard and routed academy sections
