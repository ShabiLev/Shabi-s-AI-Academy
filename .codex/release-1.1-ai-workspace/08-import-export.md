# Complete Workspace Import and Export

Export settings, progress, prompts, agents, projects, knowledge, workflows, runs, playground/assistant history, favorites, recents, notifications, and analytics in a JSON envelope containing schema/app versions, timestamp, domain versions, and checksum. Secrets and executable content are excluded.

Import is size-limited and staged: parse and validate, preview counts/conflicts, choose merge or replace per domain, confirm, apply transactionally, and report. Every domain is snapshotted before writes and restored on any failure. Unknown domains, secret-shaped keys, malformed schemas, unsafe prototypes, and unsupported executable values are rejected. Conflict resolution never mutates built-ins or silently discards user data.

## Acceptance

Preview performs no write and rollback restores every touched domain.
