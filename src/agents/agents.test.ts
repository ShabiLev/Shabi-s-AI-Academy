import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAgent,
  duplicateAgent,
  editAgent,
  emptyAgentState,
  loadAgentState,
  saveAgentState,
} from "./agentStorage";
import { agentTemplates } from "./agentTemplates";
import { evaluateAgent } from "./agentQuality";
import { simulateAgent } from "./agentSimulation";
import { filterAgents } from "./utils";

describe("Agent domain", () => {
  beforeEach(() => localStorage.clear());

  it("recovers from malformed storage and removes duplicate IDs", () => {
    localStorage.setItem("shabi-ai-academy.agent-library.v1", "{");
    expect(loadAgentState().agents).toEqual([]);
    const agent = createAgent(agentTemplates[0]);
    saveAgentState({ ...emptyAgentState(), agents: [agent, agent] });
    expect(loadAgentState().agents).toHaveLength(1);
  });

  it("creates unique agents, versions edits, and duplicates", () => {
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn().mockReturnValueOnce("one").mockReturnValueOnce("two"),
    });
    const agent = createAgent(agentTemplates[0]);
    expect(
      editAgent(agent, { ...agentTemplates[0], goal: `${agent.goal} Updated.` })
        .version,
    ).toBe(2);
    const copy = duplicateAgent(agent, "Copy");
    expect(copy.id).not.toBe(agent.id);
    expect(copy.name).toContain("Copy");
    vi.unstubAllGlobals();
  });

  it("filters favorites and scores all dimensions deterministically", () => {
    const agent = { ...createAgent(agentTemplates[0]), isFavorite: true };
    expect(
      filterAgents([agent], {
        ...emptyAgentState().filters,
        favoritesOnly: true,
      }),
    ).toEqual([agent]);
    const result = evaluateAgent(agent);
    expect(result.checks).toHaveLength(10);
    expect(evaluateAgent(agent)).toEqual(result);
  });

  it.each([
    "success",
    "validationFailure",
    "retry",
    "approval",
    "maxRetries",
    "incomplete",
  ] as const)(
    "simulates %s locally with explicit tool warnings",
    (scenario) => {
      const steps = simulateAgent(
        createAgent(agentTemplates[0]),
        scenario,
        "sample",
      );
      expect(steps.length).toBeGreaterThan(7);
      expect(
        steps.some((step) => step.warning?.includes("no external call")),
      ).toBe(true);
    },
  );
});
