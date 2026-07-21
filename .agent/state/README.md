# Historical Agent State

These JSON files are a frozen Version 1.4 migration record. They are retained for
historical compatibility and must not be regenerated or treated as current
release proof. Current sanitized state is written to the ignored
`.agent/runtime/state/` directory by `npm run memory:update`; when it is absent,
the UI and validators report the runtime state as unverified.
