# ADR-009: No Secrets in Browser Storage

- Status: Accepted
- Date: 2026-07-12

## Context

Browser storage, bundles, logs, exports, and screenshots are observable and unsuitable for provider credentials.

## Decision

Never collect or store API keys in localStorage/sessionStorage/IndexedDB; live credentials require a future secure server boundary.

## Alternatives considered

Obfuscated browser keys; user-entered localStorage keys; bundled environment secrets.

## Consequences

Prevents a common credential leak; Live Run remains unavailable for now.

## Risks

Users cannot configure live providers entirely client-side.

## Follow-up work

Design server-side secret lifecycle, consent, rotation, and audit before Live.

## Related documents

[Architecture overview](../architecture/overview.md), [security](../standards/security.md), [Sprint 7 master specification](../sprint-7/00-master-spec.md).
