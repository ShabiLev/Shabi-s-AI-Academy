# GitHub Pages deployment

GitHub Pages hosts the Vite artifact at `https://shabilev.github.io/Shabi-s-AI-Academy/`. `.github/workflows/deploy-pages.yml` starts only after a successful `CI` push run on `main`; it checks out the successful run's full SHA and does not repeat unit, coverage, accessibility, visual, or performance gates.

`npm run build:pages` fixes the `/Shabi-s-AI-Academy/` base path, HashRouter mode, public site URL, and safe deployment provider metadata. It writes `dist/deployment-commit.json` and validates hashed assets, canonical metadata, the full tested commit embedded in the application bundle, localhost exclusions, and common secret-shaped values. `dist` is generated and gitignored.

Local verification:

```bash
npm run build:pages
npm run preview:pages
npm run test:e2e:pages
```

In GitHub, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The workflow compares the successful CI SHA, checked-out SHA, build metadata SHA, and deployment-artifact SHA before the official Pages action publishes it. The deployment environment records the published URL and SHA provenance.

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are optional public client configuration. Never provide a service-role credential because Vite embeds `VITE_` values in browser assets. Configure the callback as `https://shabilev.github.io/Shabi-s-AI-Academy/#/auth/callback`.

To roll back, revert on an authorized branch, merge through green main CI, and let the workflow deploy the known-good commit. To disable Pages, unpublish it in **Settings → Pages**; do not delete unrelated Vercel configuration.
