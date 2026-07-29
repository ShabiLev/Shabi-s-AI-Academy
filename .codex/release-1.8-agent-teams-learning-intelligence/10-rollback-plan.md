# Rollback plan

## Application rollback

Redeploy the last known-good `v1.7.0-beta.4` artifact or revert the 1.8 merge
through a new reviewed PR. Do not rewrite history or move the published tag.

## Data compatibility

Version 1.8 adds new actor-scoped keys and does not rewrite Version 1.7 domains.
Rolling the application back leaves new keys inert. Users should export a
complete 1.8 backup before rollback; Version 1.7 import must reject unknown
domains rather than partially applying them.

## Trigger conditions

Rollback for data loss/corruption, permission bypass, self-approval, connected
execution exposure, material accessibility regression, broken core navigation
or persistent production error. A harmless visual/environmental warning is
investigated but is not by itself a rollback trigger.

## Verification

After rollback, smoke landing/login, dashboard, lessons, Radar, Help, WALK ME,
settings/export and existing 1.7 storage. Record the deployed SHA and preserve
failure evidence.

