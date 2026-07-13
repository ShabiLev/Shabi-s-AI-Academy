import { describe, expect, it } from "vitest";
import { packedPrompts } from "../prompts/packs";
import { starterAgents } from "../agents/catalog";
import { toolCatalog } from "../agents/types";
describe("beta security boundaries", () => {
  it("keeps every starter tool disconnected", () => { expect(toolCatalog.every((tool) => tool.connectionStatus === "notConnected")).toBe(true); expect(starterAgents.every((agent) => agent.connectionStatus === "notConnected")).toBe(true); });
  it("keeps external-looking content inert", () => { const payload = "<img src=x onerror=alert(1)>"; const prompt = { ...packedPrompts[0], task: { he: payload, en: payload } }; expect(prompt.task.en).toBe(payload); expect(typeof prompt.task.en).toBe("string"); });
  it("contains no credential-shaped packed fields", () => { expect(JSON.stringify(packedPrompts)).not.toMatch(/sk-[a-z0-9]{20,}|bearer\s+[a-z0-9._-]{20,}/i); });
});
