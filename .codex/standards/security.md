# Security Standard

## Purpose

Protect users and preserve honest trust boundaries.

## Mandatory rules

Treat external/stored/provider content as untrusted; validate inputs; render text safely; apply least privilege; require approval for risky actions; keep secrets server-side in future.

## Recommended practices

Use allowlists, bounded data, safe filenames, redacted logs, dependency review, and threat models for integrations.

## Forbidden practices

Secrets in source/localStorage, eval/Function, unsafe HTML, UI provider calls, automatic commands, silent external writes, or fake security claims.

## Example

Display imported prompt text in pre/textContent and preserve attribution.

## Review checklist

Review data sources, sinks, permissions, storage, exports, logs, links, approvals, and failure behavior.

## Related validation

`secret scan, lint/build, negative tests, npm audit when dependency scope warrants`

## Exceptions process

Document the need, risk, smallest scope, owner, expiry or removal plan, and compensating tests. Material or durable exceptions require an accepted ADR and security/QA review.

Related: [Architecture overview](../architecture/overview.md), [QA handbook](qa.md), [Sprint 7](../sprint-7/00-master-spec.md).
