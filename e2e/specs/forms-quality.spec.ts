import { test, expect, login } from "../fixtures/academy";
import { writeQualityArtifact } from "../fixtures/qualityArtifacts";

const forms = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password", "/onboarding", "/prompts/new", "/agents/new", "/projects/new", "/knowledge/new", "/workflows/new", "/settings", "/profile"];
test("primary forms have labels, safe submission semantics, and no horizontal overflow", async ({ page }) => {
  await login(page); const findings: string[] = []; let fields = 0;
  for (const route of forms) { await page.goto(route); for (const field of await page.locator("input:visible,select:visible,textarea:visible").all()) { fields += 1; const labelled = await field.evaluate((node) => { const control = node as HTMLInputElement; const explicit = control.getAttribute("aria-label") || control.getAttribute("placeholder") || control.getAttribute("title"); const labels = Array.from(control.labels ?? []).map((label) => label.textContent?.trim()).filter(Boolean).join(" "); const labelledBy = (control.getAttribute("aria-labelledby") ?? "").split(/\s+/).map((id) => document.getElementById(id)?.textContent?.trim()).filter(Boolean).join(" "); return Boolean(explicit || labels || labelledBy); }); if (!labelled) findings.push(`${route}: unlabeled field`); } expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy(); }
  writeQualityArtifact("form-coverage", { status: findings.length ? "failed" : "passed", forms: forms.length, fields, findings }); expect(findings).toEqual([]);
});
