import { test } from "@playwright/test"; import { visitJourney } from "./journeyHarness";
test("workflow authoring reaches builder validation runtime and history", async ({ page }) => { await visitJourney(page, ["/workflows", "/workflows/new", "/runs"]); });
