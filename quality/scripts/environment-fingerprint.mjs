import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const lock = await readFile(path.join(root, "package-lock.json"));
const fingerprint = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  git: { sha: process.env.GITHUB_SHA ?? null, ref: process.env.GITHUB_REF ?? null, runId: process.env.GITHUB_RUN_ID ?? null, runAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null, job: process.env.GITHUB_JOB ?? null },
  runner: { os: os.platform(), release: os.release(), architecture: os.arch(), image: process.env.ImageOS ?? null, timezone: process.env.TZ ?? Intl.DateTimeFormat().resolvedOptions().timeZone, language: process.env.LANG ?? null },
  tools: { node: process.version, npmLockVersion: JSON.parse(lock.toString("utf8")).lockfileVersion, vite: packageJson.devDependencies.vite, playwright: packageJson.devDependencies["@playwright/test"], typescript: packageJson.devDependencies.typescript },
  inputs: { packageLockSha256: createHash("sha256").update(lock).digest("hex"), visualBaselineMode: process.env.VISUAL_BASELINE_MODE ?? null, workers: process.env.PW_WORKERS ?? null },
};
fingerprint.sha256 = createHash("sha256").update(JSON.stringify(fingerprint.runner) + JSON.stringify(fingerprint.tools) + JSON.stringify(fingerprint.inputs)).digest("hex");
const output = path.join(root, "quality", "runtime", "environment-fingerprint.json");
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(fingerprint, null, 2)}\n`);
console.log(JSON.stringify(fingerprint, null, 2));
