# Prompt and Agent Playgrounds Specification

## Prompt Playground
Route `/playground/prompts`. Include system instruction, user prompt, variables, context, constraints, output format, examples, provider status, Mock, Dry Run, assembled prompt, approximate token estimate, warnings, output, history, copy, export and save.

Rules: no silent overwrite, Mock labelled simulated, Dry Run labelled preview, Live disabled by default, bounded local history.

## Agent Playground
Route `/playground/agents`. Select My Agent or Starter Agent, sample input, scenario, mode, planned tools, approvals, retries, cancellation, timeline, warnings, output, logs, history, import and save-to-project.

## Architecture
Use the existing Runtime Engine. Do not duplicate state-machine logic in components.

## UX
Desktop split view and inspector; mobile stacked panels. No fixed heights that hide content.

## Accessibility
Labelled editors, accessible tabs, status announcements, approval focus management and screen-reader-readable output/timeline.

## Tests
Prompt variable replacement, assembled prompt, Mock, Dry Run, history, save and unsaved confirmation. Agent selection, Mock success, approval, retry, cancel, Dry Run, history, project save, no network and Live disabled.

## Docs
Create `docs/prompt-playground.md`, `docs/agent-playground.md`, `docs/playground-history.md`.
