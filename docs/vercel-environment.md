# Vercel environment variables

The beta requires no secret environment values. `VITE_LIVE_PROVIDER_ENABLED` defaults to false and cannot enable execution by itself.

Future server activation would require `LIVE_PROVIDER_ENABLED`, `PUBLIC_SITE_URL`, and a server-only provider secret. Never prefix secrets with `VITE_`, expose them to browser code, print them in build logs, or store them locally. The current endpoint remains non-executable even when these values exist because no adapter ships.
