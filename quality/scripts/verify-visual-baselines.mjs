import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const snapshotRoot = path.join(root, "e2e", "specs", "__screenshots__");
const files = [];
async function visit(directory) {
  if (!existsSync(directory)) return;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await visit(absolute);
    else if (entry.name.endsWith(".png")) files.push(absolute);
  }
}
await visit(snapshotRoot);
const records = [];
const errors = [];
for (const absolute of files) {
  const content = await readFile(absolute);
  const png = content.length >= 24 && content.subarray(1, 4).toString() === "PNG";
  const width = png ? content.readUInt32BE(16) : 0;
  const height = png ? content.readUInt32BE(20) : 0;
  if (!png || width === 0 || height === 0) errors.push(`${path.relative(root, absolute)} is not a valid non-empty PNG`);
  records.push({ path: path.relative(root, absolute).replaceAll("\\", "/"), bytes: content.length, width, height, sha256: createHash("sha256").update(content).digest("hex") });
}
const hashes = new Map();
for (const record of records) {
  const group = hashes.get(record.sha256) ?? [];
  group.push(record);
  hashes.set(record.sha256, group);
}
const duplicates = [...hashes.values()].filter((group) => group.length > 1).map((group) => group.map((record) => record.path));
const report = { schemaVersion: 1, baselineCount: records.length, valid: errors.length === 0, errors, duplicateGroups: duplicates, records };
const output = path.join(root, "quality", "runtime", "visual-baseline-integrity.json");
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Visual baseline integrity: ${report.valid ? "PASS" : "FAIL"}; ${records.length} files; ${duplicates.length} duplicate groups.`);
if (!report.valid) process.exitCode = 1;
