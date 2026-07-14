import { readFileSync } from "node:fs";
import { test, expect, login } from "../fixtures/academy";
import { writeQualityArtifact } from "../fixtures/qualityArtifacts";

type RouteRecord = { route: string; parameterExample: string; access: string };
const routes = JSON.parse(readFileSync("quality/inventory/routes.json", "utf8")) as RouteRecord[];
const auditRoutes = routes.filter(({ route }) => ["/", "/about", "/auth/login", "/dashboard", "/lessons", "/prompts", "/agents", "/projects", "/knowledge", "/workflows", "/help", "/settings", "/profile", "/qa", "/radar"].includes(route));

test("registered pages expose named, valid, viewport-safe controls", async ({ page }) => {
  test.setTimeout(120_000);
  await login(page);
  const findings: Array<Record<string, string>> = [];
  let auditedControls = 0;
  for (const record of auditRoutes) {
    await page.goto(record.parameterExample);
    await page.waitForLoadState("domcontentloaded");
    const controls = page.locator("a:visible,button:visible,input:visible,select:visible,textarea:visible,[role=button]:visible,[role=menuitem]:visible");
    const count = await controls.count();
    auditedControls += count;
    for (let index = 0; index < count; index += 1) {
      const control = controls.nth(index);
      const name = await control.evaluate((node) => { const element = node as HTMLElement; const field = node as HTMLInputElement; const explicit = element.getAttribute("aria-label") || element.getAttribute("title") || element.getAttribute("placeholder") || (field.type === "button" || field.type === "submit" ? field.value : ""); const labels = Array.from(field.labels ?? []).map((label) => label.textContent?.trim()).filter(Boolean).join(" "); const labelledBy = (element.getAttribute("aria-labelledby") ?? "").split(/\s+/).map((id) => document.getElementById(id)?.textContent?.trim()).filter(Boolean).join(" "); return (explicit || labels || labelledBy || element.innerText || "").trim(); });
      if (!name) findings.push({ route: record.route, selector: `${await control.evaluate((node) => node.tagName.toLowerCase())}:nth(${index})`, visibleLabel: "", language: await page.locator("html").getAttribute("lang") ?? "unknown", viewport: "desktop", expectedBehavior: "Control has an accessible name", actualBehavior: "No accessible name was discoverable", screenshotPath: "", severity: "High" });
      const href = await control.getAttribute("href");
      if (href === "" || href === "#") findings.push({ route: record.route, selector: `a:nth(${index})`, visibleLabel: name, language: await page.locator("html").getAttribute("lang") ?? "unknown", viewport: "desktop", expectedBehavior: "Link has a valid destination", actualBehavior: `Invalid href: ${href}`, screenshotPath: "", severity: "High" });
      const box = await control.boundingBox();
      if (box && (box.x < -1 || box.x + box.width > (page.viewportSize()?.width ?? 1280) + 1)) findings.push({ route: record.route, selector: `control:nth(${index})`, visibleLabel: name, language: await page.locator("html").getAttribute("lang") ?? "unknown", viewport: "desktop", expectedBehavior: "Control remains inside viewport", actualBehavior: "Control is horizontally clipped", screenshotPath: "", severity: "High" });
    }
  }
  writeQualityArtifact("dead-controls", { status: findings.length ? "failed" : "passed", auditedRoutes: auditRoutes.length, auditedControls, findings });
  expect(findings.filter((finding) => ["Critical", "High"].includes(finding.severity)), JSON.stringify(findings, null, 2)).toEqual([]);
});
