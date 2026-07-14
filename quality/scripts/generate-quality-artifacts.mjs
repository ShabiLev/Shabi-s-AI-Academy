import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, relative } from "node:path";

const generated = "quality/generated";
mkdirSync(generated, { recursive: true });
const readJson = (path, fallback) => existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : fallback;
const pages = readJson("quality/inventory/pages.json", []);
const journeys = readJson("quality/inventory/userJourneys.json", []);
const checklist = readJson("quality/checklists/ux-heuristics.json", { heuristics: [] });

const heuristicReport = {
  status: "notRun", manualApprovalRequired: true, pagesReviewed: 0,
  reviews: pages.map((page) => ({ pageId: page.pageId, route: page.route, heuristics: checklist.heuristics.map((heuristic) => ({ heuristic, status: "Not Applicable", finding: "Manual review not run", screenshot: "", impact: "Unknown until reviewed", recommendation: "Complete the structured manual review", owner: "Unassigned", releaseDecision: "readyWithWarnings" })) })),
  findings: [], note: "Not Applicable is a placeholder until a human reviewer records Pass, Warning, or Fail. This artifact is not UX approval.",
};
writeFileSync(`${generated}/ux-heuristics-report.json`, `${JSON.stringify(heuristicReport, null, 2)}\n`);

const journeyResults = readJson(`${generated}/playwright-journeys-results.json`, null);
const tests = [];
const collect = (suite, parent = "") => { const location = `${parent}/${suite.title ?? ""}`; for (const spec of suite.specs ?? []) for (const test of spec.tests ?? []) tests.push({ location: `${location}/${spec.file ?? ""}/${spec.title}`.toLowerCase(), status: test.results?.at(-1)?.status ?? "notRun" }); for (const child of suite.suites ?? []) collect(child, location); };
for (const suite of journeyResults?.suites ?? []) collect(suite);
const tasks = journeys.map((journey) => { const result = tests.find((test) => test.location.includes(`${journey.id}.spec`)); return { id: journey.id, expectedSteps: journey.expectedSteps, maximumSteps: journey.maximumSteps, status: result?.status === "passed" ? "passed" : result ? "failed" : "notRun", completionIndicator: journey.completionIndicator, recoveryBehavior: journey.recoveryBehavior, helpAvailable: journey.helpAvailable, cancellable: journey.cancellable, persistsAcrossRefresh: journey.persistsAcrossRefresh }; });
const taskReport = { status: tasks.some((task) => task.status === "failed") ? "failed" : tasks.every((task) => task.status === "passed") ? "passed" : "notRun", blockedTasks: tasks.filter((task) => task.status === "failed").map((task) => task.id), tasks };
writeFileSync(`${generated}/task-completion-report.json`, `${JSON.stringify(taskReport, null, 2)}\n`);

const resultFiles = existsSync(generated) ? readdirSync(generated).filter((name) => /^playwright-.*-results\.json$/.test(name)) : [];
const browserFindings = [];
for (const name of resultFiles) { const result = readJson(`${generated}/${name}`, {}); const walk = (suite) => { for (const spec of suite.specs ?? []) for (const test of spec.tests ?? []) for (const run of test.results ?? []) for (const error of run.errors ?? []) { const message = error.message ?? String(error); if (/unexpected browser errors|pageerror|console error|uncaught|unhandled promise|network error|cors|failed static asset/i.test(message)) browserFindings.push({ suite: name, test: spec.title, message }); } for (const child of suite.suites ?? []) walk(child); }; for (const suite of result.suites ?? []) walk(suite); }
const browserErrors = { status: browserFindings.length ? "failed" : resultFiles.length ? "passed" : "notRun", resultFiles, consoleErrors: browserFindings, networkErrors: [] };
writeFileSync(`${generated}/browser-errors.json`, `${JSON.stringify(browserErrors, null, 2)}\n`);
const a11yResults = readJson(`${generated}/playwright-a11y-results.json`, null);
const accessibilitySummary = { status: a11yResults?.stats?.unexpected ? "failed" : a11yResults ? "passed" : "notRun", passedTests: a11yResults?.stats?.expected ?? 0, failedTests: a11yResults?.stats?.unexpected ?? 0 };
writeFileSync(`${generated}/accessibility-summary.json`, `${JSON.stringify(accessibilitySummary, null, 2)}\n`);

const walkFiles = (dir) => existsSync(dir) ? readdirSync(dir).flatMap((name) => { const path = `${dir}/${name}`; return statSync(path).isDirectory() ? walkFiles(path) : [path]; }) : [];
const images = [...walkFiles("e2e/specs/__screenshots__"), ...walkFiles("test-results")].filter((path) => /\.png$/i.test(path));
const imageRecords = images.map((path) => ({ testName: basename(path, ".png"), route: "See test name", viewport: "Encoded by baseline/test project", language: /-he-|hebrew/i.test(path) ? "he" : /-en-|english/i.test(path) ? "en" : "documented by test", state: /diff/i.test(path) ? "diff" : /actual/i.test(path) ? "actual" : "expected", path: relative(".", path).replaceAll("\\", "/") }));
const visualResults = readJson(`${generated}/playwright-visual-results.json`, null);
const gallery = { status: visualResults?.stats?.unexpected ? "failed" : visualResults ? "passed" : imageRecords.length ? "available" : "notRun", expectedTests: visualResults?.stats?.expected ?? 0, failedTests: visualResults?.stats?.unexpected ?? 0, images: imageRecords.length, records: imageRecords };
writeFileSync(`${generated}/visual-gallery.json`, `${JSON.stringify(gallery, null, 2)}\n`);
const cards = imageRecords.map((item) => `<article><h2>${item.testName}</h2><p>${item.route} · ${item.viewport} · ${item.language} · ${item.state}</p><img loading="lazy" src="../../${item.path}" alt="${item.testName}"></article>`).join("");
writeFileSync(`${generated}/visual-gallery.html`, `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Visual review gallery</title><style>body{font:14px system-ui;margin:1rem;background:#eef1f5;color:#172033}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1rem}article{background:white;padding:1rem;border:1px solid #ccd3df}img{max-width:100%;height:auto;border:1px solid #778}</style><h1>Visual review gallery</h1><p>Baseline updates are not approval. Review expected, actual, and diff evidence before setting VISUAL_UPDATE_APPROVED=1.</p><main>${cards}</main></html>`);
console.log(`Generated UX, task, browser-error, and visual-gallery artifacts (${imageRecords.length} images).`);
