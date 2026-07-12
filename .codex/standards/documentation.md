# Documentation Standard

## Purpose

Keep engineering guidance linked, current, and operational.

## Mandatory rules

Every document has a title, purpose, current/future distinction, concrete rules, related links, and owner through Git history.

## Recommended practices

Prefer concise examples, relative links, shared vocabulary, ADRs for durable decisions, and same-change updates.

## Forbidden practices

Placeholder prose, broken links, duplicated sources, marketing claims, copied large blocks, and undocumented conflicts.

## Example

Link to the controlling security standard instead of restating its complete threat model.

## Review checklist

Review hierarchy, terminology, versions, links, claims, examples, and obsolescence.

## Related validation

`npm run docs:check; git diff --check`

## Exceptions process

Document the need, risk, smallest scope, owner, expiry or removal plan, and compensating tests. Material or durable exceptions require an accepted ADR and security/QA review.

Related: [Architecture overview](../architecture/overview.md), [QA handbook](qa.md), [Sprint 7](../sprint-7/00-master-spec.md).
