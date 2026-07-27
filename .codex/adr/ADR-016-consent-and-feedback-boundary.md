# ADR-016: Explicit local consent and feedback boundary

- Status: Accepted
- Date: 2026-07-26

## Context

The previous workspace state enabled local analytics by default. Version 1.7
requires explicit consent and must not leak private local content through
analytics or feedback.

## Decision

Analytics consent defaults to `false`. Enabling it is an explicit user action
recorded in the guest profile and workspace adapter. Disabling consent clears
the bounded analytics event collection. Events contain only approved event
types, timestamps, coarse categories and numeric quality metadata; prompt,
document, free-text search and identity fields are rejected.

Version 1.7 feedback is stored locally in a bounded adapter and clearly labeled
`local-only`. It supports useful/not-useful, incorrect summary, missing topic,
source concern, feature request and general feedback. No network transmission
occurs until a separately reviewed same-origin endpoint, retention policy and
abuse controls are approved.

## Consequences

- No silent analytics collection occurs for new or migrated profiles.
- Local feedback is useful for an individual device but is not represented as
  submitted to the Academy.
- A future endpoint can implement a consent-gated adapter without changing UI
  domain types.

## Verification

Workspace migration tests, feedback parser tests, opt-in/opt-out E2E tests,
bundle/secret inspection and privacy review.

## Related documents

[ADR-009](ADR-009-no-secrets-in-browser-storage.md),
[Version 1.7 threat model](../../docs/version-1.7/threat-model.md).
