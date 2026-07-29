# Product requirements

## Core journey

The learner describes a goal, reviews the system interpretation and acceptance
criteria, selects or edits a recommended team, approves a sequential plan,
executes Explain/Simulate/Dry Run, observes handoffs and gates, then receives
evidence and a learning summary. The journey supports empty, invalid, approval,
running, paused, drifted, needs-input, blocked, failed and completed states.

## Mandatory capabilities

- Team Builder with agent roles, inputs, outputs, permissions, gates and presets.
- Conductor that interprets, plans, coordinates sequential handoffs and explains
  every selection without self-approval.
- Mission workspace with Plan, Team, Evidence and learning views.
- Guidance modes: Teach, Guided, Expert and Audit only.
- Skill Map with evidence-derived progress and gap recommendations.
- Five built-in team presets and 12 curated community templates.
- Safe execution levels: Explain, Simulate, Dry Run, Local Execute and Connected
  Execute. Only the first three are operational in 1.8.
- Reusable Context Packs made of bounded local references and notes.
- Dashboard priorities: Continue mission, Start mission with team, Learn skill.
- Contextual Help Center coverage and preserved WALK ME behavior.

## Non-functional requirements

Local-first, deterministic, responsive from 320px to 1920px, Hebrew RTL and
English LTR, WCAG 2.2 AA automation, no secret storage, no untrusted execution,
bounded collections, safe corruption recovery and explainable PASS/FAIL gates.
