# Local Assistant and Safe Actions

Create `/assistant` backed by deterministic intent classification, local entity search, route context, the command registry, and a safe Action Router. Supported intents are find prompt/agent/lesson, open route, create prompt/agent/project, explain screen, show activity/project contents, start Mock/Dry Run, open QA, export, and help.

Responses are informational, search results, command/action suggestions, confirmation requests, navigation, previews, warnings, or honest unsupported notices. The assistant never simulates freeform model prose. Actions declare ID, type, bilingual copy, risk, confirmation, context, parameters, validation, result, and undo capability. Medium risk requires explicit confirmation; high risk remains unsupported; Runtime approvals cannot be bypassed; no external tool executes. Histories are local, validated, content-bounded, and independently clearable.

## Acceptance

Unsupported requests receive the prescribed honest bilingual response.
