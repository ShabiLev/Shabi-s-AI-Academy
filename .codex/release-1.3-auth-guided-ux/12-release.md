# 1.3 Release

## Commit sequence

1. `feat(ux): add guided information architecture and navigation`
2. `feat(onboarding): add personalized first-time experience`
3. `feat(help): add page guidance, glossary and guided tours`
4. `feat(auth): add Supabase authentication foundation`
5. `feat(account): add profile and account-security flows`
6. `feat(sync): add local-to-cloud data architecture`
7. `feat(migration): add local data migration and conflict review`
8. `feat(admin): add secure administration foundation`
9. `test(auth): add authentication and guided-UX regression coverage`
10. `docs(auth): document Supabase, RLS and user data`
11. `chore(release): prepare Shabi's AI Academy 1.3.0-beta.1`

Run all requested focused and release commands in local-only and mocked-configured modes. Inspect `dist` for credential/token/path patterns, verify Pages callbacks and both routers, create the handoff, and stop before push or merge.

## Stop condition

Leave a clean local feature branch with eleven commits and wait for explicit push authorization.
