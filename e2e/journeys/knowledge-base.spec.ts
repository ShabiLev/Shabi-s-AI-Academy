import { test } from "@playwright/test"; import { visitJourney } from "./journeyHarness";
test("knowledge base supports creation and recovery guidance", async ({ page }) => { await visitJourney(page, ["/knowledge", "/knowledge/new"]); });
