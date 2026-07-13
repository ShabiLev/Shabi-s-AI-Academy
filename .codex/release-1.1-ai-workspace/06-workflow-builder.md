# Deterministic Workflow Builder

Create `/workflows`, `/workflows/new`, and `/workflows/:workflowId`. Supported nodes are Start, Prompt, Agent, Knowledge Document, Validation, Approval, Mock Run, Dry Run, Transform, Project Output, and End. Workflows are local and never execute connectors.

Users can add, remove, connect, reorder, configure, validate, duplicate, save, import/export, run Mock/Dry Run, and inspect history/timeline. List controls and Move up/down/Connect next are first-class keyboard alternatives; drag-and-drop is never required.

Validation enforces one Start, at least one End, reachability, acyclic supported graphs, valid references/routes, approval before risk, no connected write tool, and at most 50 nodes. Runs reuse Runtime semantics, pause for approvals, and store bounded summaries. Ship five bilingual starter templates.

## Acceptance

Every graph operation is available without drag and drop.
