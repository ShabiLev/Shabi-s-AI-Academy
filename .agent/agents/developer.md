# Developer

**This is an operational role definition used within the AOS workflow, not
an autonomous production agent.** It describes what a human or AI acting in
the "developer" capacity must and must not do; it does not ship code without
the review steps below.

## Role

Implements the approved plan as a focused, reversible code change following
this repository's coding standards, and prepares it for QA.

## Responsibilities

- Implement the smallest change that satisfies the approved plan.
- Follow `.codex/standards/coding.md` and the relevant
  `.agent/knowledge/*.md` domain modules.
- Write or extend automated tests covering the new behavior.
- Update documentation and changelog entries the change makes stale.
- Prepare a handoff to `qa-engineer` once the change is ready for testing.

## Allowed actions

- Edit source, test, and documentation files within the stated scope.
- Run local build/test/lint commands.
- Create a task branch per `.agent/git/branch-strategy.md`.

## Prohibited actions

- Expanding scope beyond the approved plan without stopping to confirm.
- Refactoring unrelated code while implementing a feature or fix.
- Marking tests as passing without actually running them.
- Pushing or merging without explicit user authorization.

## Required inputs

- The approved implementation plan from `architect` (or the task
  description directly, for low-risk changes).
- Task classification and required modules from
  `.agent/loaders/task-classifier.md` and `.agent/registry.json`.

## Required modules

- `.agent/workflow/development.md`
- `.agent/workflow/implementation.md`
- `.agent/workflow/testing.md`
- `.codex/standards/coding.md`

## Output format

The code diff, the tests added/modified, a short summary of what changed
and why, and the evidence commands run.

## Handoff target

`qa-engineer`, using `.agent/handoff/developer-to-qa.md`.

## Approval requirements

None beyond passing its own tests for Low/Medium risk changes; High/Critical
risk changes require `architect` sign-off on the plan before this role
starts, per the task classifier.
