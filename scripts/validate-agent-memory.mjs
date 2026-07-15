import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { repoRoot } from "./aos-lib.mjs";
import { readJson, schemaPath, secretFindings, stateFiles, statePath, validateAgainstSchema } from "./agent-memory-lib.mjs";

export function validateAgentMemory() {
  const errors = [];
  const warnings = [];
  const loaded = {};
  for (const name of stateFiles) {
    const dataFile = statePath(name); const schemaFile = schemaPath(name);
    if (!existsSync(dataFile)) { errors.push(`Missing .agent/state/${name}.json`); continue; }
    if (!existsSync(schemaFile)) { errors.push(`Missing .agent/schemas/${name}.schema.json`); continue; }
    try {
      const raw = readFileSync(dataFile, "utf8");
      secretFindings(raw).forEach((finding) => errors.push(`${name}: sensitive/private pattern ${finding}`));
      loaded[name] = readJson(dataFile);
      errors.push(...validateAgainstSchema(loaded[name], readJson(schemaFile)).map((message) => `${name}: ${message}`));
    } catch (error) { errors.push(`${name}: malformed JSON/schema (${error.message})`); }
  }
  const branch = execFileSync("git", ["branch", "--show-current"], { cwd: repoRoot, encoding: "utf8" }).trim();
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
  const pkg = readJson(path.join(repoRoot, "package.json"));
  if (loaded["current-task"]?.branch !== branch) errors.push("current-task branch does not match Git");
  if (loaded["release-status"]?.version !== pkg.version) errors.push("release version does not match package.json");
  const tested = loaded["quality-status"]?.testedCommit;
  if (tested && tested !== head) warnings.push("quality-status testedCommit is stale; validation must not be shown as current");
  if (loaded["quality-status"]?.workingTreeCleanAtTest !== true) warnings.push("quality evidence was not captured from a clean tested tree; public status must remain non-green");
  const progress = loaded["current-progress"];
  if (progress) {
    const total = progress.requirements.completed + progress.requirements.partial + progress.requirements.missing;
    if (total === 0) errors.push("progress requirement total must be positive");
    const expected = Math.floor((progress.requirements.completed + progress.requirements.partial * 0.5) / total * 100);
    if (progress.overallPercent !== expected) errors.push(`progress percent ${progress.overallPercent} does not match requirement state ${expected}`);
    if (progress.blockers.length !== loaded["release-status"]?.releaseBlockers?.length) errors.push("progress/release blocker counts differ");
  }
  const actions = loaded["next-actions"]?.actions ?? [];
  const ids = new Set(actions.map((action) => action.id));
  for (const action of actions) for (const dependency of action.prerequisites ?? []) if (dependency.startsWith("ACTION-") && !ids.has(dependency)) errors.push(`${action.id}: unknown dependency ${dependency}`);
  const graph = new Map(actions.map((action) => [action.id, (action.prerequisites ?? []).filter((item) => ids.has(item))]));
  const visit = (id, stack = new Set()) => { if (stack.has(id)) return true; const next = new Set(stack).add(id); return (graph.get(id) ?? []).some((dep) => visit(dep, next)); };
  for (const id of ids) if (visit(id)) errors.push(`Circular next-action dependency involving ${id}`);
  return { ok: errors.length === 0, errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = validateAgentMemory();
  result.errors.forEach((item) => console.error(`ERROR: ${item}`));
  result.warnings.forEach((item) => console.warn(`WARN: ${item}`));
  console.log(`Agent memory: ${result.ok ? "valid" : "invalid"}; ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  process.exitCode = result.ok ? 0 : 1;
}
