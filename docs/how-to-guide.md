# How To guide

Version 1.1.0-beta.1 provides searchable bilingual help for the complete learning platform and AI Workspace: Global Search, Command Palette, Local Assistant, advanced builders, workflows, notifications, analytics, storage, and backup alongside the existing catalogs, Playgrounds, Projects, Knowledge Base, and Runtime. Mock output is simulated, Dry Run is a preview, no data is sent externally, and no real tool is executed.

Use Ctrl/Cmd+Shift+F for Workspace Search, Ctrl/Cmd+K for commands, and `?` for shortcut help. Assistant recommendations are derived from the current route and local records. Any mutating Assistant action or medium-risk command shows a preview or confirmation before it changes local data.

For GitHub Pages, open `https://shabilev.github.io/Shabi-s-AI-Academy/#/login`; navigation stays after `#` so refreshes work on static hosting. Contributors can run `npm run build:pages`, `npm run preview:pages`, and `npm run test:e2e:pages`. Local development at `http://localhost:5173/` and Vercel continue to use normal BrowserRouter URLs without hashes. Deployment setup, Actions inspection, rollback, and disabling instructions are in `docs/github-pages-deployment.md`.
