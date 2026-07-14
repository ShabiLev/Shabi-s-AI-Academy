import { mkdirSync, writeFileSync } from "node:fs";

const inventoryDir = "quality/inventory";
const exploratoryDir = "quality/exploratory";
mkdirSync(inventoryDir, { recursive: true });
mkdirSync(exploratoryDir, { recursive: true });

const routeGroups = {
  public: ["/", "/login", "/auth/login", "/auth/register", "/auth/forgot-password", "/auth/verify-email", "/auth/reset-password", "/auth/callback", "/auth/error", "/about", "/privacy", "/terms", "/*"],
  learning: ["/dashboard", "/onboarding", "/lessons", "/lessons/:lessonSlug", "/journey", "/radar"],
  prompts: ["/prompt-library", "/prompts", "/prompts/new", "/prompts/catalog", "/prompts/catalog/:catalogId", "/prompts/packs", "/prompts/:promptId", "/prompts/:promptId/edit", "/playground/prompts"],
  agents: ["/agents", "/agents/catalog", "/agents/new", "/agents/:agentId", "/agents/:agentId/edit", "/agents/:agentId/simulate", "/playground/agents"],
  workspace: ["/projects", "/projects/new", "/projects/:projectId", "/projects/:projectId/settings", "/knowledge", "/knowledge/new", "/knowledge/:documentId", "/knowledge/:documentId/edit", "/workflows", "/workflows/new", "/workflows/:workflowId", "/runs", "/runs/:runId"],
  system: ["/how-to", "/help", "/glossary", "/roadmap", "/changelog", "/docs", "/release", "/developer", "/search", "/assistant", "/analytics", "/settings", "/profile", "/account/security", "/account/migration", "/admin", "/admin/users", "/admin/content", "/admin/audit", "/qa"],
};

const routes = Object.entries(routeGroups).flatMap(([group, paths]) => paths.map((route) => ({
  route,
  pageId: route === "/" ? "landing" : route === "/*" ? "not-found" : route.slice(1).replaceAll("/", ".").replaceAll(":", "by-"),
  group,
  production: true,
  parameterExample: route === "/*" ? "/quality-route-that-does-not-exist" : route.replace(":lessonSlug", "api-testing-basics").replace(":catalogId", "api-test-generator").replace(":promptId", "test-prompt").replace(":agentId", "regression-scope-planner").replace(":projectId", "test-project").replace(":documentId", "test-document").replace(":workflowId", "test-workflow").replace(":runId", "test-run"),
  access: group === "public" ? "public" : route.startsWith("/admin") ? "admin" : route.startsWith("/account/") ? "authenticated" : "guest-or-authenticated",
  routerModes: ["browser", "hash"],
})));

const title = (route) => route === "/" ? "Landing" : route.split("/").filter(Boolean).map((part) => part.startsWith(":") ? "Details" : part.replaceAll("-", " ")).map((part) => part.replace(/\b\w/g, (c) => c.toUpperCase())).join(" - ");
const isForm = (route) => /(?:new|edit|settings|register|login|forgot-password|reset-password|onboarding|migration)$/.test(route);
const pages = routes.map((record) => ({
  route: record.route,
  pageId: record.pageId,
  title: title(record.route),
  accessRequirement: record.access,
  supportedLanguages: ["he", "en"],
  experienceModes: record.group === "public" ? ["not-applicable"] : ["beginner", "advanced"],
  primaryTask: record.route === "/" ? "Understand the academy and choose how to begin" : `Complete the primary ${title(record.route).toLowerCase()} task`,
  primaryAction: isForm(record.route) ? "Submit the form safely" : "Open or continue the primary content",
  secondaryActions: ["Open contextual Help", "Navigate to a related page", "Return to the logical parent"],
  expectedControls: isForm(record.route) ? ["labeled fields", "submit", "cancel or back", "help"] : ["primary action", "navigation", "help"],
  expectedEmptyState: "Explains why no data is shown and provides a safe next action",
  expectedLoadingState: "Communicates progress without exposing a blank page or allowing duplicate submission",
  expectedErrorState: "Explains impact and provides retry, cancel, or safe recovery",
  expectedMobileBehavior: "Single-column, touch-reachable, no horizontal overflow, overlays contained in viewport",
  expectedDesktopBehavior: "Readable content hierarchy, active navigation, bounded line length, no overlap",
  expectedBreadcrumb: record.group === "public" || record.route === "/dashboard" ? "not-applicable" : `Dashboard > ${title(record.route)}`,
  expectedHelpContent: "Purpose, primary task, terminology, and recovery guidance in Hebrew and English",
  expectedAnalyticsEvent: `page_view:${record.pageId}`,
  visualBaselineRequirement: "Hebrew desktop, English desktop, mobile, and representative complex state",
  accessibilityRequirement: "WCAG 2.2 AA semantics, keyboard access, visible focus, status announcements, and 200% zoom support",
}));

