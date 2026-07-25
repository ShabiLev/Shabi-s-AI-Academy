import { spawnSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fingerprintFiles } from "./storage-manager.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const npmCli = process.env.npm_execpath ?? path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
const runs = Number(process.env.BUILD_DETERMINISM_RUNS ?? 3);
const evidence = [];
for (let index = 1; index <= runs; index += 1) {
  await rm(path.join(root, "dist"), { recursive: true, force: true });
  const result = spawnSync(process.execPath, [npmCli, "run", "build"], { cwd: root, encoding: "utf8", stdio: "pipe" });
  if (result.status !== 0) throw new Error(`Build ${index} failed: ${result.error?.message ?? ""}\n${result.stdout ?? ""}\n${result.stderr ?? ""}`);
  evidence.push({ run: index, files: await fingerprintFiles(path.join(root, "dist")) });
}
const reference = JSON.stringify(evidence[0].files);
const deterministic = evidence.every((run) => JSON.stringify(run.files) === reference);
const output = path.join(root, "quality", "runtime", "build-determinism.json");
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify({ schemaVersion: 1, runs, deterministic, evidence }, null, 2)}\n`);
console.log(`Build determinism: ${deterministic ? "PASS" : "FAIL"} (${runs} runs).`);
if (!deterministic) process.exitCode = 1;
