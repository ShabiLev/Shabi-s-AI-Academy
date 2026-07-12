# Git Standard

## Purpose

Keep history reviewable and user work safe.

## Mandatory rules

Inspect status before edits; preserve unrelated changes; stage intentionally; use one clean Conventional Commit per release; stop before push.

## Recommended practices

Use non-interactive commands, diff checks, scoped commit bodies, and verify log/status after commit.

## Forbidden practices

reset --hard, forced push, published-history rewrite, credential changes, blind git add with unknown files, or automatic push.

## Example

docs(engineering): complete Engineering Kit and Sprint 7 specs.

## Review checklist

Review staged names/stat/content, secrets, generated artifacts, message, branch, and remote.

## Related validation

`git status; git diff --check; git diff --cached --stat`

## Exceptions process

Document the need, risk, smallest scope, owner, expiry or removal plan, and compensating tests. Material or durable exceptions require an accepted ADR and security/QA review.

Related: [Architecture overview](../architecture/overview.md), [QA handbook](qa.md), [Sprint 7](../sprint-7/00-master-spec.md).
