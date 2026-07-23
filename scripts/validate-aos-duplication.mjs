import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { agentDir, repoRoot, walkFiles, relFromRoot, Reporter } from "./aos-lib.mjs";

const ENTRY_POINT_LINE_LIMIT = 120;
const PROMPT_LINE_LIMIT = 60;
const MIN_PARAGRAPH_LENGTH = 60;

// Fragments intentionally repeated verbatim across files, reviewed and
// accepted (see the historical quality/execution/latest/result-interpretation.md). Each is
// deliberate shared template/disclaimer language, not duplicated workflow
// logic — repeating it lets a file be read in isolation without missing
// context. Do not add an entry here to silence a *new* duplication without
// the same review; this is an allowlist, not a way to reach zero warnings.
const ACCEPTED_DUPLICATE_FRAGMENTS = [
  "commands actually run and their pass/fail/not-available status",
  "path under quality/runtime/execution/latest/ or quality/runtime/execution/runs/<run_id>/",
  "any known failing test, broken build, or unresolved defect",
  "the single next step the receiving role/agent should take",
  "git-policy.md", // shared "Related" link list between git/cleanup.md and git/synchronization.md
  "this is an operational role definition used within the aos workflow, not an au", // shared agents/*.md disclaimer
];

function isAcceptedDuplicate(key) {
  return ACCEPTED_DUPLICATE_FRAGMENTS.some((fragment) => key.includes(fragment.toLowerCase()));
}

function normalizeParagraph(p) {
  return p.replace(/\s+/g, " ").trim().toLowerCase();
}

function paragraphsOf(text) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length >= MIN_PARAGRAPH_LENGTH && !p.startsWith("#") && !p.startsWith("|"));
}

export function validateDuplication() {
  const report = new Reporter("AOS duplication validation");

  // Entry points must stay thin.
  const entryPoints = [
    path.join(repoRoot, ".codex", "workflows", "aos.md"),
    path.join(repoRoot, ".claude", "workflows", "aos.md"),
  ];
  for (const file of entryPoints) {
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      report.error(`Entry point missing: ${relFromRoot(file)}`);
      continue;
    }
    const lineCount = text.split("\n").length;
    if (lineCount > ENTRY_POINT_LINE_LIMIT) {
      report.error(
        `${relFromRoot(file)} has ${lineCount} lines (limit ${ENTRY_POINT_LINE_LIMIT}) — entry points must stay thin pointers, not duplicate workflow content`,
      );
    }
    if (!/\.agent\/master\.md/.test(text)) {
      report.error(`${relFromRoot(file)} does not link to .agent/master.md`);
    }
  }

  // Prompt templates must not re-embed full workflow content.
  const promptDir = path.join(agentDir, "prompts");
  for (const file of walkFiles(promptDir, (f) => f.endsWith(".md"))) {
    const text = readFileSync(file, "utf8");
    const lineCount = text.split("\n").length;
    if (lineCount > PROMPT_LINE_LIMIT) {
      report.warn(
        `${relFromRoot(file)} has ${lineCount} lines (soft limit ${PROMPT_LINE_LIMIT}) — check it isn't duplicating a workflow module instead of linking to it`,
      );
    }
  }

  // Cross-file exact-duplicate paragraph detection across all .agent/**/*.md.
  const allFiles = walkFiles(agentDir, (f) => f.endsWith(".md"))
    .filter((file) => !relFromRoot(file).startsWith(".agent/runtime/"));
  const paragraphOwners = new Map();
  for (const file of allFiles) {
    const text = readFileSync(file, "utf8");
    for (const paragraph of paragraphsOf(text)) {
      const key = normalizeParagraph(paragraph);
      if (!paragraphOwners.has(key)) paragraphOwners.set(key, new Set());
      paragraphOwners.get(key).add(relFromRoot(file));
    }
  }
  for (const [key, owners] of paragraphOwners) {
    if (owners.size <= 1) continue;
    const summary = `Identical paragraph appears in ${owners.size} files (${[...owners].join(", ")}): "${key.slice(0, 80)}${key.length > 80 ? "…" : ""}"`;
    if (isAcceptedDuplicate(key)) {
      report.accepted ??= [];
      report.accepted.push(summary);
    } else {
      report.warn(summary);
    }
  }

  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = validateDuplication();
  report.print();
  process.exit(report.ok ? 0 : 1);
}
