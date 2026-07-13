# Vercel Deployment and Public Site Specification

## Verified environment
Project `shabi-s-ai-academy`, Vite, production branch `main`, URL `https://shabi-s-ai-academy.vercel.app`.

## Routing
BrowserRouter plus Vercel SPA rewrite. No HashRouter and no GitHub Pages base path.

## Build
`npm run build`, output `dist`, repository root.

## Preview
Release branch and PR previews. Preview localStorage is isolated by origin.

## Metadata
Inject safe version, commit, branch, timestamp, environment and public URL.

## Public files
Favicon, manifest, robots, sitemap, Open Graph and canonical URL. Only public routes in sitemap.

## Production verification
Check deployment READY, commit match, root, About, Login, Runs, Prompts, Agents, Projects, Knowledge, unknown route, hard refresh, assets and runtime errors.

## Rollback
Document reverting to previous READY deployment.

## Failure investigation
Build logs, runtime errors, rewrites, Node version and environment values.

## Docs
Update README and `docs/vercel-deployment.md`.
