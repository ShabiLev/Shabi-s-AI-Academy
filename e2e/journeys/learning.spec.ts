import { test } from "@playwright/test"; import { visitJourney } from "./journeyHarness";
test("learning can be found and continued", async ({ page }) => { await visitJourney(page, ["/dashboard", "/journey", "/lessons"]); });
