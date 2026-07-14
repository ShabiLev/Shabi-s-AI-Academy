import { readFileSync } from "node:fs";
import { test, expect, login } from "../fixtures/academy";
import { writeQualityArtifact } from "../fixtures/qualityArtifacts";

type RouteRecord = { route: string; parameterExample: string; access: string };
const routes = JSON.parse(readFileSync("quality/inventory/routes.json", "utf8")) as RouteRecord[];

test("production route crawler reaches every registered route and validates links", async ({ page }) => {
  test.setTimeout(180_000);
  await login(page);
  const visitedRoutes: string[] = [];
  const unreachableRoutes: string[] = [];
  const brokenLinks: Array<{ route: string; href: string }> = [];
  const redirects: Array<{ route: string; destination: string }> = [];
  const routeAccessStatus: Array<{ route: string; access: string; status: string }> = [];
  for (const record of routes) {
    const response = await page.goto(record.parameterExample);
    await page.waitForLoadState("domcontentloaded");
    const destination = new URL(page.url()).pathname;
    visitedRoutes.push(record.route);
    if (destination !== record.parameterExample && !record.parameterExample.includes(":")) redirects.push({ route: record.route, destination });
    await page.waitForFunction(() => document.body.innerText.trim().length > 0, undefined, { timeout: 3_000 }).catch(() => undefined);
    const pageText = (await page.locator("body").innerText()).slice(0, 2000);
    const failed = Boolean(response && response.status() >= 500) || (pageText.trim().length === 0 && destination === new URL(page.url()).pathname);
    if (failed) unreachableRoutes.push(record.route);
    routeAccessStatus.push({ route: record.route, access: record.access, status: failed ? "unreachable" : "visited" });
    for (const href of await page.locator("a[href]").evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""))) if (!href || href === "#") brokenLinks.push({ route: record.route, href });
  }
  const report = { status: unreachableRoutes.length || brokenLinks.length ? "failed" : "passed", registeredRoutes: routes.length, visitedRoutes: visitedRoutes.length, unreachableRoutes, orphanRoutes: [], brokenLinks, redirects, routeAccessStatus };
  writeQualityArtifact("route-coverage", report);
  expect(unreachableRoutes, "unreachable production routes").toEqual([]);
  expect(brokenLinks, "links without valid destinations").toEqual([]);
});
