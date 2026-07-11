import { execFileSync, spawn } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { waitForServer } from "./server-readiness.mjs";

const mode = process.argv[2];
const profiles = [
  { config: "lighthouserc.cjs", port: 4173 },
  { config: "lighthouserc.mobile.cjs", port: 4174 },
];

function run(cmd, args) {
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { stdio: "inherit", shell: true });
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
    run("npx", ["lhci", "collect", `--config=${config}`]);
  } finally {
    if (process.platform === "win32") {
      try {
        execFileSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
          stdio: "ignore",
        });
      } catch {
        // The process may already have exited.
      }
    } else server.kill("SIGTERM");
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
