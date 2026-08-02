# Version 2.0 outcome matrix

## Shared contract

Every persisted Outcome contains identity, intent, lifecycle status, reality
mode, ownership, source, optional project, result location/type, usage
instructions, next actions, limitations, deliverables, evidence references,
verification state, entity version and schema version. Unknown forward-compatible
fields are preserved by migration and import.

Completion and verification are different: `Completed` means the declared work
ended; `Verified` requires referenced evidence. `Simulated` is never equivalent
to live execution. `Blocked` requires a documented blocker. Archiving preserves
references; destructive deletion is rejected while protected references exist.

| Source module | Result type | Default reality | Completion evidence | Required next actions |
| --- | --- | --- | --- | --- |
| Prompt Builder | Prompt Result | Local | persisted prompt deliverable | copy, export, project, mission, context |
| Agent Builder | Agent Blueprint | Blueprint only | persisted blueprint deliverable | export, project, team, mission |
| Team | Team Specification | Blueprint only | persisted specification deliverable | export, project, mission, manual guide |
| Mission | Mission Outcome | Local or Simulated | deliverable, evidence, explicit simulation acknowledgement, or blocker | project, evidence, next mission |
| Project | Project Outcome | Local | linked outcomes/evidence and blocker state | verify, export, next action |
| Workflow | Run Report | Simulated or Manual action required | immutable run report | project, evidence, next workflow step |
| Knowledge | Context Result | Local | persisted context link | project, prompt, blueprint, team, mission, workflow |
| Lesson | Learning Result | Local | activity/evidence submission, not page visit | practice, mission, evidence |

## Shared result experience

All result surfaces expose: summary, created items, reality label, storage
location, copy/export/download where meaningful, Add to Project, Link Knowledge
as Context, Create Mission, Create next Workflow step, usage instructions,
verification, evidence, limitations, next action, back navigation and history.
Unavailable actions are disabled with an honest explanation; they are not fake
success paths.

## Project progress

Project progress is derived from non-archived linked outcomes: verified outcomes
carry the highest weight; completed local outcomes carry partial weight;
simulated or evidence-needed outcomes carry limited weight; blocked outcomes
reduce readiness. Empty projects report zero progress. Item count alone never
represents progress.
