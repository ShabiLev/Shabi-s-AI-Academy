import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { loadManifest, loadRegistry, repoRoot } from "./aos-lib.mjs";
import { validateManifest } from "./validate-aos-manifest.mjs";
import { validateLinks } from "./validate-aos-links.mjs";
import { validateSchemas } from "./validate-aos-schemas.mjs";
import { validateDuplication } from "./validate-aos-duplication.mjs";

test("manifest.json is internally consistent: no duplicate IDs, no circular dependencies, no missing modules", () => {
  const report = validateManifest();
  assert.equal(report.errors.length, 0, report.errors.join("\n"));
});

test("registry.json task types only reference modules that exist in the manifest or on disk", () => {
  const registry = loadRegistry();
  const manifest = loadManifest();
  const ids = new Set(manifest.modules.map((m) => m.id));
  for (const [taskType, entries] of Object.entries(registry.taskTypes)) {
    assert.ok(Array.isArray(entries) && entries.length > 0, `taskTypes.${taskType} must be a non-empty array`);
    for (const entry of entries) {
      const resolvable = ids.has(entry) || entry.endsWith(".md");
      assert.ok(resolvable, `taskTypes.${taskType} entry "${entry}" does not resolve to a module ID or a path`);
    }
  }
});

test("every markdown cross-link under .agent/, .codex/workflows/, .claude/workflows/, and docs/aos/ resolves", () => {
  const report = validateLinks();
  assert.equal(report.errors.length, 0, report.errors.join("\n"));
});

test("every JSON Schema under .agent/schemas/ is structurally valid", () => {
  const report = validateSchemas();
  assert.equal(report.errors.length, 0, report.errors.join("\n"));
});

test("Codex and Claude Code entry points stay thin pointers, not duplicated workflow content", () => {
  const report = validateDuplication();
  assert.equal(report.errors.length, 0, report.errors.join("\n"));
});

test("manifest and package.json agree on the application version", () => {
  const manifest = loadManifest();
  const packageJson = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const packageLock = JSON.parse(readFileSync(path.join(repoRoot, "package-lock.json"), "utf8"));
  const metadata = readFileSync(path.join(repoRoot, "src/config/appMetadata.ts"), "utf8");
  const masterSpec = readFileSync(path.join(repoRoot, ".codex/release-1.4-aos/00-master-spec.md"), "utf8");
  assert.equal(manifest.applicationVersion, packageJson.version);
  assert.equal(packageLock.version, packageJson.version);
  assert.equal(packageLock.packages[""].version, packageJson.version);
  assert.match(metadata, new RegExp(`version: ["']${packageJson.version.replaceAll(".", "\\.")}["']`));
  assert.match(masterSpec, new RegExp(packageJson.version.replaceAll(".", "\\.")));
});
