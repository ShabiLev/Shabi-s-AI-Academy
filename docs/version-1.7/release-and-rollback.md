# Version 1.7 release, limitations, and rollback

## 1.7.0-beta.4 delta

The beta.4 hotfix makes WALK ME first-visit launch independent of onboarding completion and Dashboard-only routing. Eligible shell routes launch only after the shell is ready and no visible blocking dialog is present. Safe deep links preserve a local internal return route while the guided steps run on Dashboard. Actor storage, completion rules, Radar ingestion/feed behavior, guest-profile retention, visual tolerances, analytics consent, and provider boundaries are unchanged. Rollback uses a normal revert of the beta.4 PR; beta.3 safely reads the unchanged walkthrough schema.

## 1.7.0-beta.3 delta

The beta.3 release replaces module-level guidance banners with one global WALK ME walkthrough and makes Help Center public and fully localized. It preserves the beta.2 storage key and safely migrates the former `dismissed` state to resumable `in-progress`. It does not change Radar ingestion/feed behavior, guest-profile retention, visual tolerances, analytics consent, or provider boundaries. Rollback uses a normal revert of the beta.3 PR; beta.2 safely ignores the newer resumable fields.

## 1.7.0-beta.2 delta

The beta.2 release adds only the local first-visit product walkthrough and its test/documentation surface. It does not change Radar ingestion, guest-profile retention, visual tolerances, analytics consent, or provider boundaries. Rollback uses a normal revert of the beta.2 PR; the separate walkthrough key may remain because beta.1 ignores it safely.

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
