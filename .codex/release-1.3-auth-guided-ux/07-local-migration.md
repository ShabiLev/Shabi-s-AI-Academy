# Local migration

The migration service scans known versioned local domains, validates records, counts items and duplicates, creates a secret-filtered backup, and produces a preview before any write. Users select domains and copy, merge, replace, keep-local, or cancel behavior. Replace never runs silently.

Conflicts compare stable ID, source ID, schema version, timestamp, and deterministic content hash. Keep local, keep cloud, keep both, and review later remain explicit. Failed writes roll back the attempted cloud batch where practical and always retain local records.

## Acceptance

Cancel is write-free, failure preserves all local domains, and every completed attempt produces a non-sensitive report.
