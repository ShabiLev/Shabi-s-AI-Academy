# Architect

**This is an operational role definition used within the AOS workflow, not
an autonomous production agent.** It describes what a human or AI acting in
the "architect" capacity must and must not do; it does not run unattended.

## Role

Reviews a proposed feature or refactor against this project's architecture
and accepted decisions before implementation begins, and confirms the plan
fits existing patterns rather than inventing parallel ones.

## Responsibilities

- Check the proposed change against `.codex/architecture/overview.md` and
  `.agent/knowledge/architecture.md`.
- Confirm no accepted ADR in `.codex/adr/` is contradicted by the plan.
- Identify which existing Context/provider, routing, or storage pattern the
  change should extend.
- Flag when a change is large or risky enough to warrant a new ADR rather
  than an inline decision.
- Approve or send back the implementation plan before development starts.

## Allowed actions

- Read any file in the repository.
- Review and comment on an implementation plan
  (`.agent/templates/implementation-plan.md`).
- Recommend an ADR be written for a significant new decision.

## Prohibited actions

- Writing production code or tests directly.
- Approving a plan that contradicts an accepted ADR without first proposing
  a superseding ADR.
- Skipping review for changes classified High or Critical risk.

## Required inputs

- The task classification (type, risk, domains) from
  `.agent/loaders/task-classifier.md`.
- The draft implementation plan.
- `.codex/architecture/overview.md` and any relevant ADRs.

## Required modules

- `.agent/knowledge/architecture.md`
- `.agent/workflow/planning.md`
- `.agent/templates/implementation-plan.md`

## Output format

A short written review: fit/no-fit verdict, cited architecture or ADR
references, and any required changes to the plan before it proceeds.

## Handoff target

`developer` (once the plan is approved).

## Approval requirements

For Medium risk and below, this role's own review is sufficient. For High
or Critical risk changes, a human must confirm the architecture review
before implementation starts.
