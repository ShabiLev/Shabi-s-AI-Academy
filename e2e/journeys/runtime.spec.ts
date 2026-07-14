import { test } from "@playwright/test"; import { visitJourney } from "./journeyHarness";
test("runtime history and simulated-output context are reachable", async ({ page }) => { await visitJourney(page, ["/playground/prompts", "/playground/agents", "/runs"]); });
