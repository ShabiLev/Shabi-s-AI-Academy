import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

const mode = process.argv[2];
const profiles = [{ config: "lighthouserc.cjs" }, { config: "lighthouserc.mobile.cjs" }];

function run(cmd, args) {
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { stdio: "inherit", shell: true });
}

let failed = false;

if (mode === "collect") {
  // Public routes (Login desktop + mobile) via the official @lhci/cli collector.
  if (existsSync(".lighthouseci")) rmSync(".lighthouseci", { recursive: true, force: true });
  for (const { config } of profiles) {
    run("npx", ["lhci", "collect", `--config=${config}`]);
  }
  // Authenticated app shell (Dashboard, QA Center) via the custom User Flow script —
  // see quality/scripts/lighthouse-authenticated-flow.mjs for why LHCI's own
  // puppeteerScript hook cannot be used here. This step also asserts thresholds
  // and exits non-zero on failure, since the flow script is collect+assert combined.
  for (const deviceArgs of [[], ["--mobile"]]) {
    try {
      run("node", ["quality/scripts/lighthouse-authenticated-flow.mjs", ...deviceArgs]);
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
  console.error("Usage: node quality/scripts/run-lighthouse.mjs <collect|assert>");
  process.exit(1);
}

if (failed) {
  console.error("\nOne or more Lighthouse checks failed.");
  process.exit(1);
}
