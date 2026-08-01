# Version 1.9 rollback plan

## Application rollback

Redeploy the last known-good `v1.8.0-beta.1` artifact or revert the Version 1.9
merge through a new reviewed PR. Do not rewrite shared history, move a published
tag, force-push, or delete evidence.

## Data compatibility

Version 1.9 adds new actor-scoped domains and does not rewrite Version 1.8
Mission/Team/Skill data. Application rollback leaves Version 1.9 keys inert.
Before rollback, offer a complete Version 1.9 backup and preserve quarantined
records for diagnosis. A Version 1.8 client must reject unknown Version 1.9
domains rather than partially importing them.

Rolling back an entity or suite baseline inside Version 1.9 creates a new
version; it never mutates historical runs or certifications.

## Rollback triggers

- loss, cross-actor exposure, corruption, or non-transactional import;
- forged/tampered result accepted as certified;
- evaluator self-approval or independence bypass;
- connected preview performs or implies an external write;
- secret/path/private-content disclosure in trace, analytics, preview, or export;
- non-deterministic identical-input results or mixed entity versions;
- critical regression not blocking publication;
- broken core navigation, persistent production error, material accessibility,
  security, performance, or meaningful visual regression;
- deployment SHA/version mismatch.

Harmless pixel noise is investigated and reviewed but is not alone a rollback
trigger.

## Procedure

1. Stop rollout and record deployed SHA, environment, time, symptom, affected
   actor/domain, and safe reproduction evidence.
2. Disable no data or safety gate. Preserve current production evidence.
3. Select the verified Version 1.8 deployment artifact by exact SHA/tag.
4. Redeploy through the normal reviewed deployment mechanism.
5. Verify deployment SHA and absence of Version 1.9 write paths.
6. Smoke clean and migrated profiles, then monitor errors and storage recovery.
7. Create a reviewed fix-forward PR; do not reuse or move the failed tag.

## Post-rollback smoke

- Landing/login, Dashboard, lessons, prompts, Radar, Help, WALK ME, Settings.
- Version 1.8 Teams/Missions, plan, evidence, Pause/Continue, and Skill Map.
- Hebrew/English, RTL/LTR, desktop/mobile, keyboard, and no overflow.
- Version 1.8 backup preview/import/rollback and domain resets.
- Version 1.9 keys remain inert and do not corrupt or mask Version 1.8 data.
- GitHub Pages/Vercel report the intended rollback SHA with no runtime errors.

## Recovery evidence

Record the trigger, exact old/new SHAs, deployment IDs, commands, smoke results,
remaining risks, and owner. Manual security/UX/content judgments remain
human-owned and are not inferred from a successful redeploy.
