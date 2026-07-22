# How To guide

Version 1.3.0-beta.1 adds task-oriented Help, Page Introductions, breadcrumbs, Glossary definitions, and restartable Guided Tours to the complete learning platform and AI Workspace. Mock output is simulated, Dry Run is a preview, and no real tool is executed. Account and cloud states are identified separately from local work.

New visitors can start at `/`, continue as Guest, and complete `/onboarding`. Help is at `/help`; use its product-area and experience filters or open “Help for this screen” from a primary route. Account setup is optional; see the authentication and migration guides before enabling cloud data.

Open AI Radar from the Workspace navigation or Dashboard. Search across publisher, title, summary, and practical implication; combine topic and horizon filters; use Clear filters to return to the complete snapshot. Publication is the publisher's date, while Verified is the Academy's last link and copy review. Radar is a bundled editorial snapshot rather than a live feed; follow the official-source link before relying on time-sensitive information. See [AI Radar](ai-radar.md).

The profile trigger opens a keyboard-operated menu. On desktop it is anchored to the logical start edge of the trigger; on mobile it opens as a full-width sheet. Arrow keys, Home, and End move through menu items. Escape, Tab, or activation outside closes it and returns focus to the trigger.

Use Ctrl/Cmd+Shift+F for Workspace Search, Ctrl/Cmd+K for commands, and `?` for shortcut help. Assistant recommendations are derived from the current route and local records. Any mutating Assistant action or medium-risk command shows a preview or confirmation before it changes local data.

For GitHub Pages, open `https://shabilev.github.io/Shabi-s-AI-Academy/#/login`; navigation stays after `#` so refreshes work on static hosting. Contributors can run `npm run build:pages`, `npm run preview:pages`, and `npm run test:e2e:pages`. Local development at `http://localhost:5173/` and Vercel continue to use normal BrowserRouter URLs without hashes. Deployment setup, Actions inspection, rollback, and disabling instructions are in `docs/github-pages-deployment.md`.

Contributors and AI coding agents (Codex, Claude Code) working in this repository are governed by the Agent Operating System (AOS) at `.agent/`, entered via `.agent/master.md`. It classifies each task, resolves which instruction modules apply, and defines the evidence, Git, and handoff behavior an agent must follow. See [AOS overview](aos/overview.md) for a plain-language introduction, or open the in-app AOS dashboard at `/aos` and the AOS Core explorer at `/aos/core` to inspect registered capabilities, scheduler definitions, and bounded event diagnostics.
