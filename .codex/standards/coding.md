# Coding Standard

## Purpose

Keep changes readable, scoped, and maintainable.

## Mandatory rules

Keep TypeScript strict; isolate domain logic in pure functions; reuse focused components; preserve user-authored work; update tests and docs with behavior.

## Recommended practices

Prefer small public APIs, early validation, explicit return types at boundaries, and comments that explain decisions.

## Forbidden practices

Avoidable any, duplicated domain rules, business logic in JSX, speculative abstractions, unrelated refactors, and silent error swallowing.

## Example

A page calls a typed domain function and renders its result; it does not parse storage inline.

## Review checklist

Check scope, boundaries, error paths, translations, tests, docs, and clean diff.

## Related validation

`npm run lint && npm run test:run && npm run build`

## Exceptions process

Document the need, risk, smallest scope, owner, expiry or removal plan, and compensating tests. Material or durable exceptions require an accepted ADR and security/QA review.

Related: [Architecture overview](../architecture/overview.md), [QA handbook](qa.md), [Sprint 7](../sprint-7/00-master-spec.md).
