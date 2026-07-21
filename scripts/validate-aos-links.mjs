import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { agentDir, walkFiles, relFromRoot, Reporter, fileExists } from "./aos-lib.mjs";

const LINK_RE = /\]\(([^)]+)\)/g;

function isExternal(target) {
  return /^[a-z]+:\/\//i.test(target) || target.startsWith("mailto:");
}

export function validateLinks() {
  const report = new Reporter("AOS link validation");

  const scanRoots = [
    agentDir,
    path.join(agentDir, "..", ".codex", "workflows"),
    path.join(agentDir, "..", ".claude", "workflows"),
    path.join(agentDir, "..", "docs", "aos"),
  ];

  const files = scanRoots.flatMap((root) =>
    walkFiles(root, (f) => f.endsWith(".md")),
  ).filter((file) => !relFromRoot(file).startsWith(".agent/runtime/"));

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const dir = path.dirname(file);
    for (const match of text.matchAll(LINK_RE)) {
      let target = match[1].trim();
      if (isExternal(target)) continue;
      if (target.startsWith("#")) continue; // in-file anchor
      const [targetPath] = target.split("#");
      if (!targetPath) continue;
      const resolved = path.resolve(dir, targetPath);
      if (!fileExists(path.relative(path.join(agentDir, ".."), resolved))) {
        report.error(`${relFromRoot(file)}: broken link "${target}" -> ${relFromRoot(resolved)} does not exist`);
      }
    }
  }

  report.warn(`Scanned ${files.length} markdown files under .agent/, .codex/workflows/, .claude/workflows/, docs/aos/`);
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = validateLinks();
  report.print();
  process.exit(report.ok ? 0 : 1);
}
