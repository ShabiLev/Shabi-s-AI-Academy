# Getting started with the AOS

This page is the practical "what do I do in the first minute of a session"
guide, for both a human developer and an AI agent (Codex or Claude Code)
picking up work in this repository.

## The three steps every session starts with

1. **Read the entry point.** Open [`../../.agent/master.md`](../../.agent/master.md).
   It lists the full loading sequence, the precedence order, and the stop
   conditions — read it in full before touching code, even if you think you
   already know what it says.
2. **Classify the task.** Use [`../../.agent/loaders/task-classifier.md`](../../.agent/loaders/task-classifier.md)
   to decide the task type (feature, bugfix, research, release, etc.) and
   risk level (Low/Medium/High/Critical). See [`task-classification.md`](task-classification.md)
   for the full model.
3. **Load only the mapped modules.** Look up the classified task type in
   [`../../.agent/registry.json`](../../.agent/registry.json) and load
   exactly those modules from [`../../.agent/manifest.json`](../../.agent/manifest.json).
   Never load the entire `.agent/` tree, and never hand-pick modules from
   memory or a previous task.

## Agent-specific bootstrap

Each agent family has a thin pointer file that starts the same three steps
above:

- Codex: [`../../.codex/workflows/aos.md`](../../.codex/workflows/aos.md) — see [`codex.md`](codex.md).
- Claude Code: [`../../.claude/workflows/aos.md`](../../.claude/workflows/aos.md) — see [`claude-code.md`](claude-code.md).

Both files exist only to point back into `.agent/`; they must never contain
full workflow rules themselves (see [`../../.agent/compatibility.md`](../../.agent/compatibility.md)).

## For a human developer

You do not need to run the classifier by hand to read the AOS — start at
[`overview.md`](overview.md) for the plain-language explanation, then browse
`/aos` in the running app for a visual index of modules, evidence, research,
handoffs, security, and release state. If you are extending the AOS itself
(adding a module), see [`extension-guide.md`](extension-guide.md).

## What happens after modules are loaded

Once the required modules are loaded, `master.md` §5 defines the mandatory
final workflow before any substantial task can be reported done: focused
then full tests, UI/UX validation if user-facing, a security review pass,
documentation updates, evidence capture under `quality/execution/latest/`,
self-review, and a final report. See [`evidence-system.md`](evidence-system.md)
and [`../quality-gates.md`](../quality-gates.md).

## Validating your own understanding

Run `npm run aos:check` at any time — it verifies the manifest, registry,
links, and schemas are consistent, and that no module duplicates another's
workflow content. See [`module-system.md`](module-system.md) and
[`troubleshooting.md`](troubleshooting.md) if it fails.
