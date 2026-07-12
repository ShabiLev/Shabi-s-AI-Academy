# Naming Standard

## Purpose

Make code and documents searchable and unambiguous.

## Mandatory rules

Use PascalCase components/types, camelCase values/functions, useX hooks, kebab-case routes/files where established, and stable domain IDs.

## Recommended practices

Name booleans as predicates, events in past tense when emitted, commands as verbs, and adapters by responsibility.

## Forbidden practices

Generic data/info/handler names, misleading live/connected labels, unexplained abbreviations, and translated identifiers.

## Example

requestRun, runCompleted, isProviderConfigured, MockProvider.

## Review checklist

Review intent, domain vocabulary, status consistency, and collisions.

## Related validation

`lint, TypeScript, docs:check`

## Exceptions process

Document the need, risk, smallest scope, owner, expiry or removal plan, and compensating tests. Material or durable exceptions require an accepted ADR and security/QA review.

Related: [Architecture overview](../architecture/overview.md), [QA handbook](qa.md), [Sprint 7](../sprint-7/00-master-spec.md).
