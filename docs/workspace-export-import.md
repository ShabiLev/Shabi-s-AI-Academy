# Workspace Export and Import

Settings can export a versioned JSON Workspace backup covering supported browser-local domains. The envelope records app/schema/domain versions, export time, and a deterministic checksum. Secret-shaped data and malformed domains are excluded.

Import is preview-first. Size, schema, checksum, prototype/executable content, supported domains, and conflicts are validated before replace or merge is confirmed. Application uses staged writes with rollback on failure. Import never executes content, restores credentials, or silently overwrites data.

Version 1.3 keeps provider-owned authentication sessions, access/refresh tokens, passwords, and Admin claims outside the backup allowlist. A Workspace backup can be downloaded before local-to-cloud migration, but importing it never signs in a user or starts synchronization.

