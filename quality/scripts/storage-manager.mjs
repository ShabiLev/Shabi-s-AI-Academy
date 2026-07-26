import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
export const repositoryRoot = path.resolve(path.dirname(scriptPath), "..", "..");
const runtimeRoot = path.join(repositoryRoot, "quality", "runtime");
const executionRoot = path.join(runtimeRoot, "execution");
const protectedNames = new Set(["archived", "latest", "last-success", "last-failed"]);
export const thresholds = { warningBytes: 1_500_000_000, criticalBytes: 3_000_000_000, maxHistory: 100 };

export async function renameWithRetry(source, destination, operation = rename, options = {}) {
  const attempts = options.attempts ?? 5;
  const delayMs = options.delayMs ?? 100;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await operation(source, destination);
      return;
    } catch (error) {
      const retryable = error?.code === "EPERM" || error?.code === "EBUSY";
      if (!retryable || attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
}

const cleanupTargets = {
  clean: ["dist", "coverage", ".vite"],
  "clean:runtime": ["quality/runtime/storage-audit.md", "quality/runtime/storage-audit.json", "quality/runtime/storage-inventory.csv", "quality/runtime/execution/active"],
  "clean:quality": ["quality/execution/runs", "quality/runtime/execution/runs", "quality/runtime/execution/active"],
  "clean:visual": ["playwright-report", "test-results", "blob-report", "quality/runtime/visual-candidates", "quality/runtime/visual-actual", "quality/runtime/visual-diff"],
  "clean:reports": ["coverage", "playwright-report", "test-results", "blob-report"],
  "clean:generated": ["quality/generated"],
};
cleanupTargets["clean:all-generated"] = [...new Set(Object.values(cleanupTargets).flat())];

function insideRoot(target) {
  const absolute = path.resolve(repositoryRoot, target);
  if (absolute !== repositoryRoot && absolute.startsWith(`${repositoryRoot}${path.sep}`)) return absolute;
  throw new Error(`Refusing path outside repository: ${target}`);
}

export async function measure(target = repositoryRoot) {
  const summary = { bytes: 0, files: 0, directories: 0, errors: [] };
  async function visit(current) {
    try {
      const entry = await stat(current);
      if (!entry.isDirectory()) { summary.bytes += entry.size; summary.files += 1; return; }
      summary.directories += 1;
      for (const child of await readdir(current)) await visit(path.join(current, child));
    } catch (error) { summary.errors.push({ path: current, message: String(error?.message ?? error) }); }
  }
  if (existsSync(target)) await visit(target);
  return summary;
}

export async function auditStorage(outputDirectory = runtimeRoot) {
  const areas = {};
  for (const relative of ["quality", "quality/execution", "quality/runtime", "playwright-report", "test-results", "coverage", "dist"]) {
    areas[relative] = await measure(insideRoot(relative));
  }
  const result = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    thresholds,
    repository: await measure(repositoryRoot),
    areas,
    status: areas.quality.bytes >= thresholds.criticalBytes ? "critical" : areas.quality.bytes >= thresholds.warningBytes ? "warning" : "ok",
  };
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, "storage-audit.json"), `${JSON.stringify(result, null, 2)}\n`);
  const lines = ["# Quality storage audit", "", `Generated: ${result.generatedAt}`, `Status: **${result.status}**`, "", "| Area | Bytes | Files |", "| --- | ---: | ---: |", ...Object.entries(areas).map(([area, value]) => `| \`${area}\` | ${value.bytes} | ${value.files} |`), "", "Baselines, archives, configuration, inventory, and human-approved evidence are outside every automatic cleanup target.", ""];
  await writeFile(path.join(outputDirectory, "storage-audit.md"), lines.join("\n"));
  return result;
}

async function safeRemove(absolute, dryRun, results) {
  if (!existsSync(absolute)) { results.push({ path: path.relative(repositoryRoot, absolute), action: "skip-missing" }); return; }
  results.push({ path: path.relative(repositoryRoot, absolute), action: dryRun ? "would-remove" : "removed" });
  if (!dryRun) await rm(absolute, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 });
}

export async function clean(command, { dryRun = false } = {}) {
  const targets = cleanupTargets[command];
  if (!targets) throw new Error(`Unknown cleanup command: ${command}`);
  const results = [];
  for (const target of targets) await safeRemove(insideRoot(target), dryRun, results);
  return { command, dryRun, results };
}

