import { test } from "@playwright/test"; import { visitJourney } from "./journeyHarness";
test("project workspace supports creation and orientation", async ({ page }) => { await visitJourney(page, ["/projects", "/projects/new"]); });
