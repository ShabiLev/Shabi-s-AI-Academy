import { test as base, expect, type Page } from "@playwright/test";
import personas from "../../quality/inventory/personas.json" with { type: "json" };

export type PersonaId = (typeof personas)[number]["id"];
type PersonaFixture = { personaPage: (id: PersonaId, route?: string) => Promise<Page> };

export const test = base.extend<PersonaFixture>({
  personaPage: async ({ page }, runFixture) => {
    await runFixture(async (id, route = "/dashboard") => {
      const persona = personas.find((entry) => entry.id === id);
      if (!persona) throw new Error(`Unknown quality persona: ${id}`);
      await page.goto("/login");
      await page.evaluate(({ language, mode, dataState }) => {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem("shabis-ai-academy-language", language);
        localStorage.setItem("shabis-ai-academy:experience:v1", JSON.stringify({ schemaVersion: 1, mode, developerModeEnabled: mode === "advanced" }));
        if (dataState === "malformed-local-storage") localStorage.setItem("shabi-ai-academy.prompt-library.v1", "{");
        if (dataState !== "empty") localStorage.setItem("shabis-ai-academy:onboarding:v1", JSON.stringify({ schemaVersion: 1, completed: true, role: "qa", goals: ["quality"], interests: ["testing"], pace: "steady", mode }));
      }, persona);
      await page.goto(route);
      const demo = page.getByRole("button", { name: /Demo Login|כניסה למצב הדגמה/ });
      if (await demo.isVisible().catch(() => false)) await demo.click();
      return page;
    });
  },
});
export { expect };
