# Guided onboarding

`/onboarding` is a five-step, bilingual, optional introduction for a public guest. It records a main goal, experience level, optional interests with no preselected defaults, a starting area, and a deterministic starting recommendation. It is keyboard/screen-reader operable and remains skippable at every step.

The recommendation uses only stored selections; it is not model-generated. The final step updates the experience mode and opens `/dashboard`. Radar interests are copied into the separate versioned guest profile and can be edited later in Settings. Registration and sign-in are not required for core Academy or Radar value.

After onboarding completes, a fresh actor is offered the optional first-visit product walkthrough on the Dashboard. Onboarding remains the blocking setup flow: the walkthrough never opens over onboarding, account flows, another dialog, or a mobile drawer. Deep links are not redirected merely to force an automatic tour. Choosing Not now suppresses future automatic starts; Help and Settings can restart it later.

Existing browser-local records are not migrated, deleted, or uploaded by onboarding. Substantial existing work is never used as permission to start cloud synchronization.
