# Version 1.7 migration to future authentication

This document defines compatibility for a possible Version 1.8 account
migration. It does not authorize or implement authentication, cloud storage, or
cross-device sync in Version 1.7.

## Current-state assessment

The repository already contains optional Supabase authentication, local/
Supabase/hybrid data-provider foundations, and RLS migrations. Guest access is
currently represented by a constant `guest-user` plus `sessionStorage` flags.
Profile, onboarding, experience, Radar, and workspace data use separate storage
models, and the existing full workspace backup does not include all of them.

New Version 1.7 domains must not deepen this coupling. In particular:

- `anonymousProfileId` is not `AcademyUser.id`;
- no Radar component receives an auth session;
- no guest-owned record uses an email or cloud account ID as its primary key;
- server-generated Radar content is never stored as user-owned cloud data;
- existing Supabase auth flows are not expanded as part of this release.

## Target boundaries

```ts
interface GuestProfileRepository {
  load(): Promise<GuestProfileLoadResult>;
  save(profile: GuestProfile): Promise<GuestProfileSaveResult>;
  export(): Promise<GuestProfileExport>;
  previewImport(raw: string): Promise<GuestProfileImportPreview>;
  applyImport(
    preview: GuestProfileImportPreview,
    strategy: "merge" | "replace",
  ): Promise<GuestProfileImportResult>;
  reset(): Promise<void>;
}
```

The UI depends on this interface or smaller domain repositories, not on
`localStorage`, Supabase, or authentication. A future cloud adapter may
implement the same domain contract only after a separate accepted ADR, RLS,
privacy review, migration UX, and conflict tests.

## Guest profile identity

- Generate `anonymousProfileId` locally with `crypto.randomUUID()`.
- Treat it as an opaque random identifier with no embedded device, date, email,
  locale, or behavior.
- Never use it as proof of identity or authorization.
- Never transmit it unless analytics consent explicitly covers the field.
- Reset creates a new ID only after explicit confirmation; normal schema
  migration preserves it.
- Import defaults to preserving the receiving device ID. Importing another
  profile ID is displayed in preview and requires an explicit replace choice.

## Domain separation

| Domain | Version 1.7 owner | Future cloud migration |
| --- | --- | --- |
| Published Radar records, source health, corrections | Academy publication pipeline | Remain server/public records; no per-user copy |
| Topics/sources/keywords followed | Guest profile | User-owned rows keyed by account plus stable follow key |
| Favorites/read/dismissed/recent views | Guest profile references | User-owned rows keyed by account plus canonical record ID |
| Saved searches | Guest profile | User-owned rows with deterministic local record ID |
| Briefing/notification preferences | Guest profile | User-owned preference record |
| Recommendation feedback | Guest profile | User-owned bounded feedback record |
| Consent preferences | Guest profile plus policy version | User-controlled consent ledger; never inferred |
| Feedback submissions | Explicit endpoint payload | Separate submitted record; not a profile dump |
| Analytics | Consent-gated event schema | Separate minimal event store; not used for authentication |

## Stable keys

Each user-owned collection item must have:

- a random local `id` generated once;
- a deterministic semantic key where the domain permits it, for example
  `favorite:<canonicalRecordId>` or `follow:topic:<normalizedTopicId>`;
- `createdAt` and `updatedAt` timestamps;
- schema/domain version;
- optional tombstone only if future sync design requires deletion propagation.

Device clocks are not sufficient to silently resolve every conflict. The future
migration flow may use timestamps for preview ordering, but user-visible
conflicts require explicit keep-local, keep-cloud, or merge decisions.

## Export envelope

The Version 1.7 guest export is the migration bridge and must contain:

- format and guest-profile schema versions;
- exported timestamp and app version;
- preferences, follows, favorites, read/dismissed state, saved searches,
  briefing/notification settings, and consent preferences;
- per-domain counts and a checksum/integrity field.

It must not contain:

- provider/API keys, auth tokens, sessions, passwords, email, Supabase internal
  credentials, or privileged identifiers;
- prompt bodies, imported documents, Assistant history, or unrelated workspace
  domains;
- current Radar article bodies beyond stable references needed by user state;
- analytics events unless a separate explicit export option is approved.

## Version 1.8 migration sequence

1. User explicitly chooses account migration after authentication is added.
2. App loads and validates local guest data without transmitting it.
3. App fetches cloud inventory through an authenticated repository protected by
   server authorization/RLS.
4. App creates a preview showing additions, matches, conflicts, unsupported
   records, and consent differences.
5. User chooses per-domain merge/replace/skip and conflict resolutions.
6. Client submits bounded idempotent mutations; local data remains intact.
7. Server confirms every accepted mutation and returns authoritative IDs/
   versions.
8. App verifies counts/checksums and records migration completion locally.
9. Local deletion is a separate explicit choice after verification; failure
   preserves the complete local profile and supports retry.

No automatic migration occurs on sign-in.

## Conflict strategy

- Exact semantic-key and equal payload: treat as already migrated.
- Exact semantic-key with different state: show a conflict.
- Favorites/follows/read flags: allow union only when the user selects merge.
- Dismissed/unread or consent differences: never merge automatically.
- Saved-search name collision: preserve both with a previewed rename.
- Unknown future fields: reject or preserve only through an explicitly
  versioned migration; never upload opaque structures.
- Partial cloud failure: roll back the migration batch where supported or keep
  an idempotent pending set; never mark migration complete.

## Compatibility with existing providers

ADR-012’s local-first/idempotent-queue concepts are reusable, but its queue
eviction behavior is not sufficient for account migration because silently
dropping an old mutation can lose user intent. Migration uses a dedicated,
bounded, reviewable transaction/batch contract with explicit failure and
resume behavior.

Existing Supabase tables and RLS are not assumed to match the new guest-profile
schema. A future task must inspect and migrate them deliberately; this document
does not define or execute SQL changes.

## Privacy and deletion

- Cloud migration requires separate privacy copy and consent.
- Declining migration leaves the complete guest profile local.
- Signing out must not silently delete local guest data.
- Cloud account deletion and local-profile reset are independent actions with
  independent confirmations and verification.
- Analytics consent does not imply profile migration consent, and account
  creation does not imply analytics consent.

## Version 1.7 acceptance criteria

- All new UI/domain logic operates against a local repository without an
  account.
- Local profile ID and account ID are separate types and fields.
- Export/import round trips the supported guest schema.
- Migration keys are stable and deterministic where applicable.
- No authentication assumption appears inside Radar, briefing, ranking,
  notification, or saved-search components.
- Documentation explicitly states that cloud synchronization is future work.
