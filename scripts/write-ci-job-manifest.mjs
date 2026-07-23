import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { computeContentDigest } from "./evidence-utils.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for CI provenance.`);
  return value;
};
const jobName = required("JOB_NAME");
const headSha = process.env.EXPECTED_HEAD_SHA || required("GITHUB_SHA");
const checkoutSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
if (checkoutSha !== headSha) throw new Error(`Checkout ${checkoutSha} does not match expected tested SHA ${headSha}.`);

const requestedRoots = String(process.env.ARTIFACT_PATHS ?? "")
  .split(/\r?\n/)
  .map((item) => item.trim())
  .filter(Boolean);
const files = [];
const visit = (absolute) => {
  if (!existsSync(absolute)) return;
  if (statSync(absolute).isDirectory()) {
    for (const entry of readdirSync(absolute).sort()) visit(path.join(absolute, entry));
  } else {
    files.push(path.relative(root, absolute).replaceAll("\\", "/"));
  }
};
for (const item of requestedRoots) {
  const absolute = path.resolve(root, item);
  if (path.relative(root, absolute).split(path.sep).includes(".."))
    throw new Error(`ARTIFACT_PATHS contains an unsafe path: ${item}`);
  visit(absolute);
}
if ((process.env.JOB_CONCLUSION || "unknown") === "success" && files.length === 0)
  throw new Error(`Successful job ${jobName} produced no declared artifact files.`);

const manifest = {
  schemaVersion: 1,
  repository: required("GITHUB_REPOSITORY"),
  workflowName: required("GITHUB_WORKFLOW"),
  workflowRunId: required("GITHUB_RUN_ID"),
  workflowRunAttempt: required("GITHUB_RUN_ATTEMPT"),
  headSha,
  sourceBranch: process.env.SOURCE_BRANCH || process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || "unknown",
  targetBranch: process.env.TARGET_BRANCH || process.env.GITHUB_BASE_REF || "main",
  eventName: required("GITHUB_EVENT_NAME"),
  generatedAt: new Date().toISOString(),
  jobName,
  conclusion: process.env.JOB_CONCLUSION || "unknown",
  nodeVersion: process.version,
  npmVersion: execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["--version"], { encoding: "utf8" }).trim(),
  files,
  contentDigest: computeContentDigest(root, files),
};
const output = path.join(root, "quality", "runtime", "ci", jobName, "manifest.json");
mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote runtime CI manifest for ${jobName} at ${headSha}.`);
