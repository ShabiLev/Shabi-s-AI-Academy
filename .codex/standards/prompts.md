# Prompt Engineering Standard

## Purpose

Author prompts that are clear, testable, editable, and safe as data.

## Mandatory rules

State task, context, constraints, inputs, output, uncertainty, and verification. Preserve provenance for external data.

## Recommended practices

Use variables with descriptions, examples when ambiguity warrants, and explicit “do not invent” boundaries.

## Forbidden practices

Hidden instructions, credential requests, safety bypasses, unsupported guarantees, prompt execution during import, and broken placeholders.

## Example

“Cite supplied issue keys; mark missing evidence” is preferable to “analyze everything.”

## Review checklist

Review goal, inputs, missing-data behavior, format, safety, attribution, length, and bilingual metadata.

## Related validation

`catalog:check, prompt unit tests, plain-text rendering E2E`

## Exceptions process

Document the need, risk, smallest scope, owner, expiry or removal plan, and compensating tests. Material or durable exceptions require an accepted ADR and security/QA review.

Related: [Architecture overview](../architecture/overview.md), [QA handbook](qa.md), [Sprint 7](../sprint-7/00-master-spec.md).
