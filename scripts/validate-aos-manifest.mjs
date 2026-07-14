import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  repoRoot,
  loadManifest,
  loadRegistry,
  Reporter,
  fileExists,
} from "./aos-lib.mjs";

const REQUIRED_MODULE_FIELDS = [
  "id",
  "path",
  "title",
  "purpose",
  "category",
  "requiredFor",
  "dependsOn",
  "version",
  "owner",
  "status",
];

const REQUIRED_MANIFEST_FIELDS = [
  "aosVersion",
  "applicationVersion",
  "schemaVersion",
  "defaultEntryPoint",
  "supportedAgents",
  "modules",
  "requiredModules",
  "optionalModules",
  "compatibilityFiles",
  "evidencePath",
  "researchPath",
  "securityPath",
  "releasePath",
  "lastUpdated",
  "checksumStrategy",
];

export function validateManifest() {
  const report = new Reporter("AOS manifest validation");
  const manifest = loadManifest();
  const registry = loadRegistry();

  for (const field of REQUIRED_MANIFEST_FIELDS) {
    if (!(field in manifest)) report.error(`manifest.json missing required field "${field}"`);
  }

  const seenIds = new Map();
  const byId = new Map();
  for (const [index, mod] of (manifest.modules ?? []).entries()) {
    const loc = `modules[${index}]${mod?.id ? ` (${mod.id})` : ""}`;
    for (const field of REQUIRED_MODULE_FIELDS) {
      if (!(field in mod)) report.error(`${loc} missing required field "${field}"`);
    }
    if (!mod.id) continue;
    if (seenIds.has(mod.id)) {
      report.error(`Duplicate module ID "${mod.id}" (also at modules[${seenIds.get(mod.id)}])`);
    }
    seenIds.set(mod.id, index);
    byId.set(mod.id, mod);

    if (mod.path && !fileExists(mod.path)) {
      report.error(`${loc}: path "${mod.path}" does not exist on disk (missing module)`);
    }
  }

  // Dependency resolution + circular dependency detection.
  const visiting = new Set();
  const visited = new Set();
  function visit(id, chain) {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      report.error(`Circular dependency: ${[...chain, id].join(" -> ")}`);
      return;
    }
    const mod = byId.get(id);
    if (!mod) return;
    visiting.add(id);
    for (const dep of mod.dependsOn ?? []) {
      if (!byId.has(dep)) {
        report.error(`${id}: dependsOn references unknown module "${dep}" (missing dependency)`);
        continue;
      }
      visit(dep, [...chain, id]);
    }
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of byId.keys()) visit(id, []);

  // Orphan modules: not reachable from registry.json (as a task-type entry,
  // requiredModules/optionalModules, or as a dependsOn target of another module).
  const referenced = new Set([
    ...(manifest.requiredModules ?? []),
    ...(manifest.optionalModules ?? []),
  ]);
  for (const list of Object.values(registry.taskTypes ?? {})) {
    for (const entry of list) referenced.add(entry);
  }
  for (const mod of byId.values()) {
    for (const dep of mod.dependsOn ?? []) referenced.add(dep);
  }
  for (const id of byId.keys()) {
    if (!referenced.has(id)) {
      report.warn(`Module "${id}" is not referenced by registry.json or any other module's dependsOn (possible orphan module)`);
    }
  }

  // Missing task mapping: registry entries that reference a module id that
  // isn't in the manifest AND isn't a literal known path under .agent/ or is
  // otherwise unresolvable.
  for (const [taskType, entries] of Object.entries(registry.taskTypes ?? {})) {
    for (const entry of entries) {
      const resolvesToModule = byId.has(entry);
      const resolvesToPath =
        entry.endsWith(".md") && fileExists(path.posix.join(".agent", entry));
      if (!resolvesToModule && !resolvesToPath) {
        report.warn(
          `registry.json taskTypes.${taskType}: "${entry}" does not resolve to a manifest module ID nor an existing .agent/<entry> path (orphan task mapping)`,
        );
      }
    }
  }

  // Unsupported agent references.
  const supported = new Set(manifest.supportedAgents ?? []);
  for (const file of manifest.compatibilityFiles ?? []) {
    if (!fileExists(file)) report.error(`compatibilityFiles entry "${file}" does not exist`);
  }
  if (!supported.has("codex") || !supported.has("claude-code")) {
    report.warn("supportedAgents should include both \"codex\" and \"claude-code\"");
  }

  // Stale version reference: manifest vs .agent/VERSION and package.json.
  try {
    const aosVersionFile = readFileSync(path.join(repoRoot, ".agent/VERSION"), "utf8").trim();
    if (aosVersionFile !== manifest.aosVersion) {
      report.error(
        `.agent/VERSION ("${aosVersionFile}") does not match manifest.aosVersion ("${manifest.aosVersion}") — stale version reference`,
      );
    }
  } catch {
    report.error(".agent/VERSION could not be read");
  }
  try {
    const pkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
    if (pkg.version !== manifest.applicationVersion) {
      report.error(
        `package.json version ("${pkg.version}") does not match manifest.applicationVersion ("${manifest.applicationVersion}") — stale version reference`,
      );
    }
  } catch {
    report.error("package.json could not be read");
  }

  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = validateManifest();
  report.print();
  process.exit(report.ok ? 0 : 1);
}
