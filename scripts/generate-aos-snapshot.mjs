import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { repoRoot, loadManifest, loadRegistry } from "./aos-lib.mjs";
import { runAll } from "./validate-aos.mjs";

const OUT_DIR = path.join(repoRoot, "public", "generated");
const OUT_FILE = path.join(OUT_DIR, "aos-snapshot.json");

function readJsonSafe(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function countFilesIn(relDir) {
  const dir = path.join(repoRoot, relDir);
  if (!existsSync(dir)) return 0;
  const visit = (current) => readdirSync(current, { withFileTypes: true })
    .reduce((total, entry) => total + (entry.isDirectory()
      ? visit(path.join(current, entry.name))
      : Number(entry.name.endsWith(".json"))), 0);
  return visit(dir);
}

function currentBranch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { cwd: repoRoot }).toString().trim();
  } catch {
    return null;
  }
}

function currentCommit() {
  try {
    return execSync("git rev-parse HEAD", { cwd: repoRoot }).toString().trim();
  } catch {
    return null;
  }
}

function workingTreeDirty() {
  try {
    return Boolean(execSync("git status --porcelain=v1", { cwd: repoRoot }).toString().trim());
  } catch {
    return true;
  }
}

function buildMemorySummary(commit) {
  const runtimeStateDir = path.join(repoRoot, ".agent", "runtime", "state");
  const runtimeAvailable = existsSync(path.join(runtimeStateDir, "current-task.json"));
  const readState = (name) => readJsonSafe(path.join(runtimeStateDir, `${name}.json`)) ?? {};
  const task = readState("current-task");
  const progress = readState("current-progress");
  const release = readState("release-status");
  const issues = readState("known-issues");
  const quality = readState("quality-status");
  const research = readState("research-progress");
  const handoff = readState("latest-handoff");
  const actions = readState("next-actions").actions ?? [];
  const evidenceCurrent = quality.testedCommit === commit && quality.workingTreeCleanAtTest === true && !workingTreeDirty();
  return {
    available: runtimeAvailable,
    currentTask: task.task ?? null,
    currentPhase: progress.currentPhase ?? null,
    releaseState: release.releaseState ?? "unverified",
    completionPercent: progress.overallPercent ?? 0,
    requirements: progress.requirements ?? { completed: 0, partial: 0, missing: 0 },
    blockers: (progress.blockers ?? []).slice(0, 10),
    blockerCount: (progress.blockers ?? []).length,
    knownIssueCount: (issues.active ?? []).length,
    latestEvidenceRunId: quality.latestRunId ?? null,
    testedCommit: quality.testedCommit ?? null,
    evidenceCurrent,
    coverage: quality.coverage?.statements?.percent ?? null,
    research: {
      sources: research.sources ?? 0,
      candidatesPendingReview: research.candidatesPendingReview ?? 0,
      publishedItems: research.publishedItems ?? 0,
    },
    nextActions: actions.slice(0, 10).map(({ id, title, priority, requiredRole, status }) => ({ id, title, priority, requiredRole, status })),
    nextAction: actions.find((action) => action.status !== "completed")?.title ?? null,
    handoff: { status: handoff.status ?? null, summary: handoff.summary ?? null, updatedAt: handoff.generatedAt ?? handoff.updatedAt ?? null },
    updatedAt: progress.generatedAt ?? progress.updatedAt ?? null,
  };
}

function buildEvidenceSummary() {
  const summaryPath = path.join(repoRoot, "quality", "runtime", "execution", "latest", "summary.json");
  const summary = readJsonSafe(summaryPath);
  if (!summary) {
    return { available: false };
  }
  const results = summary.results ?? {};
  const gateNames = Object.keys(results);
  const passed = gateNames.filter((k) => results[k]?.status === "passed");
  const failed = gateNames.filter((k) => results[k]?.status === "failed");
  const notAvailable = gateNames.filter((k) => results[k]?.status === "notAvailable" || results[k]?.status === "notRun");
  return {
    available: true,
    runId: summary.identity?.runId ?? null,
    profile: summary.identity?.profile ?? null,
    startedAt: summary.identity?.startedAt ?? null,
    endedAt: summary.identity?.endedAt ?? null,
    version: summary.identity?.version ?? null,
    branch: summary.identity?.branch ?? null,
    startingCommit: summary.identity?.startingCommit ?? null,
    finalCommit: summary.identity?.finalCommit ?? null,
    gateCount: gateNames.length,
    passedCount: passed.length,
    failedCount: failed.length,
    notAvailableCount: notAvailable.length,
    failedGates: failed,
  };
}

function buildResearchSummary() {
  return {
    sources: countFilesIn("research/sources"),
    claims: countFilesIn("research/claims"),
    candidates: countFilesIn("research/candidates"),
    reviews: countFilesIn("research/reviews"),
    published: countFilesIn("research/published"),
  };
}

function buildModuleSummary(manifest) {
  const modules = manifest.modules ?? [];
  const byCategory = {};
  for (const mod of modules) {
    byCategory[mod.category] = (byCategory[mod.category] ?? 0) + 1;
  }
  return {
    total: modules.length,
    byCategory,
    items: modules.map((m) => ({
      id: m.id,
      title: m.title,
      category: m.category,
      status: m.status,
      requiredFor: m.requiredFor,
    })),
  };
}

function buildValidationSummary() {
  const reports = runAll();
  return reports.map((r) => ({
    name: r.name,
    errorCount: r.errors.length,
    warningCount: r.warnings.length,
    errors: r.errors.slice(0, 20),
    warnings: r.warnings.slice(0, 20),
  }));
}

export function buildSnapshot() {
  const manifest = loadManifest();
  const registry = loadRegistry();
  const validation = buildValidationSummary();
  const totalErrors = validation.reduce((sum, r) => sum + r.errorCount, 0);

  const commit = currentCommit();
  const memory = buildMemorySummary(commit);
  return {
    generatedAt: new Date().toISOString(),
    aosVersion: manifest.aosVersion,
    applicationVersion: manifest.applicationVersion,
    schemaVersion: manifest.schemaVersion,
    supportedAgents: manifest.supportedAgents,
    branch: currentBranch(),
    commit,
    modules: buildModuleSummary(manifest),
    taskTypes: Object.keys(registry.taskTypes ?? {}),
    evidence: buildEvidenceSummary(),
    research: buildResearchSummary(),
    validation: {
      totalErrors,
      totalChecks: validation.length,
      checks: validation,
    },
    memory,
    activeHandoff: memory.handoff.status ? memory.handoff : null,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const snapshot = buildSnapshot();
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(snapshot, null, 2), "utf8");
  console.log(`Wrote ${path.relative(repoRoot, OUT_FILE)}`);
  console.log(`Modules: ${snapshot.modules.total}, validation errors: ${snapshot.validation.totalErrors}`);
}
