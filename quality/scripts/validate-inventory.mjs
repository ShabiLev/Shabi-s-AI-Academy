import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const registered = ["/", ...Array.from(app.matchAll(/<Route\s+(?:(?!>).)*path="([^"]+)"/gs), (match) => `/${match[1]}`)];
const routes = JSON.parse(readFileSync("quality/inventory/routes.json", "utf8"));
const pages = JSON.parse(readFileSync("quality/inventory/pages.json", "utf8"));
const routeSet = new Set(routes.map((item) => item.route));
const pageSet = new Set(pages.map((item) => item.route));
const requiredPageFields = ["route", "pageId", "accessRequirement", "supportedLanguages", "experienceModes", "primaryTask", "primaryAction", "secondaryActions", "expectedControls", "expectedEmptyState", "expectedLoadingState", "expectedErrorState", "expectedMobileBehavior", "expectedDesktopBehavior", "expectedBreadcrumb", "expectedHelpContent", "expectedAnalyticsEvent", "visualBaselineRequirement", "accessibilityRequirement"];

const missingRoutes = registered.filter((route) => !routeSet.has(route));
const missingPages = registered.filter((route) => !pageSet.has(route));
const orphanInventory = routes.filter((item) => !registered.includes(item.route)).map((item) => item.route);
const incompletePages = pages.filter((page) => requiredPageFields.some((field) => page[field] === undefined || page[field] === ""));
const duplicates = registered.filter((route, index) => registered.indexOf(route) !== index);

if (missingRoutes.length || missingPages.length || orphanInventory.length || incompletePages.length || duplicates.length) {
  console.error(JSON.stringify({ missingRoutes, missingPages, orphanInventory, incompletePages: incompletePages.map((page) => page.route), duplicates }, null, 2));
  process.exit(1);
}
console.log(`Inventory valid: ${registered.length} registered routes and ${pages.length} complete page records.`);
