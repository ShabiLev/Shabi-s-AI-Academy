import { readFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(__dirname, "..", "..");
export const researchRoot = path.join(repoRoot, "research");

export function jsonFilesIn(subdir) {
  const dir = path.join(researchRoot, subdir);
  if (!existsSync(dir)) return [];
  const visit = (current) => readdirSync(current, { withFileTypes: true })
    .flatMap((entry) => entry.isDirectory()
      ? visit(path.join(current, entry.name))
      : entry.name.endsWith(".json") ? [path.join(current, entry.name)] : []);
  return visit(dir).sort();
}

export function readJsonSafe(file) {
  try {
    return { ok: true, data: JSON.parse(readFileSync(file, "utf8")) };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export function ensureDir(subdir) {
  const dir = path.join(researchRoot, subdir);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function daysBetween(isoDate, referenceIso) {
  const then = new Date(isoDate).getTime();
  const now = new Date(referenceIso).getTime();
  if (Number.isNaN(then) || Number.isNaN(now)) return null;
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}
