# Version 1.8 Storage, Backup, and Privacy

Five new repositories use actor-scoped versioned keys: `missions`,
`agent-teams`, `skill-map`, `context-packs`, and `mission-analytics`.

Parsers enforce schema, string, collection and byte limits. Malformed JSON is
copied to an actor/domain-specific quarantine key and the domain opens with a
safe default. Different actors are never merged.

Complete Workspace backup resolves the active actor, includes these five
domains, verifies checksum and dangerous/secret-shaped content, previews
conflicts, supports merge/replace/skip per domain, and rolls back every touched
key if any write fails. Each Settings reset removes only its selected domain.

Mission analytics uses the existing opt-in consent boundary. Only allowlisted
lifecycle type, timestamp, coarse category and numeric quality may be stored.
Mission text, acceptance criteria, IDs, outputs, Context Pack notes, personal
data, credentials and secret-shaped fields are rejected.

Pause stores phase ID, transition count and a deterministic state fingerprint.
Continue compares the current state; drift moves the mission to `needs-input`
without overwriting newer data.

