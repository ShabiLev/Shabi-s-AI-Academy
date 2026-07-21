# GitHub main-branch protection

Repository settings are external configuration and are not asserted by source code. A repository administrator must open **Settings → Rules → Rulesets** (or **Settings → Branches**) and create an active rule targeting `main`.

Require:

- a pull request before merging, with conversation resolution;
- the branch to be up to date before merge;
- successful required checks: `quality-core`, `functional-e2e`, `cross-browser`, `accessibility`, `visual-linux`, `performance`, and `quality-summary`;
- no direct pushes except an explicitly governed administrator/bot bypass list;
- blocked force pushes and branch deletion.

Save the rule, open a test pull request, and confirm GitHub blocks merge until every required check succeeds. The local `npm run release:main-ready` guard is advisory and does not replace this rule. Until an administrator verifies the rule, branch protection is an external release blocker.
