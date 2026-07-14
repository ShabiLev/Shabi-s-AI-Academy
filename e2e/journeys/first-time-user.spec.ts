import { test } from "@playwright/test"; import { visitJourney } from "./journeyHarness";
test("first visit reaches first learning and prompt value", async ({ page }) => { await visitJourney(page, ["/onboarding", "/lessons", "/prompts/catalog", "/playground/prompts"]); });
