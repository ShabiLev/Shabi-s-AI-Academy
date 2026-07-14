# GitHub Pages deployment

GitHub Pages hosts the built Vite application at `https://shabilev.github.io/Shabi-s-AI-Academy/`. Publishing `main` from the repository root exposes the development `index.html`, whose `/src/main.tsx` entry is not a deployable browser bundle, so the site appears blank. The Pages workflow instead runs the quality checks, builds the application, uploads `dist`, and deploys that artifact with official GitHub Pages Actions. `dist` remains generated and gitignored.

## Deployment-specific behavior

The Pages build sets `VITE_BASE_PATH=/Shabi-s-AI-Academy/`, so Vite emits repository-relative hashed assets and base-aware favicon and manifest links. It also sets `VITE_ROUTER_MODE=hash`; public and protected routes therefore use URLs such as `#/about`, `#/login`, and `#/dashboard`, which survive direct navigation and refresh without server rewrites.

Local development remains at `http://localhost:5173/` with `BrowserRouter` and base `/`. Vercel remains at `https://shabi-s-ai-academy.vercel.app/` with `BrowserRouter`, root assets, and the existing `vercel.json` SPA rewrite. `VITE_PUBLIC_SITE_URL` changes canonical and Open Graph metadata for the Pages build without changing Vercel metadata.

## Build and verify locally

```bash
npm run build:pages
npm run preview:pages
npm run test:e2e:pages
```

`build:pages` uses `cross-env`, so it works in PowerShell, Windows Command Prompt, and POSIX shells. It checks that `dist/index.html` references hashed JavaScript and CSS under `/Shabi-s-AI-Academy/assets/`, uses the Pages favicon, manifest, canonical, and Open Graph URLs, contains no `/src/main.tsx`, contains no operational localhost deployment URL in the HTML or application entry chunk, and does not contain common secret-shaped credentials.

## GitHub configuration and Actions

In the repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. A push to `main` or a manual dispatch starts `.github/workflows/deploy-pages.yml`. Inspect the **Actions → Deploy GitHub Pages** run: the build job must pass before the deploy job publishes its `dist` artifact, and the deploy environment exposes the resulting URL.

The optional `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values are public client configuration and are passed from GitHub Actions secrets. Never add a service-role credential: Vite embeds `VITE_` values in browser assets. Configure the deployed callback as `https://shabilev.github.io/Shabi-s-AI-Academy/#/auth/callback`; the Pages Playwright suite verifies Login, Register, protected redirects, and invalid callbacks under the repository base.

The workflow requires only the scoped `pages: write` and `id-token: write` permissions used by the official deployment action. If the Supabase values are absent, the same artifact remains fully usable in local-only and Guest modes.

## Rollback or disable Pages

To roll back, revert the deployment change or application commit on `main`, allow the workflow to publish the known-good build, and verify the resulting Pages deployment. GitHub also retains deployment history under the `github-pages` environment for investigation.

To disable Pages, open **Settings → Pages** and choose the option to disable/unpublish the site. Disable or remove the Pages workflow only after the site is unpublished; neither operation requires deleting Vercel configuration.
