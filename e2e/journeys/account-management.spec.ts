import { test } from "@playwright/test"; import { visitJourney } from "./journeyHarness";
test("profile and security account surfaces are reachable safely", async ({ page }) => { await visitJourney(page, ["/profile", "/account/security"]); });
