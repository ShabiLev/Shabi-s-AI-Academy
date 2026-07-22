import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const snapshotRoot = join(root, "e2e/specs/__screenshots__");
const runtimePath = join(root, "quality/runtime/visual-existing-linux.json");
const outputPath = join(root, "quality/generated/visual-candidate-manifest.json");
const reportPath = join(root, "quality/generated/playwright-visual-candidates-before-results.json");

function filesBelow(directory, predicate) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path, predicate) : predicate(path) ? [path] : [];
  });
}

function linuxBaselines() {
  return filesBelow(snapshotRoot, (path) => path.endsWith("-linux.png")).sort();
}

function normalize(path) {
  return relative(root, path).replaceAll("\\", "/");
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function flattenSuites(suites, inherited = []) {
  const rows = [];
  for (const suite of suites ?? []) {
    const titles = [...inherited, suite.title].filter(Boolean);
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        for (const result of test.results ?? []) {
          rows.push({
            title: [...titles, spec.title].filter(Boolean).join(" > "),
            attachments: result.attachments ?? [],
          });
        }
      }
    }
    rows.push(...flattenSuites(suite.suites, titles));
  }
  return rows;
}

function inferLanguage(filename, title) {
  const value = `${filename} ${title}`.toLowerCase();
  if (/(?:^|[- ])en(?:[- .]|$)|english/.test(value)) return "en";
  return "he";
}

function inferViewport(filename, title) {
  const mobile = /mobile|320|390|iphone|pixel/i.test(`${filename} ${title}`);
  return mobile ? { group: "mobile", width: 390, height: 844 } : { group: "desktop", width: 1280, height: 900 };
}

function inferRoute(filename) {
  const routes = [
    ["account-security", "/account/security"], ["migration", "/account/migration"],
    ["catalog-prompt-details", "/prompts/catalog/prompts-chat-sql-query-reviewer"],
    ["starter-catalog", "/prompts/catalog"], ["prompt-builder", "/prompts/new"],
    ["prompt-library", "/prompts"], ["prompt-details", "/prompts/:local-id"],
    ["lesson-details", "/lessons/ai-llm-agent"], ["lessons", "/lessons"],
    ["onboarding", "/onboarding"], ["profile", "/profile"], ["radar", "/radar"],
    ["settings", "/settings"], ["qa", "/qa"], ["runtime", "/runs"],
    ["playground", "/playground"], ["projects", "/projects"], ["knowledge", "/knowledge"],
    ["search", "/search"], ["assistant", "/assistant"], ["workflow", "/workflows"],
    ["analytics", "/analytics"], ["help", "/help"], ["glossary", "/glossary"],
    ["about", "/about"], ["login", "/login"], ["register", "/auth/register"],
    ["dashboard", "/dashboard"], ["landing", "/"], ["admin", "/admin"],
  ];
  return routes.find(([token]) => filename.includes(token))?.[1] ?? "scenario-defined";
}

function buildManifest() {
  const previous = new Set(JSON.parse(readFileSync(runtimePath, "utf8")));
  const generated = linuxBaselines().filter((path) => !previous.has(normalize(path)));
  const report = existsSync(reportPath) ? JSON.parse(readFileSync(reportPath, "utf8")) : { suites: [] };
  const results = flattenSuites(report.suites);
  const candidates = generated.map((path) => {
    const filename = basename(path);
    const stem = filename.replace(/-linux\.png$/, "");
    const result = results.find((row) => row.attachments.some((attachment) => basename(attachment.path ?? "").startsWith(stem)));
    const relocatedAttachment = (name) => {
      const attachment = result?.attachments.find((item) => item.name === name || basename(item.path ?? "") === name);
      if (!attachment?.path) return null;
      const relocated = resolve(attachment.path.replace(/(?:^|[\\/])test-results[\\/]/, "/candidate-test-results/"));
      return existsSync(relocated) ? relocated : null;
    };
    const actual = relocatedAttachment("actual") ?? relocatedAttachment(`${stem}-actual.png`) ?? path;
    const trace = relocatedAttachment("trace") ?? relocatedAttachment("trace.zip");
    const testTitle = result?.title ?? stem;
    return {
      baselineFilename: filename,
      testTitle,
      route: inferRoute(filename),
      viewport: inferViewport(filename, testTitle),
      language: inferLanguage(filename, testTitle),
      platform: "linux",
      expectedBaselineExisted: false,
      actualImagePath: normalize(actual),
      tracePath: trace ? normalize(trace) : null,
      reportPath: "candidate-playwright-report/index.html",
      sha256: sha256(path),
      generatedCommitSha: process.env.EXPECTED_HEAD_SHA ?? process.env.GITHUB_SHA ?? "unknown",
      workflowRunId: process.env.GITHUB_RUN_ID ?? "local",
      reviewStatus: "pending",
      reviewNotes: "",
    };
  });
  mkdirSync(join(root, "quality/generated"), { recursive: true });
  writeFileSync(outputPath, JSON.stringify({
    schemaVersion: 1,
    sourceBranch: process.env.SOURCE_BRANCH ?? "unknown",
    suiteGroup: process.env.SUITE_GROUP ?? "unknown",
    viewportGroup: process.env.VIEWPORT_GROUP ?? "unknown",
    languageGroup: process.env.LANGUAGE_GROUP ?? "unknown",
    candidateCount: candidates.length,
    candidates,
  }, null, 2));
  console.log(`Wrote ${candidates.length} candidate entries to ${normalize(outputPath)}.`);
}

const command = process.argv[2];
if (command === "capture") {
  mkdirSync(join(root, "quality/runtime"), { recursive: true });
  writeFileSync(runtimePath, JSON.stringify(linuxBaselines().map(normalize), null, 2));
  console.log(`Captured existing Linux baselines in ${normalize(runtimePath)}.`);
} else if (command === "build") {
  buildManifest();
} else {
  console.error("Usage: node quality/scripts/visual-candidate-manifest.mjs <capture|build>");
  process.exit(2);
}
