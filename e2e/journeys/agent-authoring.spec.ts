import { test } from "@playwright/test"; import { visitJourney } from "./journeyHarness";
test("agent authoring surfaces starter build and Mock execution", async ({ page }) => { await visitJourney(page, ["/agents/catalog", "/agents/new", "/playground/agents"]); });
