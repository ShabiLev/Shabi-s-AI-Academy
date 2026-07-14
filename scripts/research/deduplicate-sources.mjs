import { pathToFileURL } from "node:url";
import path from "node:path";
import { jsonFilesIn, readJsonSafe, repoRoot } from "./research-lib.mjs";

function normalizeUrl(url) {
  if (!url) return null;
  return url.trim().toLowerCase().replace(/\/+$/, "").replace(/^https?:\/\//, "");
}

function normalizeTitle(title) {
  if (!title) return null;
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

// Reports likely duplicates; never merges or deletes automatically — a
// source file may only be removed by a human or agent decision recorded in
// research/reviews/.
export function findDuplicates() {
  const files = jsonFilesIn("sources");
  const byUrl = new Map();
  const byTitle = new Map();
  const duplicates = [];

  for (const file of files) {
    const rel = path.relative(repoRoot, file);
    const { ok, data } = readJsonSafe(file);
    if (!ok) continue;

    const url = normalizeUrl(data.url);
    if (url) {
      if (byUrl.has(url)) duplicates.push({ reason: "same URL", a: byUrl.get(url), b: rel });
      else byUrl.set(url, rel);
    }
    const title = normalizeTitle(data.title);
    if (title) {
      if (byTitle.has(title)) duplicates.push({ reason: "same title", a: byTitle.get(title), b: rel });
      else byTitle.set(title, rel);
    }
  }

  return { fileCount: files.length, duplicates };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { fileCount, duplicates } = findDuplicates();
  console.log(`Checked ${fileCount} source file(s) for duplicates.`);
  for (const d of duplicates) console.log(`POSSIBLE DUPLICATE (${d.reason}): ${d.a} <-> ${d.b}`);
  if (duplicates.length === 0) console.log("No duplicates found.");
  process.exit(0);
}
