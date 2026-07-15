import { test, login, english } from "../fixtures/academy";
import { runAxeScan } from "../fixtures/a11y";

test.describe("accessibility — Hebrew RTL", () => {
  test("Login", async ({ page }) => {
    await page.goto("/login");
    await runAxeScan(page, test.info());
  });

  test("Dashboard", async ({ page }) => {
    await login(page);
    await runAxeScan(page, test.info());
  });

  test("Lessons catalog", async ({ page }) => {
    await login(page, "/lessons");
    await runAxeScan(page, test.info());
  });

  test("Lesson details", async ({ page }) => {
    await login(page, "/lessons/ai-llm-agent");
    await runAxeScan(page, test.info());
  });

  test("Settings", async ({ page }) => {
    await login(page, "/settings");
    await runAxeScan(page, test.info());
  });

  test("Prompt Library", async ({ page }) => {
    await login(page, "/prompts");
    await runAxeScan(page, test.info());
  });

  test("Prompt Builder", async ({ page }) => {
    await login(page, "/prompts/new");
    await runAxeScan(page, test.info());
  });

  test("Starter Catalog", async ({ page }) => {
    await login(page, "/prompts/catalog");
    await runAxeScan(page, test.info());
  });

  test("Catalog Prompt Details", async ({ page }) => {
    await login(page, "/prompts/catalog/prompts-chat-sql-query-reviewer");
    await runAxeScan(page, test.info());
  });

  test("Agent Library", async ({ page }) => {
    await login(page, "/agents");
    await runAxeScan(page, test.info());
  });

  test("Agent Builder", async ({ page }) => {
    await login(page, "/agents/new");
    await runAxeScan(page, test.info());
  });

  test("How To guide", async ({ page }) => {
    await login(page, "/how-to");
    await runAxeScan(page, test.info());
  });

  test("Prompt Details", async ({ page }) => {
    await login(page, "/prompts/new");
    await page.getByLabel("שם הפרומפט").fill("A11y check prompt");
    await page.getByLabel("משימה").fill("בדיקת נגישות עבור עמוד פרטי הפרומפט.");
    await page.getByRole("button", { name: "שמירה" }).click();
    await runAxeScan(page, test.info());
  });

  test("QA Center", async ({ page }) => {
    await login(page, "/qa");
    await runAxeScan(page, test.info(), { label: "qa-center-empty" });
    const sample = page.getByRole("button", { name: "טעינת נתוני דוגמה" });
    if (await sample.isVisible()) {
      await sample.click();
      await runAxeScan(page, test.info(), { label: "qa-center-sample" });
}

  });

  test("Starter Catalog and duplicate dialog", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/prompts/catalog");
    await runAxeScan(page, test.info(), { label: "catalog-en" });
    await page
      .getByRole("button", { name: "Import to Library" })
      .first()
      .click();
    await page.goto("/prompts/catalog");
    await page
      .getByRole("button", { name: "Import another copy" })
      .first()
      .click();
    await runAxeScan(page, test.info(), { label: "catalog-duplicate-dialog" });
  });

  test("mobile navigation drawer open", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await login(page);
    await page.getByRole("button", { name: "פתיחת תפריט הניווט" }).click();
    await runAxeScan(page, test.info());
  });

  test("profile menu open", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "פתיחת תפריט הפרופיל" }).click();
    await runAxeScan(page, test.info());
  });

  test("delete confirmation dialog", async ({ page }) => {
    await login(page, "/prompts/new");
    await page.getByLabel("שם הפרומפט").fill("A11y delete check");
    await page
      .getByLabel("משימה")
      .fill("בדיקת נגישות עבור תיבת דו-שיח אישור מחיקה.");
    await page.getByRole("button", { name: "שמירה" }).click();
    await page.getByRole("button", { name: "מחיקה" }).click();
    await runAxeScan(page, test.info());
  });

  test("quiz interaction state after submit", async ({ page }) => {
    await login(page, "/lessons/ai-llm-agent");
    await page.getByRole("radio", { name: "הקשר" }).check();
    await page.getByRole("radio", { name: "נכון", exact: true }).check();
    await page
      .getByRole("radio", { name: "אימות אנושי ותוצר שניתן לסקור" })
      .check();
    await page.getByRole("button", { name: "בדיקת תשובות" }).click();
    await runAxeScan(page, test.info());
  });
});

test.describe("accessibility - AI Radar and hardened profile", () => {
  test("Hebrew Radar and desktop profile menu", async ({ page }) => {
    await login(page, "/radar");
    await runAxeScan(page, test.info(), { label: "radar-he" });
    await page.locator(".desktop-sidebar .profile-trigger").click();
    await runAxeScan(page, test.info(), { label: "profile-he" });
  });

  test("English Radar and desktop profile menu", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/radar");
    await runAxeScan(page, test.info(), { label: "radar-en" });
    await page.locator(".desktop-sidebar .profile-trigger").click();
    await runAxeScan(page, test.info(), { label: "profile-en" });
  });

  test("mobile profile sheet", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await login(page);
    await page.locator(".menu-button").click();
    await page.locator(".mobile-drawer .profile-trigger").click();
    await runAxeScan(page, test.info(), { label: "profile-mobile-he" });
  });
});

test.describe("accessibility — complete beta", () => {
  test("public About Hebrew and English", async ({ page }) => { await page.goto("/about"); await runAxeScan(page, test.info(), { label: "about-he" }); await login(page); await english(page); await page.goto("/about"); await runAxeScan(page, test.info(), { label: "about-en" }); });
  for (const [name, route] of [["Prompt Packs", "/prompts/packs"], ["Starter Agents", "/agents/catalog"], ["Prompt Playground", "/playground/prompts"], ["Agent Playground", "/playground/agents"], ["Projects", "/projects"], ["Knowledge Base", "/knowledge"], ["Learning Journey", "/journey"], ["Release Center", "/release"]] as const) {
    test(name, async ({ page }) => { await login(page, route); await runAxeScan(page, test.info(), { label: name.toLowerCase().replaceAll(" ", "-") }); });
  }
});

