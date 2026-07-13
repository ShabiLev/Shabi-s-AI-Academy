# Vercel deployment

Vercel hosts the Vite application at `https://shabi-s-ai-academy.vercel.app`; GitHub Actions validates changes but does not deploy them. The Vercel project uses the repository root, `npm run build`, and the `dist` output directory. Production tracks `main`; release branches and pull requests receive isolated Preview origins and therefore isolated browser storage.

## Routing and metadata

The application deliberately uses `BrowserRouter`. `vercel.json` rewrites non-API requests to `index.html`, so direct navigation and hard refresh work without a hash or base path. `/api` remains outside the SPA rewrite for serverless functions. Vite injects only safe public metadata: package version, short commit SHA, branch, build timestamp, Vercel environment, and public deployment URL. Never expose secrets through `VITE_` variables or build-time constants.

## Verification

After Vercel reports **READY**, compare the deployment commit with the expected release commit and verify root, About, Login, Runs, Prompts, Agents, Projects, Knowledge, an unknown route, and hard refreshes. Confirm assets load, protected routes redirect correctly when signed out, no browser console/runtime errors appear, and no credential or private environment value is present in page source or bundled JavaScript.

Preview verification is a deployment check, not something a local build can claim. Record the Preview URL and result in the release review after the branch is pushed with explicit approval.

## Rollback and investigation

To roll back, promote the previous known-good **READY** deployment in Vercel, or revert the release commit, rerun every release gate, and deploy again. For failures, inspect the Vercel build log first, then browser runtime errors, rewrite behavior, the configured Node version, build/output settings, and the safe environment values above. Do not bypass a failing quality gate by changing its threshold.
