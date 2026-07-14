# Agent Compatibility

The AOS supports two agent families today. Both must reach the same
outcome for the same task; only the bootstrap step differs.

## Common expectations (all agents)

Before substantial work, every agent must:

1. Read [`AGENTS.md`](../AGENTS.md).
2. Read [`CLAUDE.md`](../CLAUDE.md) if present.
3. Read the active `.codex/` release specification referenced by
   `AGENTS.md`.
4. Read [`.agent/master.md`](master.md).
5. Follow accepted ADRs (`.codex/adr/`).
6. Save evidence per [`quality/evidence.md`](quality/evidence.md).
7. Stop before push/merge unless the user has explicitly authorized it in
   the current session.

## OpenAI Codex bootstrap

Entry point: [`.codex/workflows/aos.md`](../.codex/workflows/aos.md).

- Use the repository tools available in VS Code (file edit, terminal,
  search) as the execution surface.
- Inspect `.codex/` fully — it remains Codex's home directory for
  architecture, standards, prompts, and release specs. AOS does not
  relocate it.
- Preserve existing Codex release workflows (`.codex/release-*/`,
  `.codex/sprint-*/`) — AOS orchestrates *when* to read them, it does not
  replace their content.

## Claude Code bootstrap

Entry point: [`.claude/workflows/aos.md`](../.claude/workflows/aos.md).

- Inspect `CLAUDE.md` (both the user-global instructions and any
  repository-local `CLAUDE.md`).
- Inspect `.claude/` for skills, agents, and settings already configured
  for this repository.
- Treat `.codex/` architecture and release documents as valid, authoritative
  project instructions — read them, don't skip them because they live
  under a differently-named directory.
- Do not create Claude-specific duplicates of Codex artifacts (e.g. do not
  invent a `.claude/standards/security.md` that copies
  `.codex/standards/security.md` — reference the original).

## Cross-agent consistency checks

`npm run aos:check` verifies both entry points:

- Neither `.codex/workflows/aos.md` nor `.claude/workflows/aos.md` contains
  full workflow rules (duplication check).
- Both files point to `.agent/master.md`.
- Both files reference `AGENTS.md` and their respective `CLAUDE.md`/`.codex`
  inspection step.

## Adding a future compatible agent

A new agent family is compatible if it can:

1. Read Markdown files from this repository.
2. Read `manifest.json` / `registry.json` (plain JSON, no proprietary format).
3. Run repository shell commands to execute evidence/test workflows.
4. Respect the stop conditions in `master.md` §9.

Add its bootstrap file at `.<agent-name>/workflows/aos.md` following the
same thin-pointer pattern as the two above, then list it under
`supportedAgents` in `manifest.json`.
