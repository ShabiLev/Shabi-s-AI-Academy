# Adding a new AOS module

How to extend the AOS with a new instruction module — a new workflow step,
a new knowledge interpretation, a new security policy, etc. — without
breaking `npm run aos:check` or duplicating existing content.

## Before you start

Check whether the content actually belongs in a new module or in an
existing one. AOS's non-negotiable principles (see
[`../../.agent/master.md`](../../.agent/master.md) §10) forbid duplicating
another module's workflow rules — if an existing module already covers
most of what you need, extend it instead of creating a near-duplicate.

## Steps

1. **Write the module file** under the correct category directory in
   [`../../.agent/`](../../.agent/) (`workflow/`, `knowledge/`, `research/`,
   `quality/`, `security/`, `git/`, `release/`, `templates/`, `prompts/`,
   `agents/`, `memory/`, `handoff/`, or `schemas/`). Keep it small and
   single-purpose, matching the tone of existing files in that directory —
   a short Purpose section, then focused rules/steps, then a Related
   section linking to neighboring modules by relative path.
2. **Add a `manifest.json` entry.** In
   [`../../.agent/manifest.json`](../../.agent/manifest.json)'s `modules`
   array, add an object with all required fields: `id` (dotted, unique),
   `path`, `title`, `purpose`, `category`, `requiredFor`, `dependsOn`,
   `version` (start at `1.0.0`), `owner`, `status: "active"`. See
   [`module-system.md`](module-system.md) for what each field means.
3. **Wire it into `registry.json` if task-relevant.** If the module should
   load automatically for one or more task types, add its `id` (or its bare
   path, matching the existing pattern for `research`/`knowledge ingestion`
   entries) to the relevant list(s) in
   [`../../.agent/registry.json`](../../.agent/registry.json)'s
   `taskTypes`. A module that applies to every task type instead belongs in
   `manifest.json`'s `requiredModules`, not repeated in every list.
4. **Link it from its neighbors.** Add it to the module index table of the
   category's anchor file (e.g. `security/security-policy.md`'s module
   index) so a reader following that file's overview finds the new one.
5. **Run the validator.**

   ```
   npm run aos:check
   ```

   This confirms: required manifest fields are present, the dependency
   graph has no cycles, the new module is not an orphan (referenced by
   `registry.json` or another module's `dependsOn`), every relative link in
   the new file resolves, and no workflow content was duplicated. See
   [`troubleshooting.md`](troubleshooting.md) for fixing a specific
   failure.
6. **Record it.** For a change to the AOS framework itself, add an entry to
   [`../../.agent/changelog.md`](../../.agent/changelog.md) — this is
   separate from the application `CHANGELOG.md`.
7. **Regenerate the snapshot** the `/aos` dashboard reads, if you want the
   UI to reflect the new module immediately:

   ```
   npm run aos:snapshot
   ```

## Common mistakes to avoid

- Adding a module but forgetting the `registry.json` wiring, leaving it an
  orphan that `aos:check:manifest` will flag.
- Copying a paragraph from another module instead of linking to it —
  `aos:check:duplication` will catch substantial repeated content.
- Using an absolute or incorrectly-nested relative path in a cross-link —
  `aos:check:links` will catch a broken link, but get the `../` depth right
  the first time by checking where your new file lives relative to the
  repo root.
- Skipping `owner`/`status`/`version` fields in the manifest entry —
  `aos:check:manifest` requires all of them.

## Related

[`module-system.md`](module-system.md) for what each field and category
means, [`architecture.md`](architecture.md) for how modules get resolved
per task, and [`troubleshooting.md`](troubleshooting.md) for fixing a
failing check after you've made your change.