const controls = pages.flatMap((page) => page.expectedControls.map((kind, index) => ({
  controlId: `${page.pageId}:${kind.replaceAll(" ", "-")}`,
  pageId: page.pageId,
  route: page.route,
  kind,
  destructive: false,
  expectedAccessibleName: true,
  expectedFeedback: index === 0 ? "Visible state change, route change, validation, or completion message" : "Clear response appropriate to the control",
  audit: "automated-and-manual",
})));

const personas = [
  ["new-beginner-guest", "New Beginner Guest", "he", "beginner", "unauthenticated", "empty", "mobile"],
  ["returning-beginner", "Returning Beginner User", "he", "beginner", "guest", "partially-populated", "desktop"],
  ["advanced-qa", "Advanced QA User", "en", "advanced", "guest", "heavily-populated", "desktop"],
  ["guest-local-data", "Guest with Existing Local Data", "he", "beginner", "guest", "local-only", "desktop"],
  ["cloud-user", "Authenticated Cloud User", "en", "advanced", "authenticated", "cloud-only", "desktop-and-mobile"],
  ["offline-user", "Offline Authenticated User", "en", "advanced", "offline", "sync-pending", "desktop"],
  ["accessibility-user", "Accessibility User", "he", "beginner", "guest", "first-use", "keyboard-zoom-reduced-motion"],
  ["admin-standard-boundary", "Admin and Standard User", "en", "advanced", "admin-and-standard", "partially-populated", "desktop"],
].map(([id, name, language, mode, authState, dataState, device]) => ({ id, name, language, mode, authState, dataState, device, fixture: id.replaceAll("-", "_") }));

const authStates = ["unauthenticated", "guest", "authenticated", "email-unverified", "session-loading", "session-expired", "password-recovery", "supabase-unavailable", "offline", "admin", "standard-user"].map((id) => ({ id, expectedOutcome: "The UI identifies the state, preserves safe local work, and provides an appropriate next action" }));
const dataStates = ["completely-empty", "first-use", "partially-populated", "heavily-populated", "malformed-local-storage", "outdated-schema", "local-only", "cloud-only", "local-cloud-identical", "local-cloud-conflicting", "sync-pending", "sync-failed", "storage-near-limit"].map((id) => ({ id, expectedOutcome: "No blank page or silent data loss; state and recovery are understandable" }));
const viewports = [[320,568,"small-mobile"],[360,800,"mobile"],[390,844,"large-mobile"],[768,1024,"tablet-portrait"],[1024,768,"tablet-landscape"],[1440,900,"desktop"],[1920,1080,"large-desktop"]].map(([width,height,id]) => ({ id, width, height, primary: true }));

const journeys = [
  ["first-time-user", "First Visit to First Value", "new-beginner-guest", 12, 15],
  ["learning", "Start and continue a lesson", "returning-beginner", 6, 9],
  ["prompt-authoring", "Find, import, create, and run a prompt", "advanced-qa", 10, 14],
  ["agent-authoring", "Build and use an agent", "advanced-qa", 10, 14],
  ["workflow-authoring", "Create, validate, run, approve, and restore a workflow", "advanced-qa", 11, 15],
  ["project-workspace", "Create a project and attach work", "advanced-qa", 7, 10],
  ["knowledge-base", "Create and recover a knowledge document", "advanced-qa", 7, 10],
  ["runtime", "Run Mock and understand simulated output", "advanced-qa", 7, 10],
  ["authentication", "Register, verify, sign in, recover, and sign out", "guest-local-data", 12, 18],
  ["local-cloud-migration", "Preview, cancel, complete, and restore migration", "guest-local-data", 16, 20],
  ["account-management", "Update profile and security preferences", "cloud-user", 7, 10],
  ["help-discovery", "Understand the current page and find Help", "new-beginner-guest", 4, 6],
  ["release-review", "Review quality evidence and release status", "advanced-qa", 7, 10],
].map(([id, name, persona, expectedSteps, maximumSteps]) => ({ id, name, persona, expectedSteps, maximumSteps, completionIndicator: "Visible confirmation and persisted state", recoveryBehavior: "Retry or cancel without data loss", helpAvailable: true, cancellable: true, persistsAcrossRefresh: true }));

