import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { extractCompletedLighthouseReport, isWindowsLighthouseCleanupOnlyFailure, lighthouseTempPaths, removeWithBoundedRetry } from "./lighthouse-cleanup.mjs";
import {
  terminateProcessTreeAndWait,
  waitForServer,
} from "./server-readiness.mjs";

const mode = process.argv[2];
const require = createRequire(import.meta.url);
const collectCommand = require("@lhci/cli/src/collect/collect.js");
const { saveLHR } = require("@lhci/utils/src/saved-reports.js");
const profiles = [
  { config: "lighthouserc.cjs", port: 4173 },
  { config: "lighthouserc.mobile.cjs", port: 4174 },
];

function run(cmd, args) {
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { stdio: "inherit", shell: true });
}

const cleanupWarnings = [];

async function runLhciCollect(config) {
  const options = require(resolve(config)).ci.collect;
  try {
    await collectCommand.runCommand({ ...options, additive: true });
    return;
  } catch (error) {
    const output = `${error?.stderr ?? ""}\n${error?.stack ?? ""}`;
    const report = extractCompletedLighthouseReport(error?.stdout ?? "");
    if (!isWindowsLighthouseCleanupOnlyFailure(output) || !report) throw error;
    await saveLHR(JSON.stringify(report));
    for (const path of lighthouseTempPaths(output, tmpdir())) {
      try { await removeWithBoundedRetry(path); } catch { /* Cleanup remains a host warning after valid reports were written. */ }
    }
  }
  cleanupWarnings.push({ config, code: "LIGHTHOUSE_WINDOWS_TEMP_CLEANUP", reportsWritten: 1 });
  console.warn("Lighthouse reports were written, but Windows temporary-directory cleanup needed bounded recovery.");
}

async function collectProfile(config, port) {
  const server = spawn(
    "npm",
    [
      "run",
      "preview",
      "--",
      "--port",
      String(port),
      "--host",
      "127.0.0.1",
      "--strictPort",
    ],
    {
      stdio: "inherit",
      shell: true,
    },
  );
  try {
    await waitForServer(`http://127.0.0.1:${port}/login`);
    await runLhciCollect(config);
  } finally {
    await terminateProcessTreeAndWait(server);
  }
}

let failed = false;

if (mode === "collect") {
  // Public routes (Login desktop + mobile) via the official @lhci/cli collector.
  if (existsSync(".lighthouseci"))
    rmSync(".lighthouseci", { recursive: true, force: true });
  for (const { config, port } of profiles) {
    await collectProfile(config, port);
  }
  // Authenticated app shell (Dashboard, QA Center) via the custom User Flow script —
  // see quality/scripts/lighthouse-authenticated-flow.mjs for why LHCI's own
  // puppeteerScript hook cannot be used here. This step also asserts thresholds
  // and exits non-zero on failure, since the flow script is collect+assert combined.
  for (const deviceArgs of [[], ["--mobile"]]) {
    try {
      run("node", [
        "quality/scripts/lighthouse-authenticated-flow.mjs",
        ...deviceArgs,
      ]);
    } catch {
      failed = true;
    }
  }
} else if (mode === "assert") {
  for (const { config } of profiles) {
    try {
      run("npx", ["lhci", "assert", `--config=${config}`]);
      run("npx", ["lhci", "upload", `--config=${config}`]);
    } catch {
      failed = true;
    }
  }
} else {
  console.error(
    "Usage: node quality/scripts/run-lighthouse.mjs <collect|assert>",
  );
  process.exit(1);
}

if (failed) {
  console.error("\nOne or more Lighthouse checks failed.");
  process.exit(1);
}

if (mode === "collect") {
  const cleanupStatusPath = "quality/generated/lighthouse/cleanup-status.json";
  mkdirSync(dirname(cleanupStatusPath), { recursive: true });
  writeFileSync(cleanupStatusPath, `${JSON.stringify({ status: cleanupWarnings.length ? "passedWithWarnings" : "passed", warnings: cleanupWarnings }, null, 2)}\n`);
}
