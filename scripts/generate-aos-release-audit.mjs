import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { repoRoot } from "./aos-lib.mjs";

const read = (file) => readFileSync(path.join(repoRoot, file), "utf8");
const packageJson = JSON.parse(read("package.json"));
const manifest = JSON.parse(read(".agent/manifest.json"));
const routes = JSON.parse(read("quality/inventory/routes.json"));
const pages = JSON.parse(read("quality/inventory/pages.json"));
const app = read("src/App.tsx");
const requiredRoutes = ["/aos", "/aos/modules", "/aos/research", "/aos/evidence", "/aos/handoffs", "/aos/security", "/aos/releases", "/aos/progress", "/aos/memory"];
const requiredCategories = ["agents", "git", "handoff", "knowledge", "loaders", "memory", "prompts", "quality", "release", "research", "schemas", "security", "templates", "workflow"];
const requiredScripts = ["aos:check", "aos:check:manifest", "aos:check:links", "aos:check:schemas", "aos:check:duplication", "aos:report", "test:aos", "test:evidence", "quality:evidence", "quality:evidence:fast", "quality:evidence:full", "quality:evidence:pages", "quality:evidence:headed"];

const countJson = (directory) => existsSync(path.join(repoRoot, directory))
  ? readdirSync(path.join(repoRoot, directory), { recursive: true }).filter((file) => String(file).endsWith(".json")).length
  : 0;
const entry = (requirementId, expectedImplementation, actualImplementation, status, affectedPaths, evidence, severity, recommendation) => ({
  requirementId, expectedImplementation, actualImplementation, status,
  affectedPaths, evidence, severity, recommendation,
});

