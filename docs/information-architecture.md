# Information architecture

Version 1.3 groups the Academy around user intent: Home, Learn, Build, Workspace, and More. The same hierarchy is rendered in desktop and mobile navigation, the current route remains selected, and group expansion is stored as a browser-local preference.

Beginner Mode hides diagnostic and developer-oriented entries from the first view without removing routes or changing authorization. Advanced Mode reveals analytics, QA, documentation, release, and roadmap tools. Page metadata in `src/guidance/pageRegistry.ts` is the shared source for route identity, product area, explanations, actions, Help, glossary terms, search, and Local Assistant orientation.

The public surface consists of the landing page, authentication pages, About, Privacy, and Terms. All learning and workspace routes require either a Guest or authenticated session. Account security, migration, and Admin add stronger cloud-account or role checks.
