/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createAgent,
  duplicateAgent,
  editAgent,
  loadAgentState,
  saveAgentState,
} from "./agentStorage";
import type { Agent, AgentFilters, AgentInput, AgentState } from "./types";
import { importStarterAgent } from "./catalog";
import type { StarterAgent } from "./catalog";
interface Value {
  state: AgentState;
  create: (i: AgentInput) => Agent;
  update: (id: string, i: AgentInput) => Agent | undefined;
  duplicate: (id: string, s: string) => Agent | undefined;
  remove: (id: string) => void;
  favorite: (id: string) => void;
  archive: (id: string) => void;
  setFilters: (f: Partial<AgentFilters>) => void;
  saveDraft: (d?: Partial<AgentInput>) => void;
  saveSimulationInput: (v: string) => void;
  get: (id: string) => Agent | undefined;
  importFromCatalog: (agent: StarterAgent, language: "he" | "en") => Agent;
  clear: () => void;
}
const C = createContext<Value | null>(null);
export function AgentLibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadAgentState);
  const change = (fn: (s: AgentState) => AgentState) =>
    setState((s) => {
      const n = fn(s);
      saveAgentState(n);
      return n;
    });
  const value = useMemo<Value>(
    () => ({
      state,
      create: (i) => {
        const a = createAgent(i);
        change((s) => ({
          ...s,
          agents: [a, ...s.agents],
          draft: undefined,
          lastOpenedAgentId: a.id,
        }));
        return a;
      },
      update: (id, i) => {
        const old = state.agents.find((a) => a.id === id);
        if (!old) return;
        const a = editAgent(old, i);
        change((s) => ({
          ...s,
          agents: s.agents.map((x) => (x.id === id ? a : x)),
        }));
        return a;
      },
      duplicate: (id, suffix) => {
        const old = state.agents.find((a) => a.id === id);
        if (!old) return;
        const a = duplicateAgent(old, suffix);
        change((s) => ({ ...s, agents: [a, ...s.agents] }));
        return a;
      },
      remove: (id) =>
        change((s) => ({ ...s, agents: s.agents.filter((a) => a.id !== id) })),
      favorite: (id) =>
        change((s) => ({
          ...s,
          agents: s.agents.map((a) =>
            a.id === id ? { ...a, isFavorite: !a.isFavorite } : a,
          ),
        })),
      archive: (id) =>
        change((s) => ({
          ...s,
          agents: s.agents.map((a) =>
            a.id === id
              ? { ...a, status: a.status === "archived" ? "draft" : "archived" }
              : a,
          ),
        })),
      setFilters: (f) =>
        change((s) => ({ ...s, filters: { ...s.filters, ...f } })),
      saveDraft: (d) => change((s) => ({ ...s, draft: d })),
      saveSimulationInput: (lastSimulationInput) =>
        change((s) => ({ ...s, lastSimulationInput })),
      get: (id) => state.agents.find((a) => a.id === id),
      importFromCatalog: (template, language) => {
        const agent = importStarterAgent(template, language);
        change((current) => ({ ...current, agents: [agent, ...current.agents], lastOpenedAgentId: agent.id }));
        return agent;
      },
      clear: () => change(() => ({ schemaVersion: 1, agents: [], filters: { search: "", category: "all", status: "all", favoritesOnly: false, sort: "updated" } })),
    }),
    [state],
  );
  return <C.Provider value={value}>{children}</C.Provider>;
}
export function useAgentLibrary() {
  const v = useContext(C);
  if (!v) throw new Error("Missing AgentLibraryProvider");
  return v;
}
