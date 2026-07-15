import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import coverageThresholds from "../config/coverageThresholds.cjs";
import lighthouseThresholds from "../config/lighthouseThresholds.cjs";

const GENERATED_DIR = "quality/generated";
const SCHEMA_VERSION = 1;

function readJsonSafe(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function gate(status, message) {
  return message ? { status, message } : { status };
}

// ---------- lint ----------
function collectLint() {
  try {
    const output = execSync("npx eslint . --format json", {
      stdio: ["ignore", "pipe", "pipe"],
    }).toString();
    const results = JSON.parse(output);
    const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
    return gate(errorCount > 0 ? "failed" : "passed");
  } catch (err) {
    // eslint exits non-zero when it finds lint errors; stdout still has the JSON.
    const stdout = err && err.stdout ? err.stdout.toString() : "";
    try {
      const results = JSON.parse(stdout);
      const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
      return gate(errorCount > 0 ? "failed" : "passed");
    } catch {
      return gate(
        "notAvailable",
        "Could not run eslint to determine lint status.",
      );
    }
  }
}

// ---------- build ----------
function collectBuild() {
  return existsSync("dist/index.html") ? gate("passed") : gate("notRun");
}

// ---------- unit tests (Vitest) ----------
function collectUnitTests() {
  const data = readJsonSafe(path.join(GENERATED_DIR, "vitest-results.json"));
  if (!data) return { gate: gate("notAvailable"), summary: null };
  const total = data.numTotalTests ?? 0;
  const failed = data.numFailedTests ?? 0;
  const skipped = (data.numPendingTests ?? 0) + (data.numTodoTests ?? 0);
  const status = total === 0 ? "notRun" : failed > 0 ? "failed" : "passed";
  return {
    gate: gate(status),
    summary: {
      total,
      failed,
      skipped,
      durationMs:
        typeof data.testResults?.[0]?.perfStats?.runtime === "number"
          ? undefined
          : undefined,
    },
  };
}

// ---------- coverage ----------
function collectCoverage() {
  const data = readJsonSafe("coverage/coverage-summary.json");
  if (!data || !data.total)
    return { gate: gate("notAvailable"), summary: null };
  const pct = (entry) => Math.round(entry.pct * 100) / 100;
  const statements = pct(data.total.statements);
  const branches = pct(data.total.branches);
  const functions = pct(data.total.functions);
  const lines = pct(data.total.lines);
  const belowThreshold =
    statements < coverageThresholds.statements ||
    branches < coverageThresholds.branches ||
    functions < coverageThresholds.functions ||
    lines < coverageThresholds.lines;
  const status = belowThreshold ? "failed" : "passed";
  return {
    gate: gate(status),
    summary: {
      statements,
      branches,
      functions,
      lines,
      thresholds: coverageThresholds,
      status,
    },
  };
}

// ---------- Playwright results ----------
// Each suite type is written to its own JSON file by playwright.config.ts's
// PW_REPORT_NAME (see package.json) specifically so that, say, running
// test:visual after test:e2e:full never erases the full-matrix E2E result
// before quality:collect gets a chance to read it.
function flattenSpecs(suites, prefix = "") {
  const specs = [];
  for (const suite of suites ?? []) {
    const filePath = prefix || suite.file || "";
    for (const spec of suite.specs ?? []) {
      specs.push({ file: filePath || suite.file, spec });
    }
    specs.push(...flattenSpecs(suite.suites, filePath || suite.file));
  }
  return specs;
}

function loadPlaywrightReport(name) {
  const data = readJsonSafe(
    path.join(GENERATED_DIR, `playwright-${name}-results.json`),
  );
  if (!data) return null;
  const specs = flattenSpecs(data.suites);
  const projectNames = new Set();
  for (const { spec } of specs) {
    for (const test of spec.tests ?? []) projectNames.add(test.projectName);
  }
  return {
    specs,
    failed: specs.filter(({ spec }) => !spec.ok).length,
    total: specs.length,
    projectNames,
  };
}

function collectPlaywright() {
  const fast = loadPlaywrightReport("fast");
  const full = loadPlaywrightReport("full");
  const functional = loadPlaywrightReport("functional");
  const crossBrowser = loadPlaywrightReport("cross-browser");
  const a11y = loadPlaywrightReport("a11y");
  const visualReport = loadPlaywrightReport("visual");

  const e2eFast = !fast
    ? gate("notAvailable")
    : fast.failed > 0
      ? gate("failed")
      : gate("passed");
  const splitFull =
    functional && crossBrowser
      ? { failed: functional.failed + crossBrowser.failed }
      : null;
  const fullGate = full ?? splitFull;
  const e2eFull = !fullGate
    ? gate("notRun")
    : fullGate.failed > 0
      ? gate("failed")
      : gate("passed");

  const accessibility = !a11y
    ? null
    : {
        scannedPages: a11y.total,
        status: a11y.failed > 0 ? "failed" : "passed",
      };

  const visual = !visualReport
    ? null
    : {
        comparedCount: visualReport.total,
        mismatches: visualReport.failed,
        status: visualReport.failed > 0 ? "failed" : "passed",
      };

  const reports = [
    fast,
    full,
    functional,
    crossBrowser,
    a11y,
    visualReport,
  ].filter(Boolean);
  const projectNames = new Set(reports.flatMap((r) => [...r.projectNames]));
  const playwrightSummary = reports.length
    ? {
        total: reports.reduce((sum, r) => sum + r.total, 0),
        failed: reports.reduce((sum, r) => sum + r.failed, 0),
        skipped: 0,
        browserProjects: projectNames.size,
      }
    : null;

  return { e2eFast, e2eFull, accessibility, visual, playwrightSummary };
}

// ---------- accessibility violation severities (best effort, from axe attachments) ----------
function collectAccessibilityViolations() {
  const dir = "test-results";
  const bySeverity = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  if (!existsSync(dir)) return bySeverity;
  const walk = (d) => {
    for (const entry of readdirSync(d)) {
      const full = path.join(d, entry);
      const stats = statSync(full);
      if (stats.isDirectory()) walk(full);
      else if (entry.startsWith("axe-") && entry.endsWith(".json")) {
        const data = readJsonSafe(full);
        for (const violation of data?.violations ?? []) {
          if (bySeverity[violation.impact] !== undefined)
            bySeverity[violation.impact] += violation.nodes?.length ?? 1;
        }
      }
    }
  };
  try {
    walk(dir);
  } catch {
    /* best effort */
  }
  return bySeverity;
}

// ---------- visual baselines on disk ----------
function collectVisualBaselineInfo() {
  const dir = "e2e/specs/__screenshots__";
  if (!existsSync(dir)) return { baselineCount: 0, lastBaselineUpdate: null };
  let count = 0;
  let latest = 0;
  const walk = (d) => {
    for (const entry of readdirSync(d)) {
      const full = path.join(d, entry);
      const stats = statSync(full);
      if (stats.isDirectory()) walk(full);
      else if (entry.endsWith(".png")) {
        count += 1;
        latest = Math.max(latest, stats.mtimeMs);
      }
    }
  };
  try {
    walk(dir);
  } catch {
    /* best effort */
  }
  return {
    baselineCount: count,
    lastBaselineUpdate: latest ? new Date(latest).toISOString() : null,
  };
}

// ---------- Lighthouse ----------
function collectLighthouse() {
  const routes = [];
  const manifestPaths = [
    ["quality/generated/lighthouse/login-desktop/manifest.json", "desktop"],
    ["quality/generated/lighthouse/login-mobile/manifest.json", "mobile"],
  ];
  for (const [manifestPath, device] of manifestPaths) {
    const manifest = readJsonSafe(manifestPath);
    if (!Array.isArray(manifest)) continue;
    for (const entry of manifest) {
      const lhr = readJsonSafe(
        path.join(
          path.dirname(manifestPath),
          path.basename(entry.jsonPath ?? ""),
        ),
      );
      if (!lhr) continue;
      routes.push({
        route: "/login",
        device,
        performance: lhr.categories?.performance?.score ?? null,
        accessibility: lhr.categories?.accessibility?.score ?? null,
        bestPractices: lhr.categories?.["best-practices"]?.score ?? null,
        seo: lhr.categories?.seo?.score ?? null,
        metrics: {
          largestContentfulPaintMs:
            lhr.audits?.["largest-contentful-paint"]?.numericValue,
          cumulativeLayoutShift:
            lhr.audits?.["cumulative-layout-shift"]?.numericValue,
          totalBlockingTimeMs:
            lhr.audits?.["total-blocking-time"]?.numericValue,
        },
      });
    }
  }
  for (const device of ["desktop", "mobile"]) {
    const summary = readJsonSafe(
      `quality/generated/lighthouse/authenticated-${device}-summary.json`,
    );
    for (const entry of summary ?? []) {
      routes.push({
        route: entry.route,
        device: entry.device,
        performance: entry.performance,
        accessibility: entry.accessibility,
        bestPractices: entry.bestPractices,
        seo: entry.seo,
        metrics: {},
      });
    }
  }
  if (!routes.length) return { gate: gate("notAvailable"), summary: null };
  const thresholds = {
    desktop: lighthouseThresholds.desktop,
    mobile: lighthouseThresholds.mobile,
  };
  const anyFailed = routes.some((r) => {
    const t = thresholds[r.device];
    if (!t) return false;
    return (
      (r.performance !== null && r.performance < t.performance) ||
      (r.accessibility !== null && r.accessibility < t.accessibility) ||
      (r.bestPractices !== null && r.bestPractices < t.bestPractices)
    );
  });
  const status = anyFailed ? "failed" : "passed";
  return {
    gate: gate(status),
    summary: { routes, thresholds, status },
  };
}

// ---------- git diff check ----------
function collectGitDiff() {
  try {
    execSync("git diff --check", { stdio: ["ignore", "pipe", "pipe"] });
    return gate("passed");
  } catch (err) {
    if (err.status === undefined) return gate("notAvailable");
    return gate(
      "failed",
      "git diff --check reported whitespace or conflict-marker issues.",
    );
  }
}

function main() {
  mkdirSync(GENERATED_DIR, { recursive: true });

  const buildMetadata = readJsonSafe(
    path.join(GENERATED_DIR, "build-metadata.json"),
  );
  const pkg = readJsonSafe("package.json");

  const lint = collectLint();
  const build = collectBuild();
  const { gate: unitTestsGate, summary: vitestSummary } = collectUnitTests();
  const { gate: coverageGate, summary: coverageSummary } = collectCoverage();
  const {
    e2eFast,
    e2eFull,
    accessibility: a11yFromPw,
    visual: visualFromPw,
    playwrightSummary,
  } = collectPlaywright();
  const gitDiff = collectGitDiff();
  const { gate: performanceGate, summary: performanceSummary } =
    collectLighthouse();

  const violationsBySeverity = collectAccessibilityViolations();
  const accessibility = a11yFromPw
    ? {
        scannedPages: a11yFromPw.scannedPages,
        violationsBySeverity,
        allowedIssues: [],
        manualReviewStatus: "notStarted",
        status: a11yFromPw.status,
      }
    : null;

  const visualBaselineInfo = collectVisualBaselineInfo();
  const visual = visualFromPw
    ? {
        baselineCount: visualBaselineInfo.baselineCount,
        comparedCount: visualFromPw.comparedCount,
        mismatches: visualFromPw.mismatches,
        baselineEnvironment:
          "visual-chromium (Windows local baselines pending Linux CI regeneration)",
        lastBaselineUpdate: visualBaselineInfo.lastBaselineUpdate,
        status: visualFromPw.status,
      }
    : null;

  const visualGate = visual ? gate(visual.status) : gate("notAvailable");
  const accessibilityGate = accessibility
    ? gate(accessibility.status)
    : gate("notAvailable");

  const gates = {
    lint,
    unitTests: unitTestsGate,
    coverage: coverageGate,
    build,
    e2eFast,
    e2eFull,
    accessibility: accessibilityGate,
    visual: visualGate,
    performance: performanceGate,
    manualChecklist: gate(
      "notRun",
      "Complete the versioned checklist in QA Center.",
    ),
    gitDiff,
  };

  const report = {
    schemaVersion: SCHEMA_VERSION,
    applicationVersion: buildMetadata?.version ?? pkg?.version ?? "0.0.0",
    commitSha: buildMetadata?.commitSha ?? null,
    branch: buildMetadata?.branch ?? null,
    environment: process.env.CI ? "CI" : "local",
    generatedAt: new Date().toISOString(),
    // A CI-only collector cannot know whether the manual release checklist was
    // completed by a human, so it never claims "ready" on its own — see
    // docs/quality-gates.md for the full release-status rules.
    overallStatus: "notEvaluated",
    gates,
    tests: {
      vitest: vitestSummary,
      playwright: playwrightSummary,
    },
    coverage: coverageSummary,
    accessibility,
    visual,
    performance: performanceSummary,
    knownIssues: null,
    analyzerSummary: null,
  };

  writeFileSync(
    path.join(GENERATED_DIR, "latest-quality-report.json"),
    JSON.stringify(report, null, 2),
  );

  const coverageOut = coverageSummary
    ? { ...coverageSummary, generatedAt: report.generatedAt }
    : {
        statements: null,
        branches: null,
        functions: null,
        lines: null,
        thresholds: coverageThresholds,
        status: "notAvailable",
        generatedAt: report.generatedAt,
      };
  writeFileSync(
    path.join(GENERATED_DIR, "coverage-summary.json"),
    JSON.stringify(coverageOut, null, 2),
  );

  writeFileSync(
    path.join(GENERATED_DIR, "lighthouse-summary.json"),
    JSON.stringify(
      {
        ...(performanceSummary ?? { routes: [], thresholds: null }),
        status: performanceGate.status,
        generatedAt: report.generatedAt,
      },
      null,
      2,
    ),
  );

  // Copy into public/ so the running app can fetch it as "the latest local generated
  // result" (see src/pages/QACenterPage.tsx). Never committed — see .gitignore.
  mkdirSync("public/generated", { recursive: true });
  writeFileSync(
    "public/generated/latest-quality-report.json",
    JSON.stringify(report, null, 2),
  );

  console.log("Wrote quality/generated/latest-quality-report.json");
  console.log(
    "Copied it to public/generated/latest-quality-report.json for local dev/preview.",
  );
  console.log(
    "Gates:",
    Object.fromEntries(Object.entries(gates).map(([k, v]) => [k, v.status])),
  );
}

main();