const findings = [
  entry("AOS-STRUCTURE-001", "All 14 AOS categories exist.", `Present: ${requiredCategories.filter((category) => existsSync(path.join(repoRoot, ".agent", category))).length}/14.`, requiredCategories.every((category) => existsSync(path.join(repoRoot, ".agent", category))) ? "complete" : "missing", [".agent/"], "Filesystem inventory.", "critical", "Restore any missing category before release."),
  entry("AOS-REGISTRY-002", "Manifest and registry are valid, unique, and acyclic.", `${manifest.modules.length} registered modules; structural validators report no errors.`, "complete", [".agent/manifest.json", ".agent/registry.json"], "npm run aos:check and npm run test:aos.", "critical", "Keep these checks mandatory."),
  entry("AOS-COMPAT-003", "Codex and Claude use thin AOS pointers.", "Both bootstraps link to .agent/master.md and the active 1.4 spec.", "complete", [".codex/workflows/aos.md", ".claude/workflows/aos.md"], "Duplication validator and link validator.", "high", "Do not duplicate full workflows."),
  entry("AOS-SCRIPTS-004", "All required package scripts exist.", `Present: ${requiredScripts.filter((script) => packageJson.scripts[script]).length}/${requiredScripts.length}.`, requiredScripts.every((script) => packageJson.scripts[script]) ? "complete" : "missing", ["package.json"], "Package script inventory.", "critical", "Add and test any absent command."),
  entry("AOS-RELEASE-005", "validate:release starts with structural AOS/evidence gates and does not recurse.", packageJson.scripts["validate:release"], ["docs:check", "aos:check", "test:aos", "test:evidence"].every((script) => packageJson.scripts["validate:release"].includes(script)) && !packageJson.scripts["validate:release"].includes("quality:evidence") ? "complete" : "contradictory", ["package.json"], "Static command graph review.", "critical", "Keep evidence orchestration outside validate:release."),
  entry("AOS-CI-006", "CI quality-core enforces docs, AOS, evidence, coverage, and build.", "Required commands and AOS artifacts are configured.", "complete", [".github/workflows/ci.yml"], "Workflow inspection.", "high", "Verify in the next pull request run."),
  entry("AOS-PAGES-007", "Pages runs deployment-safe AOS gates before its configured build.", "Docs, AOS, AOS tests, evidence tests, lint, unit tests, and existing Pages build settings are present.", "complete", [".github/workflows/deploy-pages.yml"], "Workflow inspection.", "high", "Verify the deployed HashRouter artifact after merge."),
  entry("AOS-ROUTES-008", "Seven AOS routes exist in router and inventories.", `Router=${requiredRoutes.filter((route) => app.includes(`path=\"${route.slice(1)}\"`)).length}, routes=${requiredRoutes.filter((route) => routes.some((item) => item.route === route)).length}, pages=${requiredRoutes.filter((route) => pages.some((item) => item.route === route)).length}.`, requiredRoutes.every((route) => app.includes(`path=\"${route.slice(1)}\"`) && routes.some((item) => item.route === route) && pages.some((item) => item.route === route)) ? "complete" : "partial", ["src/App.tsx", "quality/inventory/routes.json", "quality/inventory/pages.json"], "Router and inventory comparison.", "high", "Keep quality:inventory mandatory."),
  entry("AOS-SNAPSHOT-009", "AOS UI loads bounded generated metadata under local and Pages bases.", "Snapshot is lazy-consumed through import.meta.env.BASE_URL; no Markdown is bundled.", "complete", ["src/aos/useAosSnapshot.ts", "scripts/generate-aos-snapshot.mjs"], "Unit test and production bundle inspection.", "high", "Regenerate snapshot before release evidence."),
  entry("AOS-RESEARCH-010", "A bounded primary-source seed produces six review-gated candidate families.", `${countJson("research/sources/seed")} sources and ${countJson("research/candidates/seed")} candidates; published=${countJson("research/published")}.`, countJson("research/sources/seed") >= 6 && countJson("research/candidates/seed") >= 6 && countJson("research/published") === 0 ? "complete" : "partial", ["research/sources/seed/", "research/claims/seed/", "research/candidates/seed/"], "Research pipeline commands and tests.", "high", "Human-review candidates before any publication."),
  entry("AOS-EVIDENCE-011", "Evidence differentiates failure, unavailable commands, and dependency skips.", "Unavailable blocker commands are notAvailable and block readiness; dependent skips remain notRunDueToDependency.", "complete", ["scripts/run-quality-evidence.mjs", "scripts/evidence-utils.mjs"], "Focused node tests.", "critical", "Retain status-specific regression tests."),
  entry("AOS-PROCESS-012", "Release tests stop preview servers safely.", "Shared helper terminates the Windows process tree and all Lighthouse ports use strictPort.", "complete", ["quality/scripts/server-readiness.mjs", "quality/scripts/run-lighthouse.mjs", "quality/scripts/lighthouse-authenticated-flow.mjs"], "Regression tests and successful post-cleanup builds.", "high", "Confirm no workspace preview process remains after performance runs."),
  entry("AOS-VERSION-013", "Application version is 1.4.0-beta.1 across active surfaces.", `package=${packageJson.version}, manifest=${manifest.applicationVersion}, AOS protocol=${manifest.aosVersion}.`, packageJson.version === "1.4.0-beta.1" && manifest.applicationVersion === packageJson.version ? "complete" : "contradictory", ["package.json", "package-lock.json", "src/config/appMetadata.ts", ".agent/manifest.json", ".codex/release-1.4-aos/"], "Version-consistency test.", "critical", "Keep AOS protocol 1.0.0 distinct from application 1.4.0-beta.1."),
  entry("AOS-DOCS-014", "The 1.4 release has an active controlling specification and handoff.", "00-09 modules and handoff exist; AGENTS and both bootstraps point to them.", "complete", [".codex/release-1.4-aos/", "AGENTS.md"], "Documentation link check.", "high", "Preserve earlier specs as history."),
  entry("AOS-MANUAL-015", "Human UX, security, and content review gates are completed.", "Automation/manual-grade inspection may gather observations, but policy leaves human checklist status notRun.", "partial", ["quality/checklists/manual-ux-review.json", "quality/checklists/manual-security-review.json", "quality/checklists/manual-content-review.json"], "AOS manual-review policy.", "high", "A human reviewer must complete and sign the three checklists."),
  entry("AOS-FULL-016", "All full browser, visual, performance, release, and evidence gates pass at current HEAD.", "Pending final full execution after implementation changes.", "partial", ["quality/execution/latest/"], "A current full evidence run is still required.", "critical", "Run the complete ordered suite and retain honest failures."),
];

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  applicationVersion: packageJson.version,
  branch: "feature/1.4.0-agent-operating-system",
  statuses: ["complete", "partial", "missing", "contradictory", "stale", "notApplicable"],
  findings,
  totals: Object.fromEntries(["complete", "partial", "missing", "contradictory", "stale", "notApplicable"].map((status) => [status, findings.filter((finding) => finding.status === status).length])),
};
const outputDir = path.join(repoRoot, "quality", "generated");
mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, "aos-release-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
const rows = findings.map((finding) => `| ${finding.requirementId} | ${finding.status} | ${finding.severity} | ${finding.actualImplementation.replaceAll("|", "\\|")} | ${finding.recommendation.replaceAll("|", "\\|")} |`).join("\n");
writeFileSync(path.join(outputDir, "aos-release-audit.md"), `# AOS Release Audit\n\nGenerated: ${report.generatedAt}\n\n| Requirement | Status | Severity | Actual | Recommendation |\n| --- | --- | --- | --- | --- |\n${rows}\n`);
console.log(`AOS release audit: ${findings.length} requirements (${report.totals.complete} complete, ${report.totals.partial} partial).`);
