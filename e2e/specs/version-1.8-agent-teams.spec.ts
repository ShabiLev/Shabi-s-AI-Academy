import { expect, test } from "../fixtures/academy";

test("mission journey interprets, approves, pauses, persists, and continues safely", async ({ page }) => {
  await page.goto("/missions");
  await expect(page.getByRole("heading", { name: /^(משימות|Missions)$/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /עדיין אין משימות|No missions yet/ })).toBeVisible();
  await page.getByRole("link", { name: /בניית המשימה הראשונה|Build the first mission/ }).click();
  await page.getByLabel(/תיאור המשימה|Mission description/).fill("Deliver an accessible team workspace with regression evidence");
  await expect(page.getByRole("heading", { name: /מה המערכת הבינה|What the system understood/ })).toBeVisible();
  await expect(page.getByText(/אין פעולה מחוברת או הרסנית|No connected or destructive action/)).toBeVisible();
  await page.getByRole("button", { name: /יצירת משימה לבדיקה|Create mission for review/ }).click();
  await expect(page).toHaveURL(/\/missions\/mission-/);
  await expect(page.locator(".mission-heading .mission-status")).toContainText(/ממתינה לאישור|Awaiting plan approval/);
  await page.getByRole("button", { name: /אישור התכנית|Approve plan/ }).click();
  await expect(page.locator(".mission-heading .mission-status")).toContainText(/מוכנה להתחלה|Ready/);
  await page.getByRole("button", { name: /התחלה|Start/ }).click();
  await expect(page.locator(".mission-heading .mission-status")).toContainText(/פעילה|Running/);
  await page.locator(".context-pack-form input").fill("Release context");
  await page.locator(".context-pack-form textarea").fill("Validate the bounded local mission state.");
  await page.locator(".context-pack-form button").click();
  await expect(page.getByRole("status")).toContainText(/linked|קושרה/);
  await page.getByRole("button", { name: /השהיה|Pause/ }).click();
  await expect(page.locator(".mission-heading .mission-status")).toContainText(/מושהית|Paused/);
  const stored = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((candidate) => candidate.startsWith("shabis-ai-academy:missions:v1:"));
    return key ? JSON.parse(localStorage.getItem(key) ?? "null") : null;
  });
  expect(stored.missions[0].pauseCheckpoint.phaseId).toBe("plan");
  expect(stored.missions[0].contextPackIds).toHaveLength(1);
  await page.reload();
  await expect(page.getByRole("button", { name: /המשך בטוח|Safe continue/ })).toBeVisible();
  await page.getByRole("button", { name: /המשך בטוח|Safe continue/ }).click();
  await expect(page.locator(".mission-heading .mission-status")).toContainText(/פעילה|Running/);
  await page.setViewportSize({ width: 320, height: 568 });
  await expect(page.getByRole("button", { name: /הצגת הצוות|Show team/ })).toBeVisible();
  await page.getByRole("button", { name: /הצגת הצוות|Show team/ }).click();
  await expect(page.locator(".mission-team-details")).toBeVisible();
});

test("unavailable connected execution is explained and blocked without collecting keys", async ({ page }) => {
  await page.goto("/missions/new");
  await page.getByLabel(/תיאור המשימה|Mission description/).fill("Send an external production update");
  await page.getByLabel(/רמת הרצה|Execution level/).selectOption("connected-execute");
  await expect(page.getByRole("alert")).toContainText(/חסום|blocked/);
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await page.getByRole("button", { name: /יצירת משימה לבדיקה|Create mission for review/ }).click();
  await page.getByRole("button", { name: /אישור התכנית|Approve plan/ }).click();
  await page.getByRole("button", { name: /התחלה|Start/ }).click();
  await expect(page.getByRole("alert")).toContainText(/ביצוע מחובר אינו זמין|Connected execution is unavailable/);
  await expect(page.locator(".mission-heading .mission-status")).toContainText(/חסומה|Blocked/);
});

test("Team catalog preserves attribution and creates an editable local preset copy", async ({ page }) => {
  await page.goto("/team");
  await expect(page.getByRole("heading", { level: 1, name: /צוותי סוכנים|Agent Teams/ })).toBeVisible();
  await page.getByText(/ייחוס והתאמה|Attribution and adaptation/).first().click();
  await expect(page.getByText(/8ef49232e024/).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "agency-agents" })).toHaveAttribute("href", /8ef49232e02431f7ca4792b487e5a85a7939ff3a/);
  await page.getByRole("button", { name: /העתקה לצוותים שלי|Copy to My Teams/ }).first().click();
  await expect(page.getByRole("heading", { name: /הצוותים שלי|My Teams/ })).toBeVisible();
  const teams = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((candidate) => candidate.startsWith("shabis-ai-academy:agent-teams:v1:"));
    return key ? JSON.parse(localStorage.getItem(key) ?? "null") : null;
  });
  expect(teams.teams[0]).toMatchObject({ schemaVersion: 1, source: "user", sourcePresetId: "feature-delivery" });
});

