import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const read = (name) => JSON.parse(readFileSync(`quality/inventory/${name}.json`, "utf8"));
const routes = read("routes");
const pages = read("pages");
const controls = read("controls");
const journeys = read("userJourneys");
const personas = read("personas");
const viewports = read("viewports");
const authStates = read("authStates");
const dataStates = read("dataStates");
const branch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
const commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const { version } = JSON.parse(readFileSync("package.json", "utf8"));
const generated = "quality/generated";
mkdirSync(generated, { recursive: true });

const artifact = (name, fallback) => existsSync(`${generated}/${name}.json`) ? JSON.parse(readFileSync(`${generated}/${name}.json`, "utf8")) : fallback;
const notRun = { status: "notRun", findings: [], note: "Run the associated browser or manual review command to populate this section." };
const routeCoverage = artifact("route-coverage", { ...notRun, registeredRoutes: routes.length, visitedRoutes: 0, unreachableRoutes: [], orphanRoutes: [], brokenLinks: [], redirects: [], routeAccessStatus: [] });
const deadControls = artifact("dead-controls", { ...notRun, findings: [] });
const taskCompletion = artifact("task-completion-report", { ...notRun, tasks: journeys.map((journey) => ({ id: journey.id, status: "notRun", expectedSteps: journey.expectedSteps, maximumSteps: journey.maximumSteps })) });
const browserErrors = artifact("browser-errors", { ...notRun, consoleErrors: [], networkErrors: [] });
const copyQuality = artifact("copy-quality", { ...notRun, findings: [] });
const heuristics = artifact("ux-heuristics-report", { ...notRun, manualApprovalRequired: true, pagesReviewed: 0, findings: [] });
const manualUxReview = JSON.parse(readFileSync("quality/checklists/manual-ux-review.json", "utf8"));
const findings = [...deadControls.findings, ...copyQuality.findings, ...heuristics.findings];
const severityCounts = ["Critical", "High", "Medium", "Low"].reduce((result, severity) => ({ ...result, [severity]: findings.filter((finding) => finding.severity === severity).length }), {});
const visualRegression = artifact("visual-gallery", notRun);
const automatedSections = [routeCoverage, deadControls, taskCompletion, browserErrors, artifact("form-coverage", notRun), artifact("overlay-coverage", notRun), visualRegression];
const automatedFailure = automatedSections.some((section) => section.status === "failed");
const releaseStatus = severityCounts.Critical || severityCounts.High || automatedFailure || manualUxReview.status === "failed" ? "blocked" : manualUxReview.status === "passed" ? "ready" : "readyWithWarnings";

const report = {
  generatedAt: new Date().toISOString(), applicationVersion: version, commit, branch, releaseStatus,
  inventory: { routeCount: routes.length, pageCount: pages.length, controlCount: controls.length, journeyCount: journeys.length, personaCount: personas.length },
  routeCoverage, pageCoverage: { inventoried: pages.length, exercised: routeCoverage.visitedRoutes ?? 0 }, controlCoverage: { inventoried: controls.length, audited: deadControls.auditedControls ?? 0 }, clickCoverage: deadControls,
  journeyCoverage: { registered: journeys.length, results: taskCompletion.tasks }, taskCompletion,
  formCoverage: artifact("form-coverage", notRun), overlayCoverage: artifact("overlay-coverage", notRun),
  authStateCoverage: { required: authStates.length, states: authStates.map((state) => state.id) }, dataStateCoverage: { required: dataStates.length, states: dataStates.map((state) => state.id) },
  viewportCoverage: { required: viewports.length, viewports }, languageCoverage: { required: ["he", "en"] }, accessibility: artifact("accessibility-summary", notRun), visualRegression,
  consoleErrors: browserErrors.consoleErrors ?? [], networkErrors: browserErrors.networkErrors ?? [], copyQuality, deadControls, uxHeuristics: heuristics,
  exploratorySessions: { required: 16, completed: 0, status: "notRun" }, manualUxReview, severityCounts,
  knownLimitations: manualUxReview.status === "notRun" ? ["Subjective manual UX review has not been completed; this report does not claim UX approval."] : [],
};
writeFileSync(`${generated}/system-quality-report.json`, `${JSON.stringify(report, null, 2)}\n`);
const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const rows = Object.entries({ "Routes inventoried": routes.length, "Pages inventoried": pages.length, "Controls inventoried": controls.length, "Journeys registered": journeys.length, "Personas": personas.length, "Auth states": authStates.length, "Data states": dataStates.length, "Viewports": viewports.length, "Manual UX review": manualUxReview.status }).map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value)}</td></tr>`).join("");
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>System Quality Report</title><style>body{font:16px system-ui;max-width:960px;margin:auto;padding:2rem;color:#172033}h1{margin-bottom:.25rem}.status{padding:.75rem;border:2px solid #8b5e00;background:#fff8df}table{border-collapse:collapse;width:100%}th,td{padding:.65rem;border:1px solid #ccd3df;text-align:left}pre{white-space:pre-wrap;background:#f4f6f9;padding:1rem}</style><h1>Shabi's AI Academy system quality report</h1><p>Version ${escape(version)} · ${escape(branch)} · ${escape(commit.slice(0, 12))}</p><p class="status"><strong>${escape(releaseStatus)}</strong> — manual UX review: ${escape(manualUxReview.status)}. This report does not claim UX approval while the gate is notRun.</p><table>${rows}</table><h2>Severity</h2><pre>${escape(JSON.stringify(severityCounts, null, 2))}</pre><h2>Known limitations</h2><ul>${report.knownLimitations.map((item) => `<li>${escape(item)}</li>`).join("") || "<li>None recorded.</li>"}</ul></html>`;
writeFileSync(`${generated}/system-quality-report.html`, html);
console.log(`System quality report: ${releaseStatus}; manual UX review: ${manualUxReview.status}.`);
