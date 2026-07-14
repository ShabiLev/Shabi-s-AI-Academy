# Troubleshooting `npm run aos:check`

`npm run aos:check` runs four sub-checks against
[`../../.agent/`](../../.agent/). This page covers what each failure means
and how to fix it. See [`module-system.md`](module-system.md) for what the
checks validate in general.

## Broken links (`npm run aos:check:links`)

Scans every Markdown file under `.agent/`, `.codex/workflows/`,
`.claude/workflows/`, and `docs/aos/` for relative link targets and
confirms each resolves to a real file on disk (external URLs and in-file
anchors are skipped).

**Fix:** correct the path in the offending link, remembering that
`docs/aos/*.md` is two directory levels below the repo root, so a link to
`.agent/master.md` from a `docs/aos/` file must be written as
`../../.agent/master.md`. If the target file was renamed or moved, update
every link that pointed at the old path, not just the first one reported.

## Orphan modules (`npm run aos:check:manifest`)

A module in `manifest.json` that no other module's `dependsOn` references
and that no `registry.json` task-type list includes is flagged as a
possible orphan.

**Fix:** either add the module to the relevant `registry.json` task-type
list (see [`extension-guide.md`](extension-guide.md)), add it to another
module's `dependsOn` if it is genuinely a dependency, or — if it is truly
unused — remove it from `manifest.json` and delete its file.

## Orphan task mappings (`npm run aos:check:manifest`)

A `registry.json` task-type entry that resolves to neither a manifest
module ID nor an existing `.agent/<entry>` path.

**Fix:** correct the typo in `registry.json`, or add the missing module to
`manifest.json` if it should exist but was never registered.

## Circular dependencies (`npm run aos:check:manifest`)

Two or more modules' `dependsOn` fields form a cycle (A depends on B, B
depends on A, directly or through a chain).

**Fix:** break the cycle by removing the dependency that is not truly
required, or by extracting the shared concern into a third module both can
depend on one-directionally.

## Stale version references (`npm run aos:check:manifest`)

`manifest.json`'s `aosVersion` no longer matches
[`../../.agent/VERSION`](../../.agent/VERSION), or its
`applicationVersion` no longer matches `package.json`'s `version`.

**Fix:** update whichever file is behind so both sides agree, and record
the AOS version bump in
[`../../.agent/changelog.md`](../../.agent/changelog.md) if the AOS version
itself changed.

## Duplicated workflow content (`npm run aos:check:duplication`)

`.codex/workflows/aos.md` or `.claude/workflows/aos.md` has grown beyond a
thin pointer (line-count/paragraph-similarity heuristics), or two modules
repeat the same substantive paragraph.

**Fix:** move the duplicated content into the single `.agent/` module that
should own it, and replace the duplicate with a relative link back to that
module. See [`../../.agent/compatibility.md`](../../.agent/compatibility.md)
for what the two agent bootstrap files must never contain.

## Invalid schemas (`npm run aos:check:schemas`)

A file under `.agent/schemas/*.schema.json` fails to parse as valid JSON
Schema.

**Fix:** validate the JSON syntax first, then check the schema against the
JSON Schema draft the rest of `.agent/schemas/` uses; fix the specific
keyword or type error reported.

## General approach

Run `npm run aos:check` locally before relying on any AOS module content,
read the specific sub-check's error message (`aos:check:manifest`,
`aos:check:links`, `aos:check:schemas`, `aos:check:duplication` can also be
run individually to isolate a failure), and re-run `npm run aos:check`
after each fix to confirm nothing else regressed. `npm run aos:report`
gives a human-readable status summary if you want a broader view than the
pass/fail exit code.
