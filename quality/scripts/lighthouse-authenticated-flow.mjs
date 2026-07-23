import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import puppeteer from "puppeteer";
import { desktopConfig, startFlow } from "lighthouse";
import { terminateProcessTree, waitForServer } from "./server-readiness.mjs";

const require = createRequire(import.meta.url);
const thresholds = require("../config/lighthouseThresholds.cjs");

const device = process.argv.includes("--mobile") ? "mobile" : "desktop";
const port = device === "desktop" ? 4175 : 4176;
const baseUrl = `http://127.0.0.1:${port}`;
const outDir = path.resolve("quality/generated/lighthouse");

const routes = [
  { path: "/", name: "Dashboard" },
  { path: "/search", name: "Search" },
  { path: "/assistant", name: "Assistant" },
  { path: "/workflows/new", name: "Workflow Builder" },
  { path: "/analytics", name: "Analytics" },
];

/**
 * Audits the authenticated AI Workspace routes with Lighthouse's
 * programmatic User Flow API instead of LHCI's puppeteerScript hook. The
 * puppeteerScript hook does not work here: it runs on a page Lighthouse then
 * discards, so our sessionStorage-based Demo Login never reaches the actual
 * audit tab (verified empirically — see docs/performance-testing.md). A User
 * Flow keeps one real page/tab for the whole session: we log in once, then
 * `flow.navigate()` each route on that same tab, so sessionStorage survives.
 */
async function main() {
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
      shell: true,
      stdio: "ignore",
    },
  );

  try {
    await waitForServer(`${baseUrl}/login`, {
      timeoutMs: 60_000,
      intervalMs: 500,
    });

    const browser = await puppeteer.launch({
      headless: true,
      // GitHub's hosted Ubuntu image does not expose a usable Chrome sandbox.
      // Keep the local/default sandbox intact and scope this exception to CI.
      args: process.env.CI ? ["--no-sandbox", "--disable-setuid-sandbox"] : [],
    });
    try {
      const page = await browser.newPage();
      if (device === "desktop") {
        await page.setViewport({
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
        });
      } else {
        await page.setViewport({
          width: 390,
          height: 844,
          deviceScaleFactor: 3,
          isMobile: true,
          hasTouch: true,
        });
      }

      await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle0" });
      await page.evaluate(() => {
        window.sessionStorage.setItem(
          "shabis-ai-academy-demo-session",
          "active",
        );
      });

      const flow = await startFlow(page, {
        name: `Authenticated app shell (${device})`,
        config: device === "desktop" ? desktopConfig : undefined,
      });

      for (const route of routes) {
        await flow.navigate(`${baseUrl}${route.path}`, { name: route.name });
      }

      await mkdir(outDir, { recursive: true });
      const flowResult = await flow.createFlowResult();
      await writeFile(
        path.join(outDir, `authenticated-${device}.json`),
        JSON.stringify(flowResult, null, 2),
      );
      const html = await flow.generateReport();
      await writeFile(path.join(outDir, `authenticated-${device}.html`), html);

      const deviceThresholds = thresholds[device];
      let allPassed = true;
      const summaries = [];
      for (const step of flowResult.steps) {
        if (step.lhr.gatherMode !== "navigation") continue;
        const performance = step.lhr.categories.performance?.score ?? null;
        const accessibility = step.lhr.categories.accessibility?.score ?? null;
        const bestPractices =
          step.lhr.categories["best-practices"]?.score ?? null;
        const seo = step.lhr.categories.seo?.score ?? null;
        const pass =
          (performance === null ||
            performance >= deviceThresholds.performance) &&
          (accessibility === null ||
            accessibility >= deviceThresholds.accessibility) &&
          (bestPractices === null ||
            bestPractices >= deviceThresholds.bestPractices);
        if (!pass) allPassed = false;
        const route = new URL(step.lhr.requestedUrl).pathname;
        summaries.push({
          route,
          device,
          performance,
          accessibility,
          bestPractices,
          seo,
          pass,
        });
        console.log(
          `[${device}] ${step.name}: performance=${performance} accessibility=${accessibility} bestPractices=${bestPractices} seo=${seo} -> ${pass ? "PASS" : "FAIL"}`,
        );
      }

      await writeFile(
        path.join(outDir, `authenticated-${device}-summary.json`),
        JSON.stringify(summaries, null, 2),
      );

      if (!allPassed) {
        console.error(
          `Lighthouse authenticated flow (${device}) failed one or more thresholds.`,
        );
        process.exitCode = 1;
      }
    } finally {
      await browser.close();
    }
  } finally {
    terminateProcessTree(server);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
