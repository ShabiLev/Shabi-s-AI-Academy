import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(__dirname, "..");
export const agentDir = path.join(repoRoot, ".agent");

export function readJson(relPath) {
  const full = path.join(repoRoot, relPath);
  const text = readFileSync(full, "utf8");
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Invalid JSON in ${relPath}: ${err.message}`);
  }
}

export function loadManifest() {
  return readJson(".agent/manifest.json");
}

export function loadRegistry() {
  return readJson(".agent/registry.json");
}

export function walkFiles(startDir, predicate) {
  const results = [];
  const stack = [startDir];
  while (stack.length) {
    const current = stack.pop();
    if (!existsSync(current)) continue;
    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (predicate(full)) {
        results.push(full);
      }
    }
  }
  return results;
}

export function relFromRoot(absPath) {
  return path.relative(repoRoot, absPath).split(path.sep).join("/");
}

export class Reporter {
  constructor(name) {
    this.name = name;
    this.errors = [];
    this.warnings = [];
  }
  error(message) {
    this.errors.push(message);
  }
  warn(message) {
    this.warnings.push(message);
  }
  get ok() {
    return this.errors.length === 0;
  }
  print() {
    console.log(`\n=== ${this.name} ===`);
    if (this.errors.length === 0 && this.warnings.length === 0 && !this.accepted?.length) {
      console.log("OK — no issues found.");
      return;
    }
    for (const e of this.errors) console.log(`  ERROR: ${e}`);
    for (const w of this.warnings) console.log(`  WARN:  ${w}`);
    for (const a of this.accepted ?? []) console.log(`  ACCEPTED (reviewed, intentional): ${a}`);
    console.log(
      `${this.errors.length} error(s), ${this.warnings.length} warning(s)${this.accepted?.length ? `, ${this.accepted.length} accepted` : ""}.`,
    );
  }
}

export function fileExists(relPath) {
  return existsSync(path.join(repoRoot, relPath));
}

export function isDir(absPath) {
  try {
    return statSync(absPath).isDirectory();
  } catch {
    return false;
  }
}
