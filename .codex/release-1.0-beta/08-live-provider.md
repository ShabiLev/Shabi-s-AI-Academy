# Optional Secure Live Provider Boundary Specification

## Default
Feature flag OFF. Mock and Dry Run available. Live controls disabled. No browser API-key input and no direct provider calls.

## Allowed architecture
Optional Vercel serverless endpoint only. Browser sends validated request without key; server reads secret from Vercel environment, validates, rate-limits, calls provider and returns safe output.

## Feature flags
`VITE_LIVE_PROVIDER_ENABLED=false` plus server configuration. Browser flag alone never enables execution.

## Consent
Show provider, data destination, privacy warning, token/cost estimate and explicit confirmation.

## Controls
Input/output limits, timeout, rate limit, origin checks, safe errors, no secret reflection, no tool execution.

## Logging
No full prompt/response logs by default; safe operational metadata only.

## Tests
Disabled mode, missing key, malformed/oversized request, timeout, provider error, consent, no key in bundle/localStorage and Mock/Dry Run unaffected.

## Release rule
The beta may ship with this disabled. Missing provider configuration is not a failure.

## Docs
Create `docs/live-provider.md`, `docs/provider-security.md`, `docs/vercel-environment.md`.
