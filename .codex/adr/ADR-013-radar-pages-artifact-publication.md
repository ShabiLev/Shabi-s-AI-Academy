# ADR-013: Publish reviewed Radar data through the Pages artifact

Status: Accepted — 2026-07-22

## Decision

The application ships a bounded, human-reviewed JSON feed under `public/generated/`. Vite copies it into the preview or GitHub Pages artifact, and the browser retrieves it from the same origin. The scheduled Radar workflow validates the exact checked-out feed and public source availability, then uploads an immutable report artifact. It never commits or publishes source discoveries.

Changing published Radar records requires a reviewed pull request. A future service may replace this adapter without changing the validated `RadarProvider` boundary.

## Consequences

- Deterministic PR CI and offline cache behavior require no secrets.
- External content is never executed and cannot auto-publish.
- Feed freshness depends on reviewed pull requests; unavailable sources fail the validation workflow while the last reviewed cache remains usable.
