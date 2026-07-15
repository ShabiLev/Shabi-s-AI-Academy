import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { repoRoot, loadManifest, loadRegistry } from "./aos-lib.mjs";
import { runAll } from "./validate-aos.mjs";

function countByCategory(modules) {
  const counts = {};
  for (const mod of modules) {
    counts[mod.category] = (counts[mod.category] ?? 0) + 1;
  }
  return counts;
}

export function buildReport() {
  const manifest = loadManifest();
  const registry = loadRegistry();
  const reports = runAll();
  const totalErrors = reports.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = reports.reduce((sum, r) => sum + r.warnings.length, 0);
  const counts = countByCategory(manifest.modules ?? []);

  const lines = [];
  lines.push(`# AOS Status Report`);
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`AOS version: ${manifest.aosVersion}`);
  lines.push(`Application version: ${manifest.applicationVersion}`);
  lines.push(`Total modules: ${manifest.modules?.length ?? 0}`);
  lines.push("");
  lines.push(`## Modules by category`);
  lines.push("");
  for (const [category, count] of Object.entries(counts).sort()) {
    lines.push(`- ${category}: ${count}`);
  }
  lines.push("");
  lines.push(`## Task types covered`);
  lines.push("");
  for (const taskType of Object.keys(registry.taskTypes ?? {}).sort()) {
    lines.push(`- ${taskType}: ${registry.taskTypes[taskType].length} module(s)`);
  }
  lines.push("");
  lines.push(`## Validation`);
  lines.push("");
  lines.push(`${totalErrors} error(s), ${totalWarnings} warning(s) across ${reports.length} checks.`);
  for (const report of reports) {
    lines.push("");
    lines.push(`### ${report.name}`);
    if (report.errors.length === 0 && report.warnings.length === 0) {
      lines.push("OK");
    } else {
      for (const e of report.errors) lines.push(`- ERROR: ${e}`);
      for (const w of report.warnings) lines.push(`- WARN: ${w}`);
    }
  }
  lines.push("");
  return {
    text: lines.join("\n"),
    generatedAt: new Date().toISOString(),
    aosVersion: manifest.aosVersion,
    applicationVersion: manifest.applicationVersion,
    totalModules: manifest.modules?.length ?? 0,
    modulesByCategory: counts,
    totalErrors,
    totalWarnings,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = buildReport();
  const { text, totalErrors } = report;
  console.log(text);
  const outputDirectory = path.join(repoRoot, "quality", "generated");
  const markdownPath = path.join(outputDirectory, "aos-report.md");
  const jsonPath = path.join(outputDirectory, "aos-report.json");
  try {
    mkdirSync(outputDirectory, { recursive: true });
    writeFileSync(markdownPath, text, "utf8");
    writeFileSync(jsonPath, `${JSON.stringify({ ...report, text: undefined }, null, 2)}\n`, "utf8");
    console.log(`\nSaved to ${path.relative(repoRoot, markdownPath)} and ${path.relative(repoRoot, jsonPath)}`);
  } catch (err) {
    console.log(`\nCould not save report file: ${err.message}`);
  }
  process.exit(totalErrors === 0 ? 0 : 1);
}