test.describe("accessibility — English LTR", () => {
  test("Login", async ({ page }) => {
    await page.goto("/login");
    await runAxeScan(page, test.info());
  });

  test("Dashboard", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/dashboard");
    await runAxeScan(page, test.info());
  });

  test("Prompt Builder", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/prompts/new");
    await runAxeScan(page, test.info());
  });

  test("QA Center", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/qa");
    await runAxeScan(page, test.info());
  });
});

test.describe("accessibility — guided auth and account UX", () => {
  for (const [name, route] of [["Landing", "/"], ["Account login", "/auth/login"], ["Registration", "/auth/register"], ["Password reset request", "/auth/forgot-password"]] as const) {
    test(name, async ({ page }) => {
      await page.goto(route);
      await runAxeScan(page, test.info(), { label: `guided-${name.toLowerCase().replaceAll(" ", "-")}` });
    });
  }

  for (const [name, route] of [["Onboarding", "/onboarding"], ["Help Center", "/help"], ["Glossary", "/glossary"], ["Profile", "/profile"]] as const) {
    test(name, async ({ page }) => {
      await login(page, route);
      await runAxeScan(page, test.info(), { label: `guided-${name.toLowerCase().replaceAll(" ", "-")}` });
    });
  }

  test("guided tour dialog", async ({ page }) => {
    await login(page, "/dashboard");
    await page.getByRole("button", { name: /סיור מודרך|Guided tour/ }).click();
    await runAxeScan(page, test.info(), { label: "guided-tour-dialog" });
  });
});

test.describe("accessibility — Runtime Engine", () => {
  test("Run History Hebrew and mobile filters", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, "/runs");
    await runAxeScan(page, test.info(), { label: "runtime-history-he-mobile" });
  });
  test("Run History English", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/runs");
    await runAxeScan(page, test.info(), { label: "runtime-history-en" });
  });
  test("Run Details and retry state", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/runs");
    await page.getByRole("button", { name: "Mock retry", exact: true }).click();
    await page.getByRole("link", { name: /retryThenSuccess/ }).click();
    await runAxeScan(page, test.info(), { label: "runtime-details-retry" });
  });
  test("Dry Run preview", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/runs");
    await page.getByRole("button", { name: "Dry Run", exact: true }).click();
    await page
      .getByRole("link", { name: /Inspect this local Runtime/ })
      .click();
    await runAxeScan(page, test.info(), { label: "runtime-dry-run" });
  });
  test("Approval dialog", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/runs");
    await page.getByRole("button", { name: "Mock approval" }).click();
    await runAxeScan(page, test.info(), { label: "runtime-approval-dialog" });
  });
});

test.describe("accessibility — AI Workspace", () => {
  for (const [name, route] of [["Search", "/search?q=quality"], ["Assistant Chat", "/assistant"], ["Workflows", "/workflows"], ["Analytics", "/analytics"]] as const) {
    test(name, async ({ page }) => {
      await login(page);
      await english(page);
      await page.goto(route);
      await runAxeScan(page, test.info(), { label: `workspace-${name.toLowerCase().replaceAll(" ", "-")}` });
    });
  }
  test("Command Palette and Shortcut Help", async ({ page }) => {
    await login(page);
    await english(page);
    await page.keyboard.press("Control+k");
    await runAxeScan(page, test.info(), { label: "command-palette" });
    await page.keyboard.press("Escape");
    await page.keyboard.press("?");
    await runAxeScan(page, test.info(), { label: "shortcut-help" });
  });
  test("Assistant Sidebar, Workflow Builder, Notification Center, and import preview", async ({ page }) => {
    await login(page);
    await english(page);
    await page.getByRole("button", { name: "Expand Assistant" }).click();
    await runAxeScan(page, test.info(), { label: "assistant-sidebar" });
    await page.goto("/workflows");
    await page.getByRole("button", { name: "Prompt Review Pipeline" }).click();
    await runAxeScan(page, test.info(), { label: "workflow-builder" });
    await page.getByRole("button", { name: "Mock Run" }).click();
    await page.getByRole("button", { name: /Notifications, 1 unread/ }).click();
    await runAxeScan(page, test.info(), { label: "notification-center" });
    await page.goto("/settings");
    await page.getByLabel("Choose import file").setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from("{}") });
    await runAxeScan(page, test.info(), { label: "import-preview" });
  });
});

test.describe("accessibility — Agent Operating System", () => {
  for (const [name, route] of [["AOS dashboard", "/aos"], ["Modules", "/aos/modules"], ["Research pipeline", "/aos/research"], ["Evidence viewer", "/aos/evidence"], ["Handoffs", "/aos/handoffs"], ["Security policy", "/aos/security"], ["Releases", "/aos/releases"], ["Progress", "/aos/progress"], ["Memory", "/aos/memory"]] as const) {
    test(`${name} Hebrew`, async ({ page }) => {
      await login(page, route);
      await runAxeScan(page, test.info(), { label: `aos-${name.toLowerCase().replaceAll(" ", "-")}-he` });
    });
    test(`${name} English`, async ({ page }) => {
      await login(page);
      await english(page);
      await page.goto(route);
      await runAxeScan(page, test.info(), { label: `aos-${name.toLowerCase().replaceAll(" ", "-")}-en` });
    });
  }

  test("Module list keyboard filtering", async ({ page }) => {
    await login(page, "/aos/modules");
    await runAxeScan(page, test.info(), { label: "aos-modules-filters" });
  });
});
