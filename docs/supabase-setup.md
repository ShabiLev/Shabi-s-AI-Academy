# Supabase setup

1. Create a Supabase project and wait for provisioning.
2. In Project Settings, copy the Project URL and public anon/publishable key. Never copy a service-role key into this application.
3. Create `.env.local` from `.env.example` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Run the SQL files in `supabase/migrations/` in filename order using the SQL editor or Supabase CLI.
5. Verify every private table has Row Level Security enabled and inspect the ownership policies before creating real data.
6. In Authentication URL Configuration, set the Site URL for the deployed site and allow the local and deployed callback URLs used below.
7. Allow local development, for example `http://localhost:5173/auth/callback`.
8. Allow the GitHub Pages hash callback `https://shabilev.github.io/Shabi-s-AI-Academy/#/auth/callback`. Keep the repository base and hash fragment intact.
9. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as GitHub Actions secrets or variables named exactly as used by `.github/workflows/deploy-pages.yml`. They are public browser configuration, but repository storage still avoids accidental copying.
10. Build and run `npm run test:e2e:pages` to verify Login, Register, protected redirects, and invalid callback handling.
11. Create a disposable test account. Verify confirmation email, return callback, login restoration, sign-out, Magic Link, password-reset request, recovery callback, and password update.
12. Confirm a standard user cannot read another user's rows and cannot reach Admin routes.
13. Remove both Vite values and rebuild. The landing page, Guest onboarding, all local features, and exports must still work while account controls report unavailable.

Do not use production credentials in tests. Local browser tests mock the service boundary and never create a real account.
