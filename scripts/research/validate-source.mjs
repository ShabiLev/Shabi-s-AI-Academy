import { pathToFileURL } from "node:url";
import path from "node:path";
import { jsonFilesIn, readJsonSafe, repoRoot } from "./research-lib.mjs";

const REQUIRED_FIELDS = [
  "id",
  "title",
  "sourceType",
  "url",
  "retrievalDate",
  "qualityTier",
];

const VALID_TIERS = ["tier1", "tier2", "tier3", "tier4"];

export function validateSources() {
  const files = jsonFilesIn("sources");
  const errors = [];
  const ids = new Map();

  for (const file of files) {
    const rel = path.relative(repoRoot, file);
    const { ok, data, error } = readJsonSafe(file);
    if (!ok) {
      errors.push(`${rel}: invalid JSON — ${error}`);
      continue;
    }
    for (const field of REQUIRED_FIELDS) {
      if (!(field in data) || data[field] === "") {
        errors.push(`${rel}: missing required field "${field}"`);
      }
    }
    if (data.qualityTier && !VALID_TIERS.includes(data.qualityTier)) {
      errors.push(`${rel}: qualityTier "${data.qualityTier}" is not one of ${VALID_TIERS.join(", ")}`);
    }
    if (data.id) {
      if (ids.has(data.id)) errors.push(`${rel}: duplicate source id "${data.id}" (also in ${ids.get(data.id)})`);
      ids.set(data.id, rel);
    }
  }

  return { fileCount: files.length, errors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { fileCount, errors } = validateSources();
  console.log(`Checked ${fileCount} source file(s) under research/sources/.`);
  for (const e of errors) console.log(`ERROR: ${e}`);
  if (fileCount === 0) console.log("No sources yet — this is expected on a fresh checkout.");
  process.exit(errors.length === 0 ? 0 : 1);
}
