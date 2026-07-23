import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const summaryPath = path.join(root, "quality", "runtime", "execution", "latest", "summary.json");

if (!existsSync(summaryPath)) {
  console.error("No runtime evidence exists. Run a quality:evidence profile first.");
  process.exit(1);
}

const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
if (!summary.identity?.testedCommit) {
  console.error("Runtime evidence is missing testedCommit.");
  process.exit(1);
}

console.log(
  `Evidence finalization is not required: runtime evidence already identifies tested SHA ${summary.identity.testedCommit}.`,
);
