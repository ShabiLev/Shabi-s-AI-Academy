# Security Architecture

## Purpose

Establish trust boundaries for local data, external catalogs, runtime inputs, and future providers.

## Current state

The browser is an untrusted client with local-only demo data. External prompts, imports, stored JSON, route parameters, and future provider output are untrusted.

## Decision and constraints

Render text safely, validate at boundaries, apply least privilege, require human approval for risky conceptual actions, and reserve live execution for a future secure server architecture.

## Dependency boundaries

UI depends on provider/tool interfaces; secrets and credentialed calls belong behind a future server boundary. Tool definitions declare risk and approval policy.

## Anti-patterns

eval, Function, HTML execution, secrets in browser storage, UI-to-provider calls, automatic commands, fabricated authorization, or logging sensitive input.

## Testing impact

Test malformed data, injection strings as plain text, disabled live controls, approval gates, export filenames, and secret-pattern scans.

## Future evolution

Live integrations require threat modeling, server-side secret management, audit logging, consent, retention, and new ADRs.

## Related documents

[Security standard](../standards/security.md), [ADR-009](../adr/ADR-009-no-secrets-in-browser-storage.md), [ADR-010](../adr/ADR-010-human-approval-for-risky-actions.md), [runtime spec](../sprint-7/01-runtime.md).
