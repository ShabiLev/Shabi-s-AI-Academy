import { test } from "@playwright/test"; import { visitJourney } from "./journeyHarness";
test("release quality and technical evidence are reviewable", async ({ page }) => { await visitJourney(page, ["/qa", "/release", "/changelog", "/developer"]); });
