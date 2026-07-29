# Version 1.8 Agent Teams and Missions

Version 1.8 adds a local-first, explainable Mission workflow. The user supplies
a goal, reviews the interpretation and acceptance criteria, selects a team,
approves a plan, and follows sequential handoffs and evidence. It is not an
unrestricted autonomous execution system.

## Routes and workflow

- `/missions` lists actor-scoped missions and safe recovery status.
- `/missions/new` interprets a goal and configures the team, guidance mode and
  execution level.
- `/missions/:missionId` exposes the active phase, team, gates, Pause/Continue,
  evidence and Context Packs.
- `/team`, `/plan` and `/evidence` project the selected catalog, current plan
  and current evidence.

The Conductor plans and coordinates but cannot approve its own work. Every
implementation phase requires an independent validator. Built-in presets are
immutable; copying creates a user-owned team.

## Execution and guidance

Explain, Simulate and Dry Run are deterministic local learning modes. Local
Execute and Connected Execute are displayed so the permission model is
understandable but remain disabled. No API keys are accepted and no provider,
command, message or external write is invoked.

Teach, Guided, Expert and Audit-only modes change explanation depth, never
permissions or safety.

## Community attribution

Twelve templates were manually adapted as inert catalog metadata from
[`msitarzewski/agency-agents`](https://github.com/msitarzewski/agency-agents/tree/8ef49232e02431f7ca4792b487e5a85a7939ff3a)
at revision `8ef49232e02431f7ca4792b487e5a85a7939ff3a`, MIT licensed. Runtime
network import, source scripts and unsupported autonomy/tool claims are excluded.

