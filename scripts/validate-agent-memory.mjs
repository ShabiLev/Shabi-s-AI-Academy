import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { repoRoot } from "./aos-lib.mjs";
import {
  isValidBranchContext,
  readJson,
  resolveGitContext,
  schemaPath,
  secretFindings,
  stateFiles,
  statePath,
  validateAgainstSchema,
} from "./agent-memory-lib.mjs";

export function validateAgentMemory() {
  const errors = [];
  const warnings = [];
  const loaded = {};
  if (!existsSync(statePath("current-task"))) {
    return {
      ok: true,
      errors: [],
      warnings: ["Agent runtime state is not generated; current status is unverified."],
    };
  }
  for (const name of stateFiles) {
    const dataFile = statePath(name);
    const schemaFile = schemaPath(name);
    if (!existsSync(dataFile)) {
      errors.push(`Missing .agent/runtime/state/${name}.json`);
      continue;
    }
    if (!existsSync(schemaFile)) {
      errors.push(`Missing .agent/schemas/${name}.schema.json`);
      continue;
    }
    try {
      const raw = readFileSync(dataFile, "utf8");
      secretFindings(raw).forEach((finding) =>
        errors.push(`${name}: sensitive/private pattern ${finding}`),
      );
      loaded[name] = readJson(dataFile);
      errors.push(
        ...validateAgainstSchema(loaded[name], readJson(schemaFile)).map(
          (message) => `${name}: ${message}`,
        ),
      );
    } catch (error) {
      errors.push(`${name}: malformed JSON/schema (${error.message})`);
    }
  }
  const runtime = resolveGitContext();
  const head = runtime.testedCommit;
  const pkg = readJson(path.join(repoRoot, "package.json"));
  const contextualStates = [
    "current-task",
    "current-progress",
    "project-status",
    "release-status",
    "latest-handoff",
  ];
  for (const name of contextualStates) {
    const state = loaded[name];
    if (!state) continue;
    for (const field of ["sourceBranch", "runtimeBranch", "targetBranch"]) {
      if (
        !isValidBranchContext(state[field], {
          allowSentinel: field !== "targetBranch",
        })
      )
        errors.push(`${name}: invalid ${field}`);
    }
    if (state.testedCommit !== loaded["current-task"]?.testedCommit)
      errors.push(`${name}: testedCommit differs from current-task evidence`);
    if (state.verificationSource !== loaded["current-task"]?.verificationSource)
      errors.push(`${name}: verificationSource differs from current-task evidence`);
    const impossibleContext =
      (state.executionContext === "localMain" && state.runtimeBranch !== "main") ||
      (state.executionContext === "localFeature" && ["main", "detached", "unknown"].includes(state.runtimeBranch)) ||
      (state.executionContext === "detachedHead" && state.runtimeBranch !== "detached") ||
      (state.executionContext === "githubMergeRef" && !/^\d+\/merge$/.test(state.runtimeBranch));
    if (impossibleContext)
      errors.push(`${name}: impossible executionContext/runtimeBranch combination`);
  }
  if (loaded["current-task"]?.runtimeBranch !== runtime.runtimeBranch)
    warnings.push(
      "checked-in runtimeBranch differs from runtime Git context; this is historical state, not a validation failure",
    );
  if (loaded["release-status"]?.version !== pkg.version)
    errors.push("release version does not match package.json");
  const tested = loaded["quality-status"]?.testedCommit;
  if (tested && tested !== loaded["current-task"]?.testedCommit)
    warnings.push(
      "quality-status testedCommit is stale relative to Agent Memory; validation must not be shown as current",
    );
  if (loaded["current-task"]?.testedCommit !== head)
    warnings.push(
      "Agent runtime testedCommit differs from HEAD; status must remain unverified",
    );
  if (loaded["quality-status"]?.workingTreeCleanAtTest !== true)
    warnings.push(
      "quality evidence was not captured from a clean tested tree; public status must remain non-green",
    );
  const progress = loaded["current-progress"];
  if (progress) {
    const total =
      progress.requirements.completed +
      progress.requirements.partial +
      progress.requirements.missing;
    if (total === 0) errors.push("progress requirement total must be positive");
    const expected = Math.floor(
      ((progress.requirements.completed + progress.requirements.partial * 0.5) /
        total) *
        100,
    );
    if (progress.overallPercent !== expected)
      errors.push(
        `progress percent ${progress.overallPercent} does not match requirement state ${expected}`,
      );
    if (
      progress.blockers.length !==
      loaded["release-status"]?.releaseBlockers?.length
    )
      errors.push("progress/release blocker counts differ");
    if (progress.blockers.length > 0 && ["ready", "released"].includes(loaded["release-status"]?.releaseState))
      errors.push("release state cannot be ready while blockers remain");
  }
  const pathValues = [];
  const collectPaths = (value, key = "") => {
    if (Array.isArray(value)) return value.forEach((item) => collectPaths(item, key));
    if (value && typeof value === "object")
      return Object.entries(value).forEach(([childKey, child]) => collectPaths(child, childKey));
    if (typeof value === "string" && /path|filesbeingchanged/i.test(key)) pathValues.push(value);
  };
  Object.values(loaded).forEach((value) => collectPaths(value));
  for (const value of pathValues) {
    if (/^(?:quality\/?|\.agent\/?)$/i.test(value) || value.includes("\\") || /^[A-Za-z]:/.test(value))
      errors.push(`malformed or unsafe tracked path: ${value}`);
  }
  const actions = loaded["next-actions"]?.actions ?? [];
  const ids = new Set(actions.map((action) => action.id));
  for (const action of actions)
    for (const dependency of action.prerequisites ?? [])
      if (dependency.startsWith("ACTION-") && !ids.has(dependency))
        errors.push(`${action.id}: unknown dependency ${dependency}`);
  const graph = new Map(
    actions.map((action) => [
      action.id,
      (action.prerequisites ?? []).filter((item) => ids.has(item)),
    ]),
  );
  const visit = (id, stack = new Set()) => {
    if (stack.has(id)) return true;
    const next = new Set(stack).add(id);
    return (graph.get(id) ?? []).some((dep) => visit(dep, next));
  };
  for (const id of ids)
    if (visit(id))
      errors.push(`Circular next-action dependency involving ${id}`);
  return {
    ok: errors.length === 0,
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = validateAgentMemory();
  result.errors.forEach((item) => console.error(`ERROR: ${item}`));
  result.warnings.forEach((item) => console.warn(`WARN: ${item}`));
  console.log(
    `Agent memory: ${result.ok ? "valid" : "invalid"}; ${result.errors.length} errors, ${result.warnings.length} warnings.`,
  );
  process.exitCode = result.ok ? 0 : 1;
}
