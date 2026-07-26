import { expect, test } from "../fixtures/academy";

test("anonymous visitor opens Radar directly without a login gate", async ({ page }) => {
  await page.goto("/radar");
  await expect(page).toHaveURL(/\/radar$/);
  await expect(page.getByRole("heading", { name: /רדאר AI חי|Live AI Radar/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Demo Login|כניסה למצב הדגמה/ })).toHaveCount(0);
  await expect(page.getByText(/נשמרות במכשיר הזה|stay on this device/)).toBeVisible();
  await expect(page.locator(".radar-card").first()).toBeVisible();
});

test("optional onboarding creates a versioned guest profile with consent disabled", async ({ page }) => {
  await page.goto("/onboarding");
  await page.getByRole("button", { name: /דילוג לעת עתה|Skip for now/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const profile = await page.evaluate(() => JSON.parse(localStorage.getItem("shabis-ai-academy:guest-profile:v1") ?? "null"));
  expect(profile).toMatchObject({ schemaVersion: 1, consent: { analytics: false } });
  expect(profile.anonymousProfileId).toMatch(/^[a-z0-9-]+$/i);
});

test("Radar persists saved, read, following, feedback, and saved-search state", async ({ page }) => {
  await page.goto("/radar");
  const first = page.locator(".radar-card").first();
  await first.getByRole("button", { name: /שמירה|Save/ }).click();
  await first.getByRole("button", { name: /סימון כנקרא|Mark read/ }).click();
  await first.getByRole("button", { name: /מעקב נושא|Follow topic/ }).click();
  await first.getByRole("button", { name: /מעקב מקור|Follow source/ }).click();
  await first.getByRole("button", { name: /^(מועיל|Useful)$/ }).click();
  await page.getByLabel(/שם לחיפוש השמור|Saved-search name/).fill("My AI updates");
  await page.getByRole("button", { name: /שמירת החיפוש|Save search/ }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "My AI updates", exact: true })).toBeVisible();
  const profile = await page.evaluate(() => JSON.parse(localStorage.getItem("shabis-ai-academy:guest-profile:v1") ?? "null"));
  expect(profile.favoriteIds).toHaveLength(1);
  expect(profile.readItems).toHaveLength(1);
  expect(profile.selectedTopics.length).toBeGreaterThan(0);
  expect(profile.selectedSources.length).toBeGreaterThan(0);
  expect(profile.recommendationFeedback).toHaveLength(1);
  expect(profile.savedSearches).toHaveLength(1);
  await page.locator(".radar-card").first().getByRole("button", { name: /סימון כלא נקרא|Mark unread/ }).click();
  await page.locator(".radar-card").first().getByRole("button", { name: /סימון כנקרא|Mark read/ }).click();
  await page.getByRole("button", { name: /שינוי שם|Rename/ }).click();
  await page.getByLabel(/שם חדש|New name/).fill("Renamed updates");
  await page.getByRole("button", { name: /אישור שם|Save name/ }).click();
  await expect(page.getByRole("button", { name: "Renamed updates", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Renamed updates", exact: true }).click();
  const searchDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /ייצוא חיפושים|Export searches/ }).click();
  expect((await searchDownload).suggestedFilename()).toBe("shabis-ai-academy-radar-searches.json");
  await page.getByRole("button", { name: /מחיקת Renamed updates|Delete Renamed updates/ }).click();
  await expect(page.getByRole("button", { name: "Renamed updates", exact: true })).toHaveCount(0);
  await page.locator(".radar-card").first().getByRole("button", { name: /הסתרה|Dismiss/ }).click();
  const afterDismiss = await page.evaluate(() => JSON.parse(localStorage.getItem("shabis-ai-academy:guest-profile:v1") ?? "null"));
  expect(afterDismiss.dismissedIds).toHaveLength(1);
});

test("briefing and what-changed derive only from available records", async ({ page }) => {
  await page.goto("/radar");
  await expect(page.getByRole("heading", { name: /מה השתנה מאז הביקור האחרון|What changed since your last visit/ })).toBeVisible();
  await page.getByRole("button", { name: /פתיחת התדריך|Open briefing/ }).click();
  await expect(page.getByRole("heading", { name: /ההתפתחויות המרכזיות|Top AI developments/ })).toBeVisible();
  await expect(page.locator(".briefing-sections li").first()).toBeVisible();
});

test("offline refresh keeps fallback and labels the state honestly", async ({ page }) => {
  await page.addInitScript(() => {
    const nativeFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      return url.includes("/generated/ai-radar-feed.json")
        ? Promise.reject(new TypeError("Failed to fetch"))
        : nativeFetch(input, init);
    };
  });
  await page.goto("/radar");
  await expect(page.locator(".radar-card").first()).toBeVisible();
  await expect(page.locator(".radar-freshness")).toHaveAttribute("data-status", "offline");
  await expect(page.getByRole("status")).toContainText(/אין חיבור לעדכון|Refresh is offline/);
});

