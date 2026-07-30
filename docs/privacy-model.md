# Privacy model

The Academy is local-first. Guest learning progress, prompts, agents, projects, knowledge, workflows, runs, preferences, onboarding, and analytics remain in the current browser unless the user configures, signs in, and explicitly chooses a cloud operation.

Supabase may process account identifiers, email, profile preferences, and selected user-owned records only in the optional historical authentication flows. Passwords and authentication sessions are provider-managed and excluded from Academy exports. Built-in catalogs contain no user data. Local analytics are disabled until explicit consent and are not sold or sent to an external analytics provider in this beta. Opt-out clears the local analytics domain. Radar feedback is local-only in Version 1.7 because no trusted submission endpoint is approved; the UI does not claim that locally saved feedback was transmitted.

The Version 1.7 guest profile contains a random local ID, locale/timezone/mode, explicit interests and follows, favorites, read/dismissed/recent references, saved searches, briefing/notification preferences, recommendation feedback, and consent. It excludes prompt/document bodies, provider credentials, auth sessions, exact identity, and unrelated workspace data. Collections, retention, import size, nesting, strings, and storage bytes are bounded. Corrupt state is isolated, and checksum-protected import requires preview plus explicit merge or replace; a failed write rolls back.

Users can export or reset the guest profile and clear analytics/feedback. The anonymous ID is not an account and is not cloud-synced. Production login, cloud profiles, and cross-device synchronization are explicitly deferred. Cloud deletion requires authenticated backend support; the UI states when only a request can be recorded. See `/privacy` for the bilingual beta notice. This documentation is engineering guidance, not legal advice.

The first-visit walkthrough stores a separate bounded actor-scoped record containing only schema/tour version, status, current step, timestamps, and language. It is not included in guest export/import, does not alter the guest-profile retention policy, and records no analytics event unless the existing explicit analytics consent boundary permits it. Resetting the walkthrough affects only this record.

Version 1.9 evaluation rubrics, experiments, runs, suites, Failure Cases,
entity versions, connected previews, evidence, and sanitized trace events are
actor-scoped and browser-local. Collections, item sizes, trace length, and
retention are bounded; invalid or tampered records are quarantined. Complete
Workspace backup previews and validates these domains before a transactional
merge or replace, and immutable certified records are not silently
overwritten.

Every beta evaluation is an `Academy deterministic evaluation`; no Mission,
prompt, evidence, or private document is sent to a model provider. Connected
workflow cards are inert previews and do not write to GitHub, Jira, Confluence,
Gmail, Calendar, or another service. Availability is never inferred or faked.
Codex export validates and downloads TOML locally, excludes secrets, local
paths, unsupported permissions, and hidden runtime claims, and never installs
an Agent from the browser.

Only the Version 1.9 analytics event names documented in the release
specification are accepted after explicit consent. Raw Mission/prompt/evidence
content and sensitive metadata keys are rejected, and withdrawing consent
clears both Workspace and Mission analytics without deleting evaluations.
