# Profile and account

`/profile` edits display name, language, experience, goals, interests, and onboarding preferences. It separates local preferences from confirmed cloud profile state and does not expose UUIDs outside Developer Mode. `/account/security` explains verification, session scope, password recovery/change, sign-out choices, export, and deletion-request limitations.

Account deletion is not presented as complete without a trusted administrative backend operation. The UI can collect typed confirmation and produce a request state, but it must disclose that final identity deletion requires project-side administration.

## Acceptance

Profile edits distinguish local and cloud confirmation, sign-out keeps authored local data, and security actions expose honest limitations.
