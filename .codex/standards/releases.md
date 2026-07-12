# Release Standard

## Purpose

Turn validated scope into an honest, reproducible release.

## Mandatory rules

Meet Sprint DoD, update required docs/version, run validate:release, complete or disclose manual checks, create the specified commit, and stop before push.

## Recommended practices

Record exact results, limitations, artifacts, commit SHA, and push command.

## Forbidden practices

Skipping gates, auto-approving visuals, claiming Ready with manual checks incomplete, amending published commits, or pushing without authority.

## Example

Report readyWithWarnings when only the manual checklist is notRun.

## Review checklist

Review scope, versions, gates, docs, artifacts, security, commit, and clean tree.

## Related validation

`npm run validate:release; git diff --check`

## Exceptions process

Document the need, risk, smallest scope, owner, expiry or removal plan, and compensating tests. Material or durable exceptions require an accepted ADR and security/QA review.

Related: [Architecture overview](../architecture/overview.md), [QA handbook](qa.md), [Sprint 7](../sprint-7/00-master-spec.md).
