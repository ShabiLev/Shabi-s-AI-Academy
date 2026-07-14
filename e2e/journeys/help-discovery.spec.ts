import { test } from "@playwright/test"; import { visitJourney } from "./journeyHarness";
test("Help glossary and page orientation are discoverable", async ({ page }) => { await visitJourney(page, ["/dashboard", "/help", "/glossary", "/how-to"]); });
