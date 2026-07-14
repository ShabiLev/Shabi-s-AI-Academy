# Sync conflicts and offline behavior

Hybrid records retain local identity and update metadata. Idempotency keys prevent duplicate retries. When both local and cloud versions changed, the repository reports a conflict instead of silently selecting a winner.

Keep local schedules the local version for upload; Keep cloud replaces the selected local copy only after confirmation; Keep both creates a distinct local identity; Review later leaves both sides unchanged. Replace-cloud strategies always disclose potential deletes in preview.

Offline operations remain local and enter a bounded queue. Reconnection permits an explicit retry; repeated failure becomes `failed`, never `synchronized`. Authentication tokens are managed only by Supabase and are not queue fields.
