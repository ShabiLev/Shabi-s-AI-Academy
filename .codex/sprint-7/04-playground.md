# Sprint 7 Playground Specification

## Purpose

Provide transparent local workbenches for learning prompt assembly and agent execution. Version 0.7.0 performs no external AI or tool execution.

## Prompt Playground

Protected route: `/playground/prompt`.

Inputs:

- optional system instruction, user prompt, and reusable prompt/prompt-pack selection
- typed variables with value validation
- output format selection/free-text contract
- provider panel showing Mock ready, Live not configured, and no key input

Actions and results:

- **Assemble Preview:** exact inert system/user sections and resolved variables; unresolved variables are errors.
- **Dry Run:** validation, approximate token estimate clearly labelled “approximate,” planned request structure, warnings, and no generated answer.
- **Mock Run:** deterministic output, status, timeline, validation, and local history entry.
- Copy assembled prompt/output and export a safe JSON/Markdown record with mode/provenance/privacy notice.
- Local drafts/history are bounded; sensitive-data warning and clear/delete controls are available.

Token estimate uses a documented deterministic heuristic (for example characters/4), not provider billing truth.

## Agent Playground

Protected route: `/playground/agent`.

- Select My Agent or a Starter Agent; Starter selection remains read-only and need not be imported to run Mock/Dry Run.
- Enter sample input and declared variables; show agent goal, provider/tool status, memory policy, approval points, and risks.
- Mock Run and Dry Run use the [runtime](01-runtime.md).
- Display ordered execution timeline, validation, attempts/retries, waiting approval with approve/reject/cancel, cancellation, logs as safe summaries, warnings, output, and related local run history.
- Conceptual tools are marked Planned / Not connected. No button may imply Jira/SQL/email/code execution.
- Switching agent/input invalidates stale preview/output after confirmation when data would be lost.

## State, persistence, and privacy

Form state remains local until explicitly saved. History uses runtime storage and limits. Do not persist secrets, provider keys, full built-in catalogs, or hidden system content. Exports label Mock/Dry Run and contain no fabricated provider/model/cost data.

## Accessibility and responsive behavior

Use labelled fields, logical headings, keyboard-operable tabs/actions, visible focus, restrained live updates, focus-managed approvals, ordered-list timeline alternative, copy status text, 44px controls, and no horizontal overflow. Long prompt/output blocks wrap or scroll within labelled regions without breaking the page. Hebrew RTL controls preserve code/text direction where content requires LTR.

## Acceptance and tests

Vitest covers assembly order, escaping/plain text, variable resolution, token heuristic, mode validation, stale-result reset, export schema/filename, history bounds, and no provider execution in Dry Run. Playwright covers create/select, preview, Mock/Dry Run, deterministic repeat, approval/retry/cancel/failure scenarios, copy/export, refresh/history/clear, Live disabled, conceptual tools, both directions, viewport matrix, keyboard, axe, visuals, and Lighthouse.

Related: [runtime](01-runtime.md), [Starter Agents](02-starter-agents.md), [Prompt Packs](03-prompt-packs.md), [security ADR](../adr/ADR-009-no-secrets-in-browser-storage.md).