const qualityExpectations = {
  schemaVersion: 1,
  severityModel: {
    Critical: ["data loss", "security bypass", "login impossible", "blank application", "primary journey impossible", "destructive action without confirmation"],
    High: ["major feature unusable", "inaccessible primary flow", "severe overlap", "navigation trap", "mobile task impossible"],
    Medium: ["confusing workflow", "inconsistent wording", "minor recovery issue", "secondary responsive defect"],
    Low: ["cosmetic inconsistency", "non-blocking copy issue"],
  },
  releaseRules: { Critical: "blocked", High: "blocked", Medium: "readyWithWarnings", Low: "documentedBacklog", manualUxReview: { notRun: "readyWithWarnings", passedWithWarnings: "readyWithWarnings", failed: "blocked", passed: "mayBeReady" } },
  manualUxReview: { status: "notRun", approvedBy: null, reviewedAt: null, note: "Automation cannot approve subjective UX. A human reviewer must record the outcome." },
  languages: ["he", "en"],
  experienceModes: ["beginner", "advanced"],
};

const files = { "routes.json": routes, "pages.json": pages, "controls.json": controls, "userJourneys.json": journeys, "personas.json": personas, "viewports.json": viewports, "authStates.json": authStates, "dataStates.json": dataStates, "qualityExpectations.json": qualityExpectations };
for (const [name, value] of Object.entries(files)) writeFileSync(`${inventoryDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);

const charters = ["first-time-user", "navigation-and-orientation", "authentication", "local-cloud-migration", "prompt-authoring", "agent-authoring", "workflows", "projects-and-knowledge", "runtime", "mobile", "rtl-ltr", "accessibility", "error-recovery", "security-and-privacy", "ai-radar", "release-readiness"];
charters.forEach((slug, index) => {
  const number = String(index + 1).padStart(2, "0");
  const topic = slug.replaceAll("-", " ");
  const content = `# ${number} - ${topic.replace(/\b\w/g, (c) => c.toUpperCase())}\n\n## Mission\n\nExplore ${topic} as a real user and identify anything broken, confusing, inaccessible, misleading, or unsafe.\n\n## Persona\n\nSelect the closest persona from \`quality/inventory/personas.json\` and record any deviations.\n\n## Setup\n\nUse a production preview, controlled disposable data, Hebrew and English, and at least one relevant mobile viewport. Record version, commit, browser, router mode, auth state, and data state.\n\n## Risks\n\n- Primary work may be blocked or unclear.\n- State may be lost, duplicated, or misleading.\n- RTL, responsive, keyboard, overlay, console, or network behavior may regress.\n\n## Test ideas\n\n- Follow the primary task without hidden product knowledge.\n- Exercise happy, cancel, invalid, refresh, Back, offline, empty, and recovery paths.\n- Inspect focus, announcements, overflow, wording, feedback, persistence, and destructive safeguards.\n\n## Expected observations\n\nThe current location, primary action, system status, result, and recovery path are understandable in both languages. No Critical or High finding remains.\n\n## Data to capture\n\nScreenshots, trace or video, action timeline, console errors, failed requests, route, viewport, language, auth/data state, and severity. Never capture secrets or private content.\n\n## Exit criteria\n\nThe mission and high-risk ideas were exercised, findings were triaged, evidence was attached, and unresolved warnings have an owner and release decision.\n\n## Findings\n\n| ID | Severity | Finding | Evidence | Impact | Recommendation | Owner | Release decision |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n| | | | | | | | |\n`;
  writeFileSync(`${exploratoryDir}/${number}-${slug}.md`, content);
});

console.log(`Generated ${routes.length} routes, ${pages.length} pages, ${controls.length} controls, ${journeys.length} journeys, and ${charters.length} exploratory charters.`);
