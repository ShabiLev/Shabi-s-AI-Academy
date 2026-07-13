# Shabi's AI Academy — Release 1.0.0-beta.1 Master Specification

## Status
- Repository: `ShabiLev/Shabi-s-AI-Academy`
- Verified baseline commit: `a9fb066ee7aaf4b235a16f3d7a3b05c893a6d7ff`
- Current application version: `0.7.0-alpha.1`
- Target release: `1.0.0-beta.1`
- Release branch: `release/1.0.0-beta.1`
- Hosting: Vercel
- Production URL: `https://shabi-s-ai-academy.vercel.app`
- Engineering Kit: `1.0.0`

This directory is the controlling source of truth for the complete beta release.

## Product objective
Deliver a coherent bilingual beta containing the full curriculum, a large prompt library, a complete starter-agent catalog, Prompt and Agent Playgrounds, Projects, a local Knowledge Base, platform pages, QA and release tooling, and Vercel deployment hardening.

## Non-negotiable principles
1. Build the complete user experience now.
2. Never fabricate live capabilities.
3. Keep every user-facing flow bilingual.
4. Use semantic RTL/LTR.
5. Keep built-in catalogs separate from user-owned data.
6. Preserve existing local data through migrations.
7. Test every user-visible feature.
8. Run `validate:release` before the final commit.
9. Never push or merge automatically.
10. Vercel hosts; GitHub Actions validates.

## Included specifications
- [Curriculum](01-curriculum.md)
- [Prompt Library](02-prompt-library.md)
- [Agent Catalog](03-agent-catalog.md)
- [Playgrounds](04-playgrounds.md)
- [Projects](05-projects.md)
- [Knowledge Base](06-knowledge-base.md)
- [Platform Pages](07-platform-pages.md)
- [Live Provider Boundary](08-live-provider.md)
- [Testing](09-testing.md)
- [Deployment](10-deployment.md)
- [Release](11-release.md)
- [Handoff](handoff.md)

## Delivery sequence
1. Baseline and migrations
2. Curriculum
3. Prompt library and packs
4. Starter agents
5. Playgrounds
6. Projects
7. Knowledge Base
8. Platform pages
9. Optional provider boundary
10. Automation expansion
11. Deployment hardening
12. Final release

## Required commit sequence
```text
feat(content): add complete bilingual academy curriculum
feat(prompts): add full prompt packs and library
feat(agents): add complete starter agent catalog
feat(playgrounds): add prompt and agent workspaces
feat(projects): add project and knowledge workspaces
feat(platform): add roadmap, changelog and documentation center
feat(provider): add optional secure live-provider boundary
test(platform): add complete beta regression coverage
chore(deploy): harden Vercel production deployment
chore(release): prepare Shabi's AI Academy 1.0.0-beta.1
```

## Global requirements
- Dark Jarvis-inspired UI
- Hebrew default, English supported
- No forced lesson locks
- Browser-local, versioned, validated stores
- No secrets in browser storage
- No `eval`, shell execution, real SQL, Jira updates or email sending
- All external text rendered inert
- Keyboard accessibility, visible focus, reduced motion
- No horizontal overflow at 320×568 through 1920×1080

## Release acceptance
- 40–50 bilingual lessons
- At least 250 curated prompts
- At least 30 starter agents
- Prompt and Agent Playgrounds
- Projects and local Knowledge Base
- Mock and Dry Run end to end
- About, Roadmap, Changelog, Documentation Center, Release Center, QA Center, How To, Settings and Developer Mode
- Vercel direct-route refresh
- Full automated regression and manual checklist
- Version exactly `1.0.0-beta.1`
- No automatic push or merge

## Out of scope
Production authentication, cloud sync, billing, real MCP execution, production RAG backend, autonomous destructive actions and marketplace monetization.
