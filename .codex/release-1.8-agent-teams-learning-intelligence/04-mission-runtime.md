# Mission runtime

## State model

Statuses: `draft`, `awaiting-plan-approval`, `ready`, `running`, `paused`,
`needs-input`, `needs-work`, `completed`, `cancelled`, `blocked`.

Actions: create, edit, approve plan, start, pause, continue, provide input,
retry, replace/add agent, cancel, export, create project and save preset.
Invalid transitions return explicit evidence and never mutate stored state.

## Deterministic phases

Interpretation -> acceptance criteria -> team recommendation -> plan approval ->
sequential implementation/review phases -> evidence -> learning summary.
Each phase records owner, required permission, input/output summary, gate,
status and timestamps. Output is deterministic simulation text, never provider
output.

Pause records the current phase, transition counter and state fingerprint.
Continue compares the stored fingerprint with the current mission. Drift moves
the mission to `needs-input` and requires an explicit resolution; it never
overwrites newer state.

No agent approves its own phase. `local-execute` and `connected-execute` remain
availability-labelled and disabled; connected work always requires a fresh,
contextual human approval in a future secure boundary.
