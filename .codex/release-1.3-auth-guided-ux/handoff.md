# Codex Handoff — Version 1.3.0-beta.1

## Release

- Application: Shabi's AI Academy
- Version: 1.3.0-beta.1
- Milestone: User Accounts & Guided Experience
- Branch: feature/1.3.0-auth-guided-ux

## Scope

This release includes:

- Guided information architecture
- Grouped navigation
- Beginner and Advanced modes
- Page introductions
- Breadcrumbs
- Contextual Help
- Glossary
- Guided tours
- Personalized onboarding
- Task-oriented Dashboard
- Supabase authentication foundation
- Guest mode
- Registration and login
- Email verification
- Password reset
- Magic Link
- Profile and account-security pages
- Local, cloud and hybrid data providers
- Local-to-cloud migration
- Conflict-resolution flows
- Secure Admin foundation
- Full-system browser and UX quality coverage

## Required validation

Run:

```bash
npm run docs:check
npm run lint
npm run test:run
npm run test:coverage
npm run build
npm run build:pages
npm run test:e2e
npm run test:e2e:full
npm run test:e2e:pages
npm run test:a11y
npm run test:visual
npm run test:performance
npm run test:journeys
npm run test:click-audit
npm run test:route-crawl
npm run test:forms
npm run test:overlays
npm run test:responsive:interactions
npm run test:keyboard
npm run test:copy
npm run test:errors
npm run test:ux
npm run test:release-candidate
npm run test:release-candidate:pages
npm run quality:collect
npm run quality:analyze
npm run validate:release
git diff --check