async function runStatus(directory) {
  for (const name of ["summary.json", "run-summary.json", "metadata.json"]) {
    try {
      const value = JSON.parse(await readFile(path.join(directory, name), "utf8"));
      if (Array.isArray(value.failedCommands)) return value.failedCommands.length === 0 ? "success" : "failed";
      const status = String(value.status ?? value.overallStatus ?? value.result ?? "").toLowerCase();
      if (status.includes("pass") || status.includes("success")) return "success";
      if (status.includes("fail") || status.includes("error")) return "failed";
    } catch { /* Try the next known metadata file. */ }
  }
  return "unknown";
}

export async function applyRetention({ dryRun = false } = {}) {
  const results = [];
  const candidates = [];
  const runsRoots = [path.join(executionRoot, "runs"), path.join(repositoryRoot, "quality", "execution", "runs")];
  for (const runsRoot of runsRoots) {
    if (!existsSync(runsRoot)) continue;
    for (const name of await readdir(runsRoot)) {
      const absolute = path.join(runsRoot, name);
      const info = await stat(absolute);
      if (info.isDirectory()) candidates.push({ name: `${path.basename(path.dirname(runsRoot))}-${name}`, absolute, mtimeMs: info.mtimeMs, status: await runStatus(absolute) });
    }
  }
  if (!candidates.length) return { dryRun, results };
  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  const keep = new Map();
  if (candidates[0]) keep.set(candidates[0].name, "latest");
  const success = candidates.find((run) => run.status === "success" && !keep.has(run.name));
  const failed = candidates.find((run) => run.status === "failed" && !keep.has(run.name));
  if (success) keep.set(success.name, "last-success");
  if (failed) keep.set(failed.name, "last-failed");
  await mkdir(executionRoot, { recursive: true });
  for (const run of candidates) {
    const destinationName = keep.get(run.name);
    if (!destinationName) {
      await safeRemove(run.absolute, dryRun, results);
      continue;
    }
    const destination = path.join(executionRoot, destinationName);
    results.push({ path: path.relative(repositoryRoot, run.absolute), action: dryRun ? `would-move-to-${destinationName}` : `moved-to-${destinationName}` });
    if (!dryRun) {
      if (existsSync(destination)) await rm(destination, { recursive: true, force: true });
      await renameWithRetry(run.absolute, destination);
    }
  }
  if (!dryRun) for (const runsRoot of runsRoots) {
    if (existsSync(runsRoot) && (await readdir(runsRoot)).length === 0) await rm(runsRoot, { recursive: true, force: true });
  }
  const indexPath = path.join(runtimeRoot, "history", "run-index.json");
  if (existsSync(indexPath)) {
    try {
      const index = JSON.parse(await readFile(indexPath, "utf8"));
      if (Array.isArray(index.runs) && index.runs.length > thresholds.maxHistory && !dryRun) {
        index.runs = index.runs.slice(-thresholds.maxHistory);
        await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);
      }
    } catch { results.push({ path: path.relative(repositoryRoot, indexPath), action: "invalid-history-index" }); }
  }
  return { dryRun, results };
}

export async function verifyRetention() {
  const violations = [];
  const runsRoot = path.join(executionRoot, "runs");
  if (existsSync(runsRoot) && (await readdir(runsRoot)).length) violations.push("legacy execution/runs is not empty");
  for (const name of await readdir(executionRoot, { withFileTypes: true }).catch(() => [])) {
    if (name.isDirectory() && !protectedNames.has(name.name) && name.name !== "active") violations.push(`unexpected execution directory: ${name.name}`);
  }
  const metrics = await measure(runtimeRoot);
  return { ok: violations.length === 0, violations, metrics, warning: metrics.bytes >= thresholds.warningBytes };
}

export async function fingerprintFiles(directory) {
  const files = [];
  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else {
        const content = await readFile(absolute);
        files.push({ path: path.relative(directory, absolute).replaceAll("\\", "/"), bytes: content.length, sha256: createHash("sha256").update(content).digest("hex") });
      }
    }
  }
  if (existsSync(directory)) await visit(directory);
  files.sort((a, b) => a.path.localeCompare(b.path));
  return files;
}

async function cli() {
  const [command = "audit", ...args] = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  let result;
  if (command === "audit") result = await auditStorage();
  else if (command === "retention:apply") result = await applyRetention({ dryRun });
  else if (command === "retention:verify") result = await verifyRetention();
  else result = await clean(command, { dryRun });
  console.log(JSON.stringify(result, null, 2));
  if (command === "retention:verify" && !result.ok) process.exitCode = 1;
}

if (path.resolve(process.argv[1] ?? "") === scriptPath) await cli();
