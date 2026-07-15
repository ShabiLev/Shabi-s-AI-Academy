# Module Registry

Required module categories are `agents`, `git`, `handoff`, `knowledge`, `loaders`,
`memory`, `prompts`, `quality`, `release`, `research`, `schemas`, `security`,
`templates`, and `workflow`.

`npm run aos:check` is the mandatory structural gate. It validates unique IDs,
existing paths and dependencies, acyclic loading, registry references, schemas,
links, and excessive duplication. Warnings require individual review; intentional
template placeholders and standardized operational-role disclaimers may remain
when they do not duplicate executable policy.

Compatibility entry points must link to `.agent/master.md` and must not reproduce
the complete workflow.
