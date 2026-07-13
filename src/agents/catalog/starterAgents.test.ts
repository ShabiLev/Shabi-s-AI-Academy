import { describe, expect, it } from "vitest";
import { findAgentCatalogCopies, importStarterAgent, starterAgents } from ".";
import { editAgent } from "../agentStorage";

describe("starter agent catalog", () => {
  it("contains the complete immutable catalog with unique IDs", () => {
    expect(starterAgents.length).toBeGreaterThanOrEqual(30);
    expect(starterAgents).toHaveLength(32);
    expect(new Set(starterAgents.map((agent) => agent.id)).size).toBe(32);
    expect(Object.isFrozen(starterAgents)).toBe(true);
  });

  it("has complete bilingual fields and no connected tools", () => {
    for (const agent of starterAgents) {
      expect(agent.name.he && agent.name.en && agent.description.he && agent.description.en).toBeTruthy();
      expect(agent.requiredInputs.length).toBeGreaterThan(0);
      expect(agent.connectionStatus).toBe("notConnected");
      expect(agent.retry.maximumRetries).toBe(2);
      expect(agent.riskNotes.en).toContain("not connected");
    }
  });

  it("imports attributed editable copies without overwriting templates", () => {
    const imported = importStarterAgent(starterAgents[0], "en");
    expect(imported.id).not.toBe(starterAgents[0].id);
    expect(imported.sourceTemplateId).toBe(starterAgents[0].id);
    expect(findAgentCatalogCopies([imported], starterAgents[0].id)).toEqual([imported]);
    expect(editAgent(imported, { ...imported, goal: "Updated local goal" }).version).toBe(2);
    expect(starterAgents[0].goal.en).not.toBe("Updated local goal");
  });
});
