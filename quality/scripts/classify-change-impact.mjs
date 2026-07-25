import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const base = process.argv[2] ?? (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : "HEAD^");
const head = process.argv[3] ?? "HEAD";
const git = spawnSync("git", ["diff", "--name-only", `${base}...${head}`], { cwd: root, encoding: "utf8" });
if (git.status !== 0) throw new Error(git.stderr);
const files = git.stdout.split(/\r?\n/).filter(Boolean);
const docsPattern = /^(docs\/|\.codex\/|\.agent\/|README\.md$|AGENTS\.md$|CHANGELOG\.md$)|\.(md|mdx)$/i;
const docsOnly = files.length > 0 && files.every((file) => docsPattern.test(file));
const report = { schemaVersion: 1, base, head, files, classification: docsOnly ? "docs-only" : files.length ? "runtime-impacting" : "no-change", requiredGates: docsOnly ? ["docs", "aos", "build-smoke", "provenance"] : ["full-ci", "visual", "accessibility", "performance", "provenance"] };
const output = path.join(root, "quality", "runtime", "change-impact.json");
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
