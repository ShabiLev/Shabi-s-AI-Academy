import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { repoRoot } from "./aos-lib.mjs";
import { readJson, statePath } from "./agent-memory-lib.mjs";
import { validateAgentMemory } from "./validate-agent-memory.mjs";

const progress = readJson(statePath("current-progress"));
const release = readJson(statePath("release-status"));
const quality = readJson(statePath("quality-status"));
const actions = readJson(statePath("next-actions"));
const validation = validateAgentMemory();
const report = `# Agent Memory Report\n\nGenerated: ${new Date().toISOString()}\n\n- Validation: ${validation.ok ? "passed" : "failed"}\n- Release: ${release.releaseState}\n- Progress: ${progress.overallPercent}% (${progress.currentPhase})\n- Blockers: ${release.releaseBlockers.length}\n- Latest evidence: ${quality.latestRunId ?? "not available"}\n- Next action: ${actions.actions.find((action) => action.status !== "completed")?.title ?? "None"}\n- Warnings: ${validation.warnings.length}\n`;
const out = path.join(repoRoot, "quality", "generated", "agent-memory-report.md");
mkdirSync(path.dirname(out), { recursive: true }); writeFileSync(out, report, "utf8");
console.log(`Wrote ${path.relative(repoRoot, out)}`);
