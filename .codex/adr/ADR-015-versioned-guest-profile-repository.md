# ADR-015: Versioned local guest profile repository

- Status: Accepted
- Date: 2026-07-26

## Context

Radar favorites, onboarding, experience, recent activity and consent previously
used separate storage shapes. The public beta needs anonymous personalization
without turning a local identifier into authentication or binding UI
components to a future database.

## Decision

User-owned Version 1.7 Radar state is stored through a
`GuestProfileRepository`. The versioned profile has a random
`anonymousProfileId`, locale/timezone/experience preferences, followed topics,
sources and keywords, stable Radar references, saved searches, recent views,
feedback and consent. Every collection and string is bounded.

Radar content is not copied into the profile. References contain only stable
IDs, checksums and timestamps. Corrupt profiles are isolated, replaced with a
safe default and never silently interpreted. Export uses a checksum-protected,
size-limited envelope. Import requires preview and an explicit merge or replace
strategy; replace preserves the current device's local identity and write
failure triggers rollback.

The repository is an adapter boundary. A future authenticated adapter may map a
local profile ID to an account ID, but Version 1.7 neither transmits the profile
nor implements cloud synchronization.

## Consequences

- Guest personalization is deterministic and remains available offline.
- Clearing browser storage can remove the profile; export is the recovery
  bridge.
- Future account migration can use deterministic domain keys without rewriting
  the Radar UI.

## Verification

`npm run test:guest-profile`, import-attack tests, E2E persistence/reset/import
flows, storage audit and retention verification.

## Related documents

[ADR-003](ADR-003-local-first-storage.md),
[ADR-012](ADR-012-hybrid-data-providers.md),
[future authentication migration](../../docs/version-1.7/migration-to-auth.md).
