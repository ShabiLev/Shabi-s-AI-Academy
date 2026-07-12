# Versioning Standard

## Purpose

Separate application, Engineering Kit, data, and schema versions.

## Mandatory rules

Use SemVer. Product behavior releases update package/app metadata; documentation-only Kit work updates .codex/VERSION and leaves package version unchanged.

## Recommended practices

Declare baseline and target in Sprint specs; version persisted schemas independently; document migrations.

## Forbidden practices

Unrequested bumps, reusing a released version, overwriting checklist history, or equating Kit and application versions.

## Example

Kit 1.0.0 can document app 0.6.1 and target app 0.7.0.

## Review checklist

Review every visible/generated version and CHANGELOG only when application behavior changes.

## Related validation

`docs:check, package/lock comparison, build metadata tests`

## Exceptions process

Document the need, risk, smallest scope, owner, expiry or removal plan, and compensating tests. Material or durable exceptions require an accepted ADR and security/QA review.

Related: [Architecture overview](../architecture/overview.md), [QA handbook](qa.md), [Sprint 7](../sprint-7/00-master-spec.md).
