# AOS overview

The Agent Operating System (AOS) is a set of small instruction files under
[`.agent/`](../../.agent/) that tells an AI coding agent (OpenAI Codex or
Claude Code) how to work in this repository: what to read first, how to
classify a task, which modules apply, what evidence to produce, and when to
stop and ask instead of guessing. It is documentation and validation
tooling, not a running service — nothing in `.agent/` executes on its own.

This page is for any engineer reading this repo's `docs/` folder, not only
for AI agents. If you have ever wondered "why did the agent just read five
files before touching any code?" or "where is the single place that says
what tests a feature needs?" — this is that place.

## Why it exists

Before AOS, agent behavior was defined by a mix of `AGENTS.md`, `.codex/`
release specs and standards, and whatever instructions happened to be given
in a conversation. That worked, but rules were duplicated across files and
there was no single place to check "what applies to this task" or "what
evidence is required before an agent can say it's done." AOS does not
replace `AGENTS.md` or `.codex/` — it sits alongside them as the
orchestration layer that decides *when* and *in what order* they get read.
See [`../../.agent/README.md`](../../.agent/README.md) for the full
rationale.

## What it actually contains

- A single entry point, [`master.md`](../../.agent/master.md), that defines
  the loading order and non-negotiable rules.
- A machine-readable catalog of every instruction module
  ([`manifest.json`](../../.agent/manifest.json)).
- A lookup table mapping task types to the modules required for that task
  ([`registry.json`](../../.agent/registry.json)).
- Subject-area modules for workflow, security, Git, release, research,
  quality/evidence, memory, and cross-agent handoffs.
- Validation scripts (`npm run aos:check`) that keep all of the above
  internally consistent.
- An in-app dashboard at `/aos` for browsing modules, evidence, research,
  handoffs, security policy, and release state without opening the raw
  files.

## What it is not

- Not an autonomous agent, not a scheduler, not a background service.
- Not a replacement for `.codex/` standards or release specs — those remain
  authoritative for architecture and coding conventions.
- Not a place to store secrets, credentials, or fabricated test results —
  see [`security.md`](security.md) and [`evidence-system.md`](evidence-system.md).

## Where to go next

- New to the AOS as a developer or agent: [`getting-started.md`](getting-started.md).
- Want the directory layout and how pieces fit together: [`architecture.md`](architecture.md).
- Curious how a task gets classified and which modules load: [`task-classification.md`](task-classification.md).
- Want to browse it visually instead of reading Markdown: open `/aos` in the
  running app.
