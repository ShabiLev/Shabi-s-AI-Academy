import { spawn, spawnSync } from "node:child_process";
import {
  cpSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import coverageThresholds from "../quality/config/coverageThresholds.cjs";
import {
  boundedRunIndex,
  deriveRecommendation,
  redactText,
  safeSlug,
  summarizeCoverage,
} from "./evidence-utils.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXECUTION = path.join(ROOT, "quality", "execution");
const npmCli = process.env.npm_execpath
  ?? path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
const npmExecutable = process.platform === "win32" ? process.execPath : "npm";
const npmPrefixArgs = process.platform === "win32" ? [npmCli] : [];
const gitExecutable = process.platform === "win32" ? "git.exe" : "git";
const profile = process.argv[2] ?? "fast";
const validProfiles = new Set(["fast", "full", "pages", "headed"]);

if (!validProfiles.has(profile)) {
  console.error(`Unknown evidence profile: ${profile}`);
  process.exit(2);
}

const npm = (id, script, log, options = {}) => ({
  id,
  script,
  label: options.label ?? script,
  executable: npmExecutable,
  args: [...npmPrefixArgs, "run", script],
  command: `npm run ${script}`,
  log,
  criticality: options.criticality ?? "blocker",
  dependsOn: options.dependsOn ?? [],
});
const git = (id, args, log, options = {}) => ({
  id,
  label: options.label ?? `git ${args.join(" ")}`,
  executable: gitExecutable,
  args,
  command: `git ${args.join(" ")}`,
  log,
  criticality: options.criticality ?? "blocker",
  dependsOn: options.dependsOn ?? [],
});

const commandProfiles = {
  fast: [
    npm("docs", "docs:check", "docs-check.log"),
    npm("aos", "aos:check", "aos-check.log"),
    npm("focused", "test:evidence", "focused-tests.log"),
    npm("aos-tests", "test:aos", "aos-tests.log"),
    npm("lint", "lint", "lint.log"),
    npm("unit", "test:run", "unit-tests.log"),
    npm("build", "build", "build.log"),
  ],
  pages: [
    npm("build-pages", "build:pages", "build-pages.log"),
    npm("e2e-pages", "test:e2e:pages", "e2e-pages.log", { dependsOn: ["build-pages"] }),
  ],
  headed: [
    npm("journeys-headed", "test:journeys:headed", "journeys-headed.log", { criticality: "manual" }),
  ],
  full: [
    npm("docs", "docs:check", "docs-check.log"),
    npm("aos", "aos:check", "aos-check.log"),
    npm("focused", "test:evidence", "focused-tests.log"),
    npm("aos-tests", "test:aos", "aos-tests.log"),
    npm("lint", "lint", "lint.log"),
    npm("unit", "test:run", "unit-tests.log"),
    npm("coverage", "test:coverage", "coverage.log"),
    npm("build", "build", "build.log"),
    npm("build-pages", "build:pages", "build-pages.log"),
    npm("catalog", "catalog:check", "catalog-check.log"),
    npm("e2e", "test:e2e", "e2e.log"),
    npm("e2e-full", "test:e2e:full", "e2e-full.log"),
    npm("e2e-pages", "test:e2e:pages", "e2e-pages.log", { dependsOn: ["build-pages"] }),
    npm("journeys", "test:journeys", "journeys.log"),
    npm("click-audit", "test:click-audit", "click-audit.log"),
    npm("route-crawl", "test:route-crawl", "route-crawl.log"),
    npm("forms", "test:forms", "forms.log"),
    npm("overlays", "test:overlays", "overlays.log"),
    npm("responsive", "test:responsive:interactions", "responsive-interactions.log"),
    npm("keyboard", "test:keyboard", "keyboard.log"),
    npm("copy", "test:copy", "copy.log"),
    npm("errors", "test:errors", "errors.log"),
    npm("ux", "test:ux", "ux.log"),
    npm("a11y", "test:a11y", "accessibility.log"),
    npm("visual", "test:visual", "visual.log"),
    npm("performance", "test:performance", "performance.log"),
    npm("release-candidate", "test:release-candidate", "release-candidate.log"),
    npm("release-candidate-pages", "test:release-candidate:pages", "release-candidate-pages.log"),
    npm("quality-collect", "quality:collect", "quality-collect.log"),
    npm("quality-analyze", "quality:analyze", "quality-analyze.log", { dependsOn: ["quality-collect"] }),
    npm("system-report", "quality:system-report", "system-report.log", { dependsOn: ["quality-collect"] }),
    npm("validate-release", "validate:release", "validate-release.log"),
    git("git-diff", ["diff", "--check"], "git-diff-check.log"),
  ],
};

const availableNpmScripts = new Set(
  Object.keys(readJson(path.join(ROOT, "package.json"), { scripts: {} }).scripts ?? {}),
);

function output(executable, args) {
  const result = spawnSync(executable, args, { cwd: ROOT, encoding: "utf8" });
  return redactText(`${result.stdout ?? ""}${result.stderr ?? ""}`.trim(), { workspace: ROOT });
}

function readJson(file, fallback) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function parseResultCounts(stdout, exitCode) {
  const matchesFor = (pattern) => pattern
    ? [...stdout.matchAll(new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`))]
    : [];
  const patterns = [
    { result: /Tests\s+(\d+)\s+passed/i, failure: /Tests\s+(\d+)\s+failed/i },
    { result: /# tests\s+(\d+)/i, failure: /# fail\s+(\d+)/i },
    { result: /(?:^|\n)\s*(\d+)\s+passed(?:\s|\()/gi, failure: /(?:^|\n)\s*(\d+)\s+failed(?:\s|\()/gi },
    { result: /(\d+) Markdown files/i, failure: null },
    { result: /✓ (\d+) modules transformed/i, failure: null },
  ];
  for (const pattern of patterns) {
    const matches = matchesFor(pattern.result);
    if (!matches.length) continue;
    const failureMatches = matchesFor(pattern.failure);
    return {
      resultCount: Number(matches.at(-1)?.[1] ?? 0),
      failureCount: Number(failureMatches.at(-1)?.[1] ?? (exitCode === 0 ? 0 : 1)),
    };
  }
  return { resultCount: null, failureCount: exitCode === 0 ? 0 : 1 };
}

function localTimestamp(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}_${get("hour")}-${get("minute")}-${get("second")}`;
}

function gitState() {
  return [
    "$ git status --short --branch", output(gitExecutable, ["status", "--short", "--branch"]),
    "", "$ git branch --show-current", output(gitExecutable, ["branch", "--show-current"]),
    "", "$ git remote -v", output(gitExecutable, ["remote", "-v"]),
    "", "$ git log --oneline --decorate -10", output(gitExecutable, ["log", "--oneline", "--decorate", "-10"]),
  ].join("\n");
}

function loadManualReview(file, fallbackNote) {
  return readJson(path.join(ROOT, "quality", "checklists", file), {
    status: "notRun",
    reviewedBy: null,
    reviewedAt: null,
    warnings: [],
    note: fallbackNote,
  });
}

async function runCommand(spec, runDirectory, priorResults) {
  const dependencyFailed = spec.dependsOn.some((dependency) => {
    const result = priorResults.find((candidate) => candidate.id === dependency);
    return !result || result.status !== "passed";
  });
  const startedAt = new Date();
  const base = {
    id: spec.id,
    label: spec.label,
    command: spec.command,
    criticality: spec.criticality,
    startedAt: startedAt.toISOString(),
    logPath: `quality/execution/runs/${path.basename(runDirectory)}/${spec.log}`,
  };

  if (spec.script && !availableNpmScripts.has(spec.script)) {
    const result = {
      ...base,
      status: "notAvailable",
      endedAt: startedAt.toISOString(),
      durationMs: 0,
      exitCode: null,
      resultCount: null,
      failureCount: null,
      warningCount: 0,
      summary: `Package script is not available: ${spec.script}.`,
    };
    writeFileSync(path.join(runDirectory, spec.log), `${result.summary}\n`, "utf8");
    return result;
  }

  if (dependencyFailed) {
    const result = {
      ...base,
      status: "notRunDueToDependency",
      endedAt: startedAt.toISOString(),
      durationMs: 0,
      exitCode: null,
      resultCount: null,
      failureCount: null,
      warningCount: 0,
      summary: `Skipped because a dependency did not pass: ${spec.dependsOn.join(", ")}.`,
    };
    writeFileSync(path.join(runDirectory, spec.log), `${result.summary}\n`, "utf8");
    return result;
  }

  console.log(`\n[evidence] ${spec.command}`);
  const child = spawn(spec.executable, spec.args, {
    cwd: ROOT,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    const value = chunk.toString();
    stdout += value;
    process.stdout.write(value);
  });
  child.stderr.on("data", (chunk) => {
    const value = chunk.toString();
    stderr += value;
    process.stderr.write(value);
  });
  const exitCode = await new Promise((resolve) => {
    child.on("error", () => resolve(1));
    child.on("close", (code) => resolve(code ?? 1));
  });
  const endedAt = new Date();
  const sanitizedStdout = redactText(stdout, { workspace: ROOT });
  const sanitizedStderr = redactText(stderr, { workspace: ROOT });
  const warningCount = `${sanitizedStdout}\n${sanitizedStderr}`
    .split(/\r?\n/)
    .filter((line) => /\bwarning\b/i.test(line) && !/\b0 warnings?\b/i.test(line)).length;
  writeFileSync(
    path.join(runDirectory, spec.log),
    `${sanitizedStdout}${sanitizedStderr ? `\n--- stderr ---\n${sanitizedStderr}` : ""}`,
    "utf8",
  );
  const counts = parseResultCounts(sanitizedStdout, exitCode);
  return {
    ...base,
    status: exitCode === 0 ? "passed" : "failed",
    endedAt: endedAt.toISOString(),
    durationMs: endedAt.getTime() - startedAt.getTime(),
    exitCode,
    ...counts,
    warningCount,
    summary: exitCode === 0 ? "Command completed successfully." : `Command exited with code ${exitCode}.`,
  };
}

function copyHeavyArtifacts(runDirectory) {
  const mappings = [
    ["test-results", "playwright"],
    ["playwright-report", "reports/playwright"],
    ["coverage", "coverage"],
    ["quality/generated", "reports/quality-generated"],
  ];
  for (const [source, destination] of mappings) {
    const sourcePath = path.join(ROOT, source);
    if (!existsSync(sourcePath)) continue;
    const destinationPath = path.join(runDirectory, destination);
    rmSync(destinationPath, { recursive: true, force: true });
    mkdirSync(path.dirname(destinationPath), { recursive: true });
    cpSync(sourcePath, destinationPath, { recursive: true });
  }

  const testResults = path.join(ROOT, "test-results");
  if (!existsSync(testResults)) return;
  const categories = [
    { directory: "visual-diffs", matches: (file) => file.endsWith("-diff.png") },
    { directory: "screenshots", matches: (file) => file.endsWith(".png") && !file.endsWith("-diff.png") },
    { directory: "traces", matches: (file) => file.endsWith(".zip") },
    { directory: "videos", matches: (file) => file.endsWith(".webm") },
  ];
  const visit = (directory) => {
    for (const entry of readdirSync(directory)) {
      const source = path.join(directory, entry);
      if (statSync(source).isDirectory()) {
        visit(source);
        continue;
      }
      const relative = path.relative(testResults, source);
      for (const category of categories) {
        if (!category.matches(entry)) continue;
        const destination = path.join(runDirectory, category.directory, relative);
        mkdirSync(path.dirname(destination), { recursive: true });
        copyFileSync(source, destination);
      }
    }
  };
  visit(testResults);
}

function statusFor(commandResults, ids) {
  const matching = commandResults.filter((command) => ids.includes(command.id));
  if (!matching.length) return { status: "notRun", command: null, durationMs: 0, resultCount: null, failureCount: null, logPath: null };
  const failed = matching.filter((command) => command.status === "failed");
  const unavailable = matching.filter((command) => command.status === "notAvailable");
  const skipped = matching.filter((command) => command.status === "notRunDueToDependency");
  return {
    status: failed.length ? "failed" : unavailable.length ? "notAvailable" : skipped.length ? "notRunDueToDependency" : "passed",
    command: matching.map((command) => command.command).join("; "),
    durationMs: matching.reduce((total, command) => total + command.durationMs, 0),
    resultCount: matching.reduce((total, command) => total + (command.resultCount ?? 0), 0) || null,
    failureCount: failed.length,
    logPath: matching.map((command) => command.logPath).join(", "),
  };
}

function markdownSummary(summary) {
  const rows = Object.entries(summary.results).map(([name, result]) =>
    `| ${name} | ${result.status} | ${result.command ?? "Not run"} | ${Math.round(result.durationMs / 1000)}s | ${result.failureCount ?? "-"} | ${result.logPath ?? "-"} |`,
  ).join("\n");
  const coverageRows = ["statements", "branches", "functions", "lines"].map((name) => {
    const metric = summary.coverage?.[name];
    return `| ${name} | ${metric?.percent ?? "Not available"} | ${metric?.threshold ?? coverageThresholds[name]} | ${metric?.delta ?? "Not available"} | ${metric?.passed ?? false} |`;
  }).join("\n");
  return `# Quality Execution Summary

## Identity

- Run ID: ${summary.identity.runId}
- Date and time: ${summary.identity.startedAt} to ${summary.identity.endedAt}
- Application version: ${summary.identity.version}
- Branch: ${summary.identity.branch}
- Starting commit: ${summary.identity.startingCommit}
- Final commit: ${summary.identity.finalCommit}
- Agent used: Codex
- Operating system: ${summary.identity.operatingSystem}
- Node version: ${summary.identity.nodeVersion}
- npm version: ${summary.identity.npmVersion}

## Scope

- Requested task: ${summary.scope.requestedTask}
- Implemented changes: ${summary.scope.implementedChanges}
- Files added: see changed-files.txt
- Files modified: see changed-files.txt
- Files deleted: see changed-files.txt
- Data migrations: None

## Results

| Area | Status | Command | Duration | Failures | Log path |
| --- | --- | --- | ---: | ---: | --- |
${rows}

## Coverage

| Metric | Percent | Threshold | Delta | Passed |
| --- | ---: | ---: | ---: | --- |
${coverageRows}

## Findings

- Critical: ${summary.findings.critical}
- High: ${summary.findings.high}
- Medium: ${summary.findings.medium}
- Low: ${summary.findings.low}
- Warnings: ${summary.findings.warningCount}
- Manual review required: ${summary.findings.manualReviewRequired ? "Yes" : "No"}

## Git

- Working branch: ${summary.git.branch}
- Main relationship: ${summary.git.mainRelationship}
- Remote relationship: ${summary.git.remoteRelationship}
- Commits created: ${summary.git.commitsCreated.join(", ") || "None"}
- Working tree status: ${summary.git.workingTreeStatus}
- Exact synchronization commands: see latest/README.md

## Recommendation

${summary.recommendation}
`;
}

async function main() {
  mkdirSync(EXECUTION, { recursive: true });
  if (profile === "full") {
    for (const generatedPath of ["coverage", "playwright-report", "test-results", "quality/generated", "public/generated"]) {
      rmSync(path.join(ROOT, generatedPath), { recursive: true, force: true });
    }
  }
  const startedAt = new Date();
  const branch = output(gitExecutable, ["branch", "--show-current"]) || "detached";
  const startingCommit = output(gitExecutable, ["rev-parse", "HEAD"]);
  const version = readJson(path.join(ROOT, "package.json"), { version: "unknown" }).version;
  const runId = `${localTimestamp(startedAt)}_${safeSlug(branch, startingCommit.slice(0, 7))}`;
  const runDirectory = path.join(EXECUTION, "runs", runId);
  mkdirSync(runDirectory, { recursive: true });
  writeFileSync(path.join(runDirectory, "git-state-before.txt"), `${gitState()}\n`, "utf8");

  const environment = {
    runId,
    profile,
    agent: "Codex",
    operatingSystem: `${os.platform()} ${os.release()} ${os.arch()}`,
    nodeVersion: process.version,
    npmVersion: output(npmExecutable, [...npmPrefixArgs, "--version"]),
    branch,
    startingCommit,
    version,
    startedAt: startedAt.toISOString(),
  };
  writeJson(path.join(runDirectory, "environment.json"), environment);

  const commands = [];
  for (const spec of commandProfiles[profile]) {
    commands.push(await runCommand(spec, runDirectory, commands));
    writeJson(path.join(runDirectory, "commands.json"), commands);
  }

  if (["full", "headed"].includes(profile)) copyHeavyArtifacts(runDirectory);
  const finalCommit = output(gitExecutable, ["rev-parse", "HEAD"]);
  const endedAt = new Date();
  const indexPath = path.join(EXECUTION, "index.json");
  const existingIndex = readJson(indexPath, { schemaVersion: 1, runs: [] });
  const previousCoverage = existingIndex.runs?.find((run) => run.coverageSummary)?.coverageSummary ?? null;
  const coverageRan = commands.some((command) => command.id === "coverage" && ["passed", "failed"].includes(command.status));
  const rawCoverage = coverageRan
    ? readJson(path.join(ROOT, "coverage", "coverage-summary.json"), null)
    : null;
  const coverage = rawCoverage
    ? summarizeCoverage(rawCoverage, coverageThresholds, previousCoverage)
    : null;
  const manualReviews = {
    manualUxReview: loadManualReview("manual-ux-review.json", "Human UX review has not run."),
    manualSecurityReview: loadManualReview("manual-security-review.json", "Human security review has not run."),
    manualContentReview: loadManualReview("manual-content-review.json", "Human content review has not run."),
  };
  const recommendation = deriveRecommendation({ profile, commands, coverage, manualReviews });
  const failedCommands = commands.filter((command) => command.status === "failed");
  const pendingManual = Object.entries(manualReviews).filter(([, review]) => review.status === "notRun");
  const warningCount = commands.reduce((count, command) => count + (command.warningCount ?? 0), 0)
    + commands.filter((command) => command.criticality !== "blocker" && command.status !== "passed").length
    + pendingManual.length
    + Object.values(manualReviews).reduce((count, review) => count + (review.warnings?.length ?? 0), 0);
  const changedFiles = [
    output(gitExecutable, ["diff", "--name-status", startingCommit]),
    output(gitExecutable, ["ls-files", "--others", "--exclude-standard"]),
  ].filter(Boolean).join("\n");
  const workingTreeStatus = output(gitExecutable, ["status", "--short"]) || "clean";
  const mainCounts = output(gitExecutable, ["rev-list", "--left-right", "--count", "main...HEAD"]);
  const remoteCounts = output(gitExecutable, ["rev-list", "--left-right", "--count", "HEAD...origin/main"]);

  const results = {
    Docs: statusFor(commands, ["docs"]),
    Lint: statusFor(commands, ["lint"]),
    "Unit tests": statusFor(commands, ["focused", "unit"]),
    Coverage: statusFor(commands, ["coverage"]),
    Build: statusFor(commands, ["build"]),
    "GitHub Pages build": statusFor(commands, ["build-pages", "e2e-pages"]),
    E2E: statusFor(commands, ["e2e", "e2e-full"]),
    Journeys: statusFor(commands, ["journeys", "journeys-headed"]),
    UX: statusFor(commands, ["click-audit", "route-crawl", "forms", "overlays", "responsive", "keyboard", "copy", "errors", "ux"]),
    Accessibility: statusFor(commands, ["a11y"]),
    Visual: statusFor(commands, ["visual"]),
    Performance: statusFor(commands, ["performance"]),
    "Release validation": statusFor(commands, ["release-candidate", "release-candidate-pages", "validate-release"]),
    "Git diff": statusFor(commands, ["git-diff"]),
  };
  const summary = {
    schemaVersion: 1,
    identity: {
      runId, profile, startedAt: startedAt.toISOString(), endedAt: endedAt.toISOString(),
      version, branch, startingCommit, finalCommit,
      agent: "Codex", operatingSystem: environment.operatingSystem,
      nodeVersion: environment.nodeVersion, npmVersion: environment.npmVersion,
    },
    scope: {
      requestedTask: process.env.QUALITY_EVIDENCE_REQUESTED_TASK ?? `Run the ${profile} quality-evidence profile.`,
      implementedChanges: process.env.QUALITY_EVIDENCE_IMPLEMENTED_CHANGES ?? "No implementation scope was supplied; this run records validation evidence only.",
      dataMigrations: [],
    },
    results,
    coverage,
    manualReviews,
    findings: {
      critical: 0,
      high: Object.values(manualReviews).filter((review) => review.status === "failed").length,
      medium: 0,
      low: 0,
      warningCount,
      manualReviewRequired: pendingManual.length > 0,
    },
    git: {
      branch,
      mainRelationship: `main...HEAD left/right counts: ${mainCounts || "unavailable"}`,
      remoteRelationship: `HEAD...origin/main left/right counts: ${remoteCounts || "unavailable"}`,
      commitsCreated: [],
      workingTreeStatus,
    },
    recommendation,
    failedCommands: failedCommands.map((command) => command.command),
  };
  writeJson(path.join(runDirectory, "summary.json"), summary);
  writeFileSync(path.join(runDirectory, "summary.md"), markdownSummary(summary), "utf8");
  writeJson(path.join(runDirectory, "test-results.json"), { profile, commands, results });
  writeJson(path.join(runDirectory, "coverage-summary.json"), coverage ?? {
    status: "notAvailable", thresholds: coverageThresholds,
  });
  writeFileSync(path.join(runDirectory, "changed-files.txt"), `${changedFiles || "No changed files.\n"}`, "utf8");
  writeFileSync(path.join(runDirectory, "failures.md"), failedCommands.length
    ? `# Failures\n\n${failedCommands.map((command) => `- **${command.command}**: ${command.summary} See \`${command.logPath}\`.`).join("\n")}\n`
    : "# Failures\n\nNo command failures were recorded.\n", "utf8");
  const warnings = [
    ...pendingManual.map(([name]) => `- ${name}: notRun.`),
    ...commands.filter((command) => command.warningCount > 0).map((command) => `- ${command.command}: emitted ${command.warningCount} warning line(s); see \`${command.logPath}\`.`),
    ...commands.filter((command) => command.status === "notRunDueToDependency").map((command) => `- ${command.command}: ${command.summary}`),
    ...commands.filter((command) => command.status === "notAvailable").map((command) => `- ${command.command}: ${command.summary}`),
  ];
  writeFileSync(path.join(runDirectory, "warnings.md"), warnings.length
    ? `# Warnings\n\n${warnings.join("\n")}\n`
    : "# Warnings\n\nNo warnings were recorded.\n", "utf8");
  writeFileSync(path.join(runDirectory, "manual-review.md"), `# Manual review\n\n| Gate | Status | Reviewer | Reviewed at | Warnings |\n| --- | --- | --- | --- | --- |\n${Object.entries(manualReviews).map(([name, review]) => `| ${name} | ${review.status} | ${review.reviewedBy ?? review.approvedBy ?? "Not recorded"} | ${review.reviewedAt ?? "Not recorded"} | ${(review.warnings ?? []).join("; ") || "None"} |`).join("\n")}\n\nAutomation does not promote manual review statuses.\n`, "utf8");
  writeFileSync(path.join(runDirectory, "self-review.md"), "# Self-review\n\nStatus: notRun\n\nComplete the structured code, security, accessibility, documentation, test, and scope review before committing.\n", "utf8");
  writeFileSync(path.join(runDirectory, "git-state-after.txt"), `${gitState()}\n`, "utf8");

  const indexEntry = {
    runId,
    date: endedAt.toISOString(),
    branch,
    commit: finalCommit,
    version,
    overallStatus: recommendation,
    coverageSummary: coverage,
    reportPath: `quality/execution/latest/summary.md`,
    localRunPath: `quality/execution/runs/${runId}/`,
    failedCommands: summary.failedCommands,
    warningCount,
  };
  writeJson(indexPath, {
    schemaVersion: 1,
    maximumRuns: 20,
    runs: boundedRunIndex(existingIndex.runs ?? [], indexEntry, 20),
  });

  const latest = path.join(EXECUTION, "latest");
  rmSync(latest, { recursive: true, force: true });
  mkdirSync(latest, { recursive: true });
  for (const file of ["summary.md", "summary.json", "coverage-summary.json", "failures.md", "warnings.md", "manual-review.md", "changed-files.txt", "self-review.md", "environment.json", "commands.json", "git-state-before.txt", "git-state-after.txt"]) {
    const sourcePath = path.join(runDirectory, file);
    if (existsSync(sourcePath)) cpSync(sourcePath, path.join(latest, file));
  }
  const commandsPassed = commands.filter((command) => command.status === "passed").map((command) => command.command);
  writeFileSync(path.join(latest, "README.md"), `# Latest quality execution\n\n- Occurred: ${startedAt.toISOString()} to ${endedAt.toISOString()}\n- Branch: ${branch}\n- Commit tested: ${finalCommit}\n- Profile: ${profile}\n- Commands run: ${commands.map((command) => command.command).join(", ")}\n- Commands passed: ${commandsPassed.join(", ") || "None"}\n- Commands failed: ${summary.failedCommands.join(", ") || "None"}\n- Heavy local artifacts: \`quality/execution/runs/${runId}/\` (ignored), plus copied Playwright, coverage, and quality-generated reports when available.\n- Safe to commit: Yes; latest files are sanitized summaries and contain no environment values. Review the diff before staging.\n- Manual review pending: ${pendingManual.length ? pendingManual.map(([name]) => name).join(", ") : "No"}\n\n## Synchronization (not executed)\n\n\`\`\`bash\ngit status\ngit branch --show-current\ngit fetch origin\ngit status -sb\ngit push -u origin ${branch}\n\`\`\`\n`, "utf8");

  console.log(`\n[evidence] ${recommendation}: quality/execution/latest/summary.md`);
  if (recommendation === "Blocked") process.exitCode = 1;
}

await main();
