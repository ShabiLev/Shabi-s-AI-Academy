# Version 1.5 CI and deployment

## Exact-SHA evidence

Every job validates the triggering `GITHUB_SHA`. Results and provenance are immutable Actions artifacts; runtime evidence is not committed. The Radar workflow produces validation artifacts without automated commits.

## Workflow boundaries

PR CI is deterministic without optional credentials. Radar validation is separately scheduled and dispatchable. Visual baseline generation is a distinct human-approved workflow and cannot make the mandatory visual gate pass automatically.

## Deployment rule

Pages production deployment remains restricted to successful CI for an exact `main` SHA. Feature branches may use previews and PR artifacts but cannot deploy production or a blocked release.
