import { describe, expect, it } from "vitest";
import { classifyIntent, createAssistantAction, parseAssistantHistory, respondToAssistant, validateAssistantAction } from ".";
const workspace = { route: "/prompts", entities: [{ id: "p1", type: "prompt" as const, title: "SQL review", summary: "Review database query", route: "/prompts/p1" }], now: () => "2026-07-13T00:00:00.000Z", nextId: () => "response-1" };
describe("deterministic Local Assistant", () => {
  it("classifies supported English and Hebrew intents", () => { expect(classifyIntent("Find me a SQL prompt")).toBe("findPrompt"); expect(classifyIntent("תסביר לי את המסך הזה")).toBe("explainScreen"); expect(classifyIntent("write a poem")).toBe("unsupported"); });
  it("returns local entities and honest unsupported output", () => { const found = respondToAssistant("Find SQL prompt", workspace); expect(found.entities[0].id).toBe("p1"); const unsupported = respondToAssistant("Write a poem", workspace); expect(unsupported.type).toBe("unsupportedRequest"); expect(unsupported.text.en).toContain("live AI provider"); });
  it("requires confirmation and validates parameters", () => { const action = createAssistantAction("createProject", { name: "QA" }); expect(action.confirmationRequired).toBe(true); expect(validateAssistantAction(action)).toEqual([]); expect(validateAssistantAction(createAssistantAction("navigate", { route: "javascript:alert(1)" }))).toContain("invalid-route"); });
  it("bounds and sanitizes local assistant history", () => { const parsed = parseAssistantHistory({ entries: Array.from({ length: 70 }, (_, index) => ({ id: String(index), role: "user", text: "x".repeat(3000), createdAt: "now" })) }); expect(parsed.entries).toHaveLength(60); expect(parsed.entries[0].text).toHaveLength(2000); });
});
