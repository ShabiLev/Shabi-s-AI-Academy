# TypeScript Standard

## Purpose

Use the type system to protect domain and integration boundaries.

## Mandatory rules

Keep strict mode; use unknown at trust boundaries; narrow before access; model states with discriminated unions; exhaustively handle variants.

## Recommended practices

Prefer readonly data, branded/stable IDs where valuable, type-only imports, and explicit domain result types.

## Forbidden practices

Avoidable any, unsafe assertions, non-null assertions without invariant proof, boolean state explosions, and duplicated interface shapes.

## Example

Use { status: 'failed'; error: RunError } rather than parallel failed/error flags.

## Review checklist

Review narrowing, exhaustiveness, nullability, public types, mutation, and serialization compatibility.

## Related validation

`tsc through npm run build; ESLint; Vitest`

## Exceptions process

Document the need, risk, smallest scope, owner, expiry or removal plan, and compensating tests. Material or durable exceptions require an accepted ADR and security/QA review.

Related: [Architecture overview](../architecture/overview.md), [QA handbook](qa.md), [Sprint 7](../sprint-7/00-master-spec.md).