test("English 320px mobile mission builder stays LTR and has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/settings");
  await page.getByRole("radio", { name: "English" }).click();
  await page.goto("/missions/new");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("heading", { name: "Build a mission and team" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByLabel("Mission description").fill("Review mobile navigation and accessible focus states");
  await page.getByRole("button", { name: "Create mission for review" }).focus();
  await expect(page.getByRole("button", { name: "Create mission for review" })).toBeFocused();
});

test("quality failure records FAIL evidence and retry returns to the same phase", async ({ page }) => {
  await page.goto("/missions/new");
  await page.getByLabel(/Mission description|תיאור המשימה/).fill("Run a quality loop with explicit correction evidence");
  await page.getByRole("button", { name: /Create mission for review|יצירת משימה לבדיקה/ }).click();
  await page.getByRole("button", { name: /Approve plan|אישור התכנית/ }).click();
  await page.getByRole("button", { name: /Start|התחלה/ }).click();
  await page.getByRole("button", { name: /Mark needs work|סימון צורך בתיקון/ }).click();
  await expect(page.locator(".mission-heading .mission-status")).toContainText(/נדרש תיקון|Needs work/);
  await expect(page.locator(".evidence-list")).toContainText("FAIL");
  await page.getByRole("button", { name: /Retry|ניסיון חוזר/ }).click();
  await expect(page.locator(".mission-heading .mission-status")).toContainText(/פעילה|Running/);
});

test("English Expert Dry Run persists the mode and exposes mission-scoped views", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("radio", { name: "English" }).click();
  await page.goto("/missions/new");
  await page.getByLabel("Mission description").fill("Review an architecture proposal without changing connected systems");
  await page.getByLabel("Guidance mode").selectOption("expert");
  await page.getByLabel("Execution level").selectOption("dry-run");
  await page.getByRole("button", { name: "Create mission for review" }).click();
  await expect(page.locator(".mission-heading .eyebrow")).toHaveText("Dry Run · Expert");
  const missionUrl = page.url();
  const missionId = missionUrl.slice(missionUrl.lastIndexOf("/") + 1);
  await page.getByRole("link", { name: "Plan" }).click();
  await expect(page).toHaveURL(`/missions/${missionId}/plan`);
  await page.goto(`/missions/${missionId}/evidence`);
  await expect(page.getByRole("heading", { name: "Mission Evidence" })).toBeVisible();
});

test("Audit Only is forced to Explain and cannot select mutating execution levels", async ({ page }) => {
  await page.goto("/missions/new");
  await page.getByLabel(/Guidance mode|מצב הדרכה/).selectOption("audit-only");
  await expect(page.getByLabel(/Execution level|רמת הרצה/)).toHaveValue("explain");
  await expect(page.getByLabel(/Execution level|רמת הרצה/).locator('option[value="local-execute"]')).toHaveAttribute("disabled", "");
  await expect(page.getByLabel(/Execution level|רמת הרצה/).locator('option[value="connected-execute"]')).toHaveAttribute("disabled", "");
});

test("completed Mission produces a learning summary and evidence-backed Skill Map progress", async ({ page }) => {
  await page.goto("/missions/new");
  await page.getByLabel(/Mission description|תיאור המשימה/).fill("Complete an orchestration exercise with quality evidence");
  await page.getByRole("button", { name: /Create mission for review|יצירת משימה לבדיקה/ }).click();
  await page.getByRole("button", { name: /Approve plan|אישור התכנית/ }).click();
  await page.getByRole("button", { name: /Start|התחלה/ }).click();
  for (let phase = 0; phase < 4; phase += 1) {
    await page.getByLabel(/I acknowledge this is a local simulation, not live execution|אני מאשר\/ת שזו סימולציה מקומית ולא ביצוע חי/).check();
    await page.getByRole("button", { name: /Complete simulated phase|השלמת השלב המדומה/ }).click();
  }
  await expect(page.locator(".mission-heading .mission-status")).toContainText(/הושלמה|Completed/);
  await expect(page.getByRole("heading", { name: /מה למדת|What you learned/ })).toBeVisible();
  await page.locator(".mission-tabs").getByRole("link", { name: /Team|צוות/ }).click();
  const orchestrationCard = page.locator(".skill-grid article").filter({ hasText: /Orchestration|תזמור/ });
  await expect(orchestrationCard).toContainText(/Introduced|הוצגה/);
});
