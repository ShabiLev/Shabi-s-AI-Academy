# Local-to-cloud migration

Migration is an explicit review workflow for authenticated cloud users. It scans supported local domains, reports valid and malformed records, lets the user choose domains and Copy, Merge, Replace, Keep local, or Cancel, then creates a preview with local/cloud counts, writes, possible deletes, and conflicts.

No write occurs before preview and typed `MIGRATE` confirmation. A pre-migration workspace backup is available. Local data remains intact after success until the user separately chooses cleanup, and it remains intact after cancellation or failure.

Conflict choices are Keep local, Keep cloud, Keep both, or Review later. A failed batch reports errors and does not claim rollback or synchronization beyond what the provider confirmed.
