/* eslint-disable react-refresh/only-export-components -- provider and hook form the assistant boundary. */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAgentLibrary } from "../agents/AgentLibraryContext";
import { useProjects } from "../projects";
import { usePromptLibrary } from "../prompts/PromptLibraryContext";
import { useRuntime } from "../runtime/RuntimeContext";
import { validateAssistantAction } from "./assistantActions";
import { respondToAssistant } from "./assistantEngine";
import { loadAssistantHistory, saveAssistantHistory } from "./assistantHistory";
import type { AssistantAction, AssistantEntity, AssistantHistoryEntry, AssistantMode, AssistantResponse } from "./types";
import { createWorkspaceBackup, serializeWorkspaceBackup } from "../backup";
interface Value { mode: AssistantMode; setMode: (mode: AssistantMode) => void; history: AssistantHistoryEntry[]; lastResponse?: AssistantResponse; pendingAction?: AssistantAction; send: (input: string) => AssistantResponse; executeAction: (action: AssistantAction) => Promise<boolean>; confirmAction: () => Promise<boolean>; cancelAction: () => void; clearHistory: () => void }
const Context = createContext<Value | null>(null);
export function AssistantProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AssistantMode>("collapsed"); const [historyState, setHistory] = useState(loadAssistantHistory); const [lastResponse, setLastResponse] = useState<AssistantResponse>(); const [pendingAction, setPendingAction] = useState<AssistantAction>();
  const location = useLocation(); const navigate = useNavigate(); const prompts = usePromptLibrary(); const agents = useAgentLibrary(); const projects = useProjects(); const runtime = useRuntime();
  const entities = useMemo<AssistantEntity[]>(() => [
    ...prompts.state.prompts.map((item) => ({ id: item.id, type: "prompt" as const, title: item.title, summary: `${item.description} ${item.task}`, route: `/prompts/${item.id}` })),
    ...agents.state.agents.map((item) => ({ id: item.id, type: "agent" as const, title: item.name, summary: `${item.description} ${item.goal}`, route: `/agents/${item.id}` })),
    { id: "starter:qa-release-analyst", type: "agent" as const, title: "QA Release Analyst מנתח שחרור QA", summary: "Regression planning, release evidence, and risk review", route: "/agents/catalog?agent=qa-release-analyst" },
    { id: "starter:sql-query-reviewer", type: "agent" as const, title: "SQL Query Reviewer סוקר שאילתות SQL", summary: "SQL correctness, performance, and reporting review", route: "/agents/catalog?agent=sql-query-reviewer" },
    { id: "lesson:prompt-quality-review", type: "lesson" as const, title: "Prompt Quality Review סקירת איכות לפרומפט", summary: "Clarity, context, constraints, verification, and safety", route: "/lessons/prompt-quality-review" },
    { id: "lesson:release-and-rollback", type: "lesson" as const, title: "Release and Rollback שחרור ונסיגה", summary: "Release readiness, evidence, and rollback", route: "/lessons/release-and-rollback" },
  ], [agents.state.agents, prompts.state.prompts]);
  const commitHistory = (entries: AssistantHistoryEntry[]) => { const next = { ...historyState, entries: entries.slice(-60) }; setHistory(next); saveAssistantHistory(next); };
  const send = (raw: string) => { const input = raw.trim().slice(0, 2000); const response = respondToAssistant(input, { route: location.pathname, entities }); const now = new Date().toISOString(); commitHistory([...historyState.entries, { id: crypto.randomUUID(), role: "user", text: input, createdAt: now }, { id: response.id, role: "assistant", text: response.text.en, createdAt: response.createdAt, response }]); setLastResponse(response); setPendingAction(response.action?.confirmationRequired ? response.action : undefined); return response; };
  const execute = async (action: AssistantAction) => { if (validateAssistantAction(action).length) return false; const route = action.parameters.route; if (action.type === "navigate" || action.type === "openHelp") navigate(route); else if (action.type === "search") navigate(`/search?q=${encodeURIComponent(action.parameters.query ?? "")}`); else if (action.type === "createDraftPrompt") navigate("/prompts/new"); else if (action.type === "createDraftAgent") navigate("/agents/new"); else if (action.type === "openPlayground") navigate(route || "/playground/prompts"); else if (action.type === "createProject") { const project = projects.create({ name: action.parameters.name, description: "Created by the deterministic Local Assistant.", category: "ai-workspace", status: "planning", tags: ["assistant"], notes: "" }); navigate(`/projects/${project.id}`); } else if (action.type === "startMockRun") { await runtime.startDemo("success"); navigate("/runs"); } else if (action.type === "startDryRun") { runtime.createDryRun(); navigate("/runs"); } else if (action.type === "export") { const backup = createWorkspaceBackup(); const url = URL.createObjectURL(new Blob([serializeWorkspaceBackup(backup)], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = "shabis-ai-academy-workspace.json"; link.click(); URL.revokeObjectURL(url); } else return false; return true; };
  const value: Value = { mode, setMode, history: historyState.entries, lastResponse, pendingAction, send, executeAction: execute, confirmAction: async () => { if (!pendingAction) return false; const ok = await execute(pendingAction); if (ok) setPendingAction(undefined); return ok; }, cancelAction: () => setPendingAction(undefined), clearHistory: () => { const next = { ...historyState, entries: [] }; setHistory(next); saveAssistantHistory(next); } };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAssistant() { const value = useContext(Context); if (!value) throw new Error("Missing AssistantProvider"); return value; }
