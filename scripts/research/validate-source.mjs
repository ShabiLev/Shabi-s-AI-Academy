import { pathToFileURL } from "node:url";
import path from "node:path";
import { statSync } from "node:fs";
import { jsonFilesIn, readJsonSafe, repoRoot } from "./research-lib.mjs";

const REQUIRED_FIELDS = [
  "id",
  "title",
  "sourceType",
  "url",
  "publicationDate",
  "retrievalDate",
  "license",
  "qualityTier",
];

const VALID_TIERS = ["tier1", "tier2", "tier3", "tier4"];
const VALID_SOURCE_TYPES = new Set([
  "officialSpec", "peerReviewedPaper", "officialRepository", "standardsBody",
  "securityAdvisory", "engineeringOrgBlog", "researchLabReport",
  "technicalPublication", "maintainerArticle", "independentExpert",
  "conferenceTalk", "communityDoc", "githubDiscussion", "forumPost",
  "socialMedia", "unverifiedTutorial", "anonymousContent", "newsArticle",
  "releaseNote", "benchmark", "marketingMaterial", "other",
]);
const MAX_SOURCE_RECORD_BYTES = 256 * 1024;

export function validateSources() {
  const files = jsonFilesIn("sources");
  const errors = [];
  const ids = new Map();

  for (const file of files) {
    const rel = path.relative(repoRoot, file);
    if (statSync(file).size > MAX_SOURCE_RECORD_BYTES) {
      errors.push(`${rel}: source record exceeds ${MAX_SOURCE_RECORD_BYTES} bytes`);
      continue;
    }
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
    if (data.sourceType && !VALID_SOURCE_TYPES.has(data.sourceType)) {
      errors.push(`${rel}: unsupported sourceType "${data.sourceType}"`);
    }
    if (data.url) {
      try {
        const url = new URL(data.url);
        if (url.protocol !== "https:") errors.push(`${rel}: source URL must use https`);
        if (url.username || url.password) errors.push(`${rel}: source URL must not contain credentials`);
      } catch {
        errors.push(`${rel}: source URL is invalid`);
      }
    }
    for (const field of ["publicationDate", "retrievalDate"]) {
      if (data[field] && Number.isNaN(Date.parse(data[field]))) {
        errors.push(`${rel}: ${field} is not a valid ISO date`);
      }
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
