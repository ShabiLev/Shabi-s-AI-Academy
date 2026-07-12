# ADR-001: React, TypeScript, and Vite

- Status: Accepted
- Date: 2026-07-12

## Context

The existing application and quality tooling use this stack successfully.

## Decision

Continue React function components, strict TypeScript, Vite builds, and React Router.

## Alternatives considered

Replatforming; JavaScript without strict types; a full-stack framework before backend requirements exist.

## Consequences

Fast local development and mature testing with client-side limitations.

## Risks

Dependency churn and browser-only trust boundaries.

## Follow-up work

Revisit only when backend/rendering requirements have measurable unmet needs.

## Related documents

[Architecture overview](../architecture/overview.md), [security](../standards/security.md), [Sprint 7 master specification](../sprint-7/00-master-spec.md).