test("corrupted profile recovers and analytics requires explicit consent", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("shabis-ai-academy:guest-profile:v1", "{broken"));
  await page.goto("/settings");
  const consent = page.getByRole("checkbox", { name: /אני מסכים|I consent/ });
  await expect(consent).not.toBeChecked();
  await consent.check();
  await expect(consent).toBeChecked();
  await consent.uncheck();
  const state = await page.evaluate(() => ({
    profile: JSON.parse(localStorage.getItem("shabis-ai-academy:guest-profile:v1") ?? "null"),
    corrupt: localStorage.getItem("shabis-ai-academy:guest-profile:corrupt:v1"),
    workspace: JSON.parse(localStorage.getItem("shabis-ai-academy:workspace:v1") ?? "null"),
  }));
  expect(state.profile.schemaVersion).toBe(1);
  expect(state.corrupt).toBe("{broken");
  expect(state.profile.consent.analytics).toBe(false);
  expect(state.workspace.analyticsEnabled).toBe(false);
  expect(state.workspace.analytics).toEqual([]);
});

test("guest export/import previews replace safely, rejects oversized input, and resets", async ({ page }) => {
  await page.goto("/settings");
  const interest = page.getByRole("checkbox", { name: /Agents/ });
  await interest.check();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /ייצוא פרופיל אורח|Export guest profile/ }).click();
  const exported = await downloadPromise;
  const exportPath = await exported.path();
  expect(exportPath).toBeTruthy();

  await interest.uncheck();
  const fileInput = page.getByLabel(/בחירת פרופיל אורח לייבוא|Choose guest-profile import/);
  await fileInput.setInputFiles({
    name: "oversized.json",
    mimeType: "application/json",
    buffer: Buffer.alloc(512_001, "x"),
  });
  await expect(page.getByText(/גדול מ־512KB|exceeds 512KB/)).toBeVisible();

  await fileInput.setInputFiles(exportPath!);
  await expect(page.getByText(/הפרופיל תקין|Profile validated/)).toBeVisible();
  await page.getByLabel(/אסטרטגיה|Strategy/).selectOption("replace");
  await page.getByRole("button", { name: /אישור ייבוא|Confirm import/ }).click();
  await page.waitForLoadState("domcontentloaded");
  await page.goto("/settings");
  await expect(page.getByRole("checkbox", { name: /Agents/ })).toBeChecked();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /איפוס פרופיל אורח|Reset guest profile/ }).click();
  await expect(page.getByRole("checkbox", { name: /Agents/ })).not.toBeChecked();
  const reset = await page.evaluate(() => JSON.parse(localStorage.getItem("shabis-ai-academy:guest-profile:v1") ?? "null"));
  expect(reset.favoriteIds).toEqual([]);
  expect(reset.consent.analytics).toBe(false);
});

test("partial same-origin feed preserves records and reports impaired source health", async ({ page }) => {
  await page.route("**/generated/ai-radar-feed.json", async (route) => {
    const response = await route.fetch();
    const feed = await response.json();
    await route.fulfill({
      response,
      json: {
        ...feed,
        partial: true,
        sourceHealth: [{
          sourceId: "openai-news",
          status: "failed",
          checkedAt: "2026-07-26T12:00:00Z",
          itemCount: 0,
          errorCode: "test-source-outage",
        }],
      },
    });
  });
  await page.goto("/radar");
  await expect(page.locator(".radar-freshness")).toHaveAttribute("data-status", "partial");
  await expect(page.locator(".radar-card").first()).toBeVisible();
  await expect(page.getByText(/כיסוי חלקי|partial coverage/)).toBeVisible();
});

test("structured feedback stays local with an explicit category", async ({ page }) => {
  await page.goto("/radar");
  await page.getByLabel(/סוג משוב|Feedback type/).selectOption("incorrect-summary");
  await page.getByLabel(/הודעה|Message/).fill("The source summary needs review");
  await page.getByRole("button", { name: /שמירה מקומית|Save locally/ }).click();
  await expect(page.getByText(/נשמר במכשיר בלבד|saved on this device only/)).toBeVisible();
  const feedback = await page.evaluate(() => JSON.parse(localStorage.getItem("shabis-ai-academy:feedback:v1") ?? "null"));
  expect(feedback).toHaveLength(1);
  expect(feedback[0]).toMatchObject({ category: "incorrect-summary", status: "local-only" });
});

test("mobile English Radar remains keyboard-operable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/settings");
  await page.getByRole("radio", { name: /English/ }).click();
  await page.goto("/radar");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await page.getByRole("button", { name: "For you" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "For you" })).toHaveAttribute("aria-current", "page");
});

test("empty filtered state never fabricates Radar content", async ({ page }) => {
  await page.goto("/radar");
  await page.getByRole("searchbox", { name: /חיפוש|Search/ }).fill("no-record-can-match-this-query-8f6d3a");
  await expect(page.getByRole("heading", { name: /אין פריטים בתצוגה|No items in this view/ })).toBeVisible();
  await expect(page.locator(".radar-card")).toHaveCount(0);
});

test("anonymous users cannot open administrative routes", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).not.toHaveURL(/\/admin(?:\/|$)/);
  await expect(page.getByRole("heading", { name: /ניהול לקריאה בלבד|Read-only administration/ })).toHaveCount(0);
});
