# Agent Engineering Standard

## Purpose

Specify agents as inspectable plans rather than anthropomorphic promises.

## Mandatory rules

Define role, goal, inputs, instructions, tools as planned capabilities, memory, validation, retries, approvals, output, completion, and risks.

## Recommended practices

Use deterministic Mock/Dry Run first, bounded memory, structured events, and explicit stop conditions.

## Forbidden practices

Claims tools are connected, unconstrained autonomy, hidden side effects, infinite retries, implicit approvals, and fabricated live results.

## Example

A Jira agent may propose an update in 0.7.0 but cannot perform it.

## Review checklist

Review permissions, state transitions, tool status, approval, retry/cancel, data retention, and honest labels.

## Related validation

`runtime unit tests, provider contracts, Playwright timelines, security review`

## Exceptions process

Document the need, risk, smallest scope, owner, expiry or removal plan, and compensating tests. Material or durable exceptions require an accepted ADR and security/QA review.

Related: [Architecture overview](../architecture/overview.md), [QA handbook](qa.md), [Sprint 7](../sprint-7/00-master-spec.md).
