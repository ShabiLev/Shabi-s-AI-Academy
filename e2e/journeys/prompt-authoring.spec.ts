import { test } from "@playwright/test"; import { visitJourney } from "./journeyHarness";
test("prompt authoring surfaces import build and Mock execution", async ({ page }) => { await visitJourney(page, ["/prompts/catalog", "/prompts/new", "/playground/prompts"]); });
