import { existsSync, readFileSync, readdirSync } from "node:fs";
import {
  dirname,
  extname,
  join,
  normalize,
  relative,
  resolve,
} from "node:path";

const root = process.cwd();
const required = [
  "AGENTS.md",
  ".codex/VERSION",
  ".codex/README.md",
  ...[
    "overview",
    "frontend",
    "routing",
    "state-management",
    "storage",
    "i18n",
    "design-system",
    "testing",
    "security",
    "performance",
    "runtime",
    "data-flow",
    "folder-structure",
    "coding-standards",
  ].map((name) => ".codex/architecture/" + name + ".md"),
  ...[
    "coding",
    "react",
    "typescript",
    "css",
    "naming",
    "qa",
    "testing",
    "accessibility",
    "security",
    "performance",
    "i18n",
    "git",
    "versioning",
    "releases",
    "prompts",
    "agents",
    "documentation",
  ].map((name) => ".codex/standards/" + name + ".md"),
  ...Array.from({ length: 10 }, (_, index) => {
    const id = String(index + 1).padStart(3, "0");
    const matches = readdirSync(join(root, ".codex/adr")).filter((name) =>
      name.startsWith("ADR-" + id + "-"),
    );
    return matches.length === 1
      ? ".codex/adr/" + matches[0]
      : ".codex/adr/ADR-" + id + "-MISSING.md";
  }),
  ...[
    "00-master-spec",
    "01-runtime",
    "02-starter-agents",
    "03-prompt-packs",
    "04-playground",
    "05-learning-journey",
    "06-roadmap",
    "07-tests",
    "08-release",
    "handoff",
  ].map((name) => ".codex/sprint-7/" + name + ".md"),
  ...[
    "00-master-spec",
    "01-curriculum",
    "02-prompt-library",
    "03-agent-catalog",
    "04-playgrounds",
    "05-projects",
    "06-knowledge-base",
    "07-platform-pages",
    "08-live-provider",
    "09-testing",
    "10-deployment",
    "11-release",
    "handoff",
  ].map((name) => ".codex/release-1.0-beta/" + name + ".md"),
];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const errors = [];
for (const file of required) {
  if (!existsSync(join(root, file)))
    errors.push("Missing required file: " + file);
}

const markdownFiles = [
  join(root, "AGENTS.md"),
  ...walk(join(root, ".codex")).filter((file) => extname(file) === ".md"),
];
const titles = new Map();
const adrIds = new Map();

for (const file of markdownFiles) {
  const content = readFileSync(file, "utf8");
  const display = relative(root, file).replaceAll("\\", "/");
  const meaningful = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("<!--"));
  const title = meaningful.find((line) => /^#\s+/.test(line));
  if (!title) errors.push("Missing H1 title: " + display);
  else {
    const normalizedTitle = title.replace(/^#\s+/, "").trim().toLowerCase();
    const existing = titles.get(normalizedTitle);
    if (existing)
      errors.push(
        'Duplicate document title: "' +
          title.slice(2) +
          '" in ' +
          existing +
          " and " +
          display,
      );
    else titles.set(normalizedTitle, display);
  }
  if (meaningful.length < 5)
    errors.push("Placeholder-only document: " + display);

  for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, "");
    if (
      !rawTarget ||
      rawTarget.startsWith("#") ||
      /^(https?:|mailto:|tel:)/i.test(rawTarget)
    )
      continue;
    const pathPart = decodeURIComponent(rawTarget.split("#")[0].split("?")[0]);
    const target = normalize(resolve(dirname(file), pathPart));
    if (!target.startsWith(root) || !existsSync(target))
      errors.push("Broken local link in " + display + ": " + rawTarget);
  }

  const adrMatch = display.match(/\.codex\/adr\/ADR-(\d{3})-/);
  if (adrMatch) {
    const existing = adrIds.get(adrMatch[1]);
    if (existing)
      errors.push(
        "Duplicate ADR ID " + adrMatch[1] + ": " + existing + ", " + display,
      );
    else adrIds.set(adrMatch[1], display);
  }
}

if (existsSync(join(root, ".codex/standards/qa-standards.md")))
  errors.push("Obsolete duplicate QA standard still exists.");

const kitVersion = readFileSync(join(root, ".codex/VERSION"), "utf8").trim();
const index = readFileSync(join(root, ".codex/README.md"), "utf8");
const master = readFileSync(
  join(root, ".codex/sprint-7/00-master-spec.md"),
  "utf8",
);
if (kitVersion !== "1.0.0" || !index.includes("Engineering Kit: **1.0.0**"))
  errors.push("Engineering Kit version 1.0.0 is not documented consistently.");
if (
  !index.includes("Current application: **1.1.0-beta.1**") ||
  !master.includes("Application baseline: **0.6.1**")
)
  errors.push(
    "Current application 1.1.0-beta.1 or Sprint baseline 0.6.1 is not documented consistently.",
  );
if (
  !index.includes("Planned application: **1.2.0-beta.1**") ||
  !master.includes("Target application: **0.7.0**")
)
  errors.push("Application plan or archived Sprint target is not documented consistently.");

if (errors.length) {
  console.error(
    "Engineering documentation check failed (" + errors.length + "):",
  );
  for (const error of errors) console.error("- " + error);
  process.exitCode = 1;
} else {
  console.log(
    "Engineering documentation check passed: " +
      markdownFiles.length +
      " Markdown files, " +
      adrIds.size +
      " ADRs, Kit " +
      kitVersion +
      ".",
  );
}
