# Version 1.7 release, limitations, and rollback

## Release gates

The release requires the complete local validation contract, three stable performance runs, Windows and Linux visual suites without waiver, human UX/content/security/visual review, exact-PR-head CI, preview verification, merge-SHA deployment verification, and production smoke on GitHub Pages and Vercel.

No failed, cancelled, unexpectedly skipped, queued, in-progress, stale-SHA, or unrun mandatory gate may be treated as passed.

## Known limitations

- Guest preferences are browser/device-local. Clearing site storage removes them unless exported first.
- Production login, account migration, cloud profile/favorites, and cross-device sync are deferred.
- Feedback is saved locally and not transmitted because no trusted same-origin endpoint is approved.
- In-app notifications are local. Email digest and browser push are deferred.
- Enabled automated sources are English-first; partial translations are labeled as English originals in Hebrew UI.
- The Israel Innovation Authority adapter is registered but disabled because its edge policy rejects supported Node retrieval. The reviewed Israeli Ministry of Education fallback remains available.
- Current-news ingestion output is deployed/generated evidence, not a committed news snapshot.

## Rollback

1. Stop scheduled publication by disabling the `update-ai-radar` workflow or its deployment environment.
2. Redeploy the previous known-good application release and reviewed feed artifact.
3. If application rollback is required, revert the Version 1.7 merge in a new branch and PR; do not rewrite history or force-push.
4. Preserve guest storage: Version 1.7 uses a separate `shabis-ai-academy:guest-profile:v1` key and rollback must not delete it.
5. Verify public entry, fallback Radar, source links, existing workspace storage, Hebrew/English direction, and console/network state.
6. Record the rollback SHA, deployment IDs, cause, affected source health, and follow-up owner.

The annotated release tag must only be created after the merge SHA is deployed and smoke-tested.
