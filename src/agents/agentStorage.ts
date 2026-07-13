import {
  categories,
  emptyAgent,
  type Agent,
  type AgentInput,
  type AgentState,
} from "./types";
export const AGENT_STORAGE_KEY = "shabi-ai-academy.agent-library.v1";
export const emptyAgentState = (): AgentState => ({
  schemaVersion: 1,
  agents: [],
  filters: {
    search: "",
    category: "all",
    status: "all",
    favoritesOnly: false,
    sort: "updated",
  },
});
const valid = (a: unknown): a is Agent =>
  Boolean(
    a &&
    typeof a === "object" &&
    typeof (a as Agent).id === "string" &&
    typeof (a as Agent).name === "string" &&
    typeof (a as Agent).goal === "string" &&
    categories.includes((a as Agent).category),
  );
export function loadAgentState() {
  try {
    const raw = localStorage.getItem(AGENT_STORAGE_KEY);
    if (!raw) return emptyAgentState();
    const value = JSON.parse(raw) as AgentState;
    if (value?.schemaVersion !== 1 || !Array.isArray(value.agents))
      return emptyAgentState();
    const seen = new Set<string>();
    return {
      ...emptyAgentState(),
      ...value,
      agents: value.agents
        .filter(valid)
        .filter((a) => !seen.has(a.id) && Boolean(seen.add(a.id)))
        .map((agent) => ({ ...emptyAgent, ...agent, testCases: Array.isArray(agent.testCases) ? agent.testCases.slice(0, 20) : [], versionHistory: Array.isArray(agent.versionHistory) ? agent.versionHistory.slice(-20) : [] })),
    };
  } catch {
    return emptyAgentState();
  }
}
export function saveAgentState(s: AgentState) {
  try {
    localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* optional local persistence */
  }
}
export function createAgent(input: AgentInput): Agent {
  const now = new Date().toISOString();
  return {
    ...emptyAgent,
    ...input,
    id: crypto.randomUUID(),
    version: 1,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  };
}
export function editAgent(a: Agent, input: AgentInput) {
  const changed = (Object.keys(emptyAgent) as Array<keyof AgentInput>).some(
    (k) => JSON.stringify(a[k]) !== JSON.stringify(input[k]),
  );
  return changed
    ? {
        ...a,
        ...input,
        versionHistory: [...(a.versionHistory ?? []), { version: a.version, savedAt: a.updatedAt, name: a.name, goal: a.goal, instructions: a.instructions, completionCriteria: a.completionCriteria }].slice(-20),
        version: a.version + 1,
        updatedAt: new Date().toISOString(),
      }
    : a;
}
export function duplicateAgent(a: Agent, suffix: string) {
  return createAgent({ ...a, name: `${a.name} ${suffix}` } as AgentInput);
}
