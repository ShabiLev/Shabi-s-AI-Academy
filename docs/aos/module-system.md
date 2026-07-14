# The module system

Every AOS instruction file is a "module" — a small, single-purpose Markdown
(or JSON Schema) file registered in
[`../../.agent/manifest.json`](../../.agent/manifest.json). This page
describes how modules are categorized, versioned, and kept consistent.

## Anatomy of a manifest entry

Each entry under `manifest.json`'s `modules` array has these required
fields (enforced by `npm run aos:check:manifest`):

| Field | Meaning |
| --- | --- |
| `id` | Dotted identifier, e.g. `workflow.testing`, used by `registry.json` and by other modules' `dependsOn`. |
| `path` | Real file path relative to the repo root. |
| `title` | Human-readable name. |
| `purpose` | One-sentence description of what the module governs. |
| `category` | One of `workflow`, `loaders`, `knowledge`, `research`, `quality`, `security`, `git`, `release`, `prompts`, `agents`, `memory`, `handoff`, `templates`, `schemas`. |
| `requiredFor` | Task types (from `registry.json`) that need this module, or `["*"]` for every task. |
| `dependsOn` | Other module IDs this one assumes are already loaded. |
| `version` | Per-module SemVer, independent of `aosVersion`. |
| `owner` | Who maintains it (currently `aos` for all initial modules). |
| `status` | `active` or a deprecation marker. |

## Categories at a glance

Modules are grouped by what kind of instruction they carry: `workflow`
(process steps), `knowledge` (project-specific technical interpretation),
`quality`/`security`/`git`/`release` (policy for that domain), `research`
(the research operating system), `prompts` (task-type prompt templates),
`agents` (operational role definitions, not autonomous agents), `memory`
(file-based memory categories), `handoff` (cross-agent continuity), and
`templates`/`schemas` (reusable document shapes and JSON Schemas).

## Versioning

- Each module has its own `version` field — bumping it is a normal part of
  editing that module, independent of the AOS-wide version.
- The AOS framework itself is versioned in [`../../.agent/VERSION`](../../.agent/VERSION)
  (currently referenced as `aosVersion` in `manifest.json`); every AOS
  version change is recorded in [`../../.agent/changelog.md`](../../.agent/changelog.md).
- The application version the AOS ships alongside is tracked separately as
  `applicationVersion` in `manifest.json` and must match `package.json`'s
  `version` field — a mismatch is reported as a stale version reference.

## Validation

`npm run aos:check` runs all of the following and fails non-zero on any
error:

```
npm run aos:check:manifest    # required fields present; dependency graph resolves with no cycles; orphan modules and orphan task mappings flagged; VERSION and package.json version match manifest
npm run aos:check:links       # every relative Markdown link across .agent/, .codex/workflows/, .claude/workflows/, and docs/aos/ resolves to a real file
npm run aos:check:schemas     # every file under .agent/schemas/*.json is valid JSON Schema
npm run aos:check:duplication # entry-point and prompt files stay thin; no module duplicates another's workflow content
```

`npm run aos:report` produces a human-readable status summary; `npm run
aos:snapshot` regenerates the JSON the `/aos` dashboard reads from
`public/generated/aos-snapshot.json`.

## Related

[`architecture.md`](architecture.md) for how modules are resolved per task,
[`troubleshooting.md`](troubleshooting.md) for fixing a failing check, and
[`extension-guide.md`](extension-guide.md) for adding a new module.
