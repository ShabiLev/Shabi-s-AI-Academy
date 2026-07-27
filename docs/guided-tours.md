# Guided tours

The internal tour system covers Dashboard, Lessons, Prompt Library, Agent Library, both Playgrounds, Projects, Knowledge Base, Workflows, and QA Center. Tours are optional, bilingual, skippable, and restartable from Help.

Version 1.7.0-beta.2 adds an eight-step first-visit walkthrough after optional onboarding completes. It starts only on the Dashboard after language, guest profile, router, and onboarding state are available. The welcome step offers Start tour and Not now; completion or dismissal suppresses later automatic starts. Help and Settings expose current status and restart, while Settings can reset only the walkthrough state.

The first-visit record uses `shabis-ai-academy:walkthrough:v1:<actorId>`. A future authenticated user ID takes priority; otherwise the local guest-profile ID is used. The bounded schema stores only tour/version/status, step, timestamps, and language. It contains no prompt content, authentication session, or precise identity. Malformed or oversized state resets safely. Guest export/import intentionally excludes walkthrough state so one actor's completion cannot leak to another.

The modal overlay provides progress, Previous, Next, Finish, Escape, focus trap/restoration, background inertness, scroll restoration, an `aria-live` progress announcement, reduced-motion handling, and responsive spotlight targets. Stable `data-walkthrough` attributes resolve desktop and mobile navigation without changing layout. A missing target is skipped with a sanitized diagnostic rather than blocking the tour.

Existing page tours preserve the `startTour(id)` contract. Starting one navigates to its registered route; it never changes user work or blocks the underlying feature after closing.
