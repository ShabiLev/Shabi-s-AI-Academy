/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createRuntimeEngine } from "./runtimeSetup";
import { createRunRequest } from "./runtimeFactory";
import type {
  ExecutionMode,
  MockScenario,
  RuntimeHistoryRecord,
} from "./types";

interface RuntimeContextValue {
  runs: RuntimeHistoryRecord[];
  activeRun?: RuntimeHistoryRecord;
  storageWarning?: string;
  providerStatuses: ReturnType<
    ReturnType<typeof createRuntimeEngine>["getProviderStatuses"]
  >;
  startDemo: (scenario: MockScenario) => Promise<RuntimeHistoryRecord>;
  createDryRun: () => RuntimeHistoryRecord;
  startRequest: (input: { text: string; systemInstruction?: string; variables?: Record<string, string>; plannedToolIds?: string[]; scenario?: MockScenario }) => Promise<RuntimeHistoryRecord>;
  previewRequest: (input: { text: string; systemInstruction?: string; variables?: Record<string, string>; plannedToolIds?: string[] }) => RuntimeHistoryRecord;
  approve: (id: string) => void;
  reject: (id: string) => void;
  cancel: (id: string) => Promise<void>;
  getRun: (id: string) => RuntimeHistoryRecord | undefined;
  deleteRun: (id: string) => void;
  clearHistory: () => void;
}
const RuntimeContext = createContext<RuntimeContextValue | null>(null);
export function RuntimeProvider({ children }: { children: ReactNode }) {
  const [engine] = useState(createRuntimeEngine);
  const [runs, setRuns] = useState(() => engine.getRuns());
  const [activeRun, setActiveRun] = useState<RuntimeHistoryRecord>();
  const refresh = useCallback(
    (record?: RuntimeHistoryRecord) => {
      setRuns(engine.getRuns());
      setActiveRun(record);
    },
    [engine],
  );
  const value = useMemo<RuntimeContextValue>(
    () => ({
      runs,
      activeRun,
      storageWarning: engine.getStorageWarning(),
      providerStatuses: engine.getProviderStatuses(),
      startDemo: async (scenario) => {
        const request = createRunRequest(
          {
            now: () => new Date().toISOString(),
            nextId: () => crypto.randomUUID(),
          },
          {
            mode: "mock",
            scenario,
            text: `Runtime demo: ${scenario}`,
            plannedToolIds: scenario.includes("approval")
              ? ["jira-reader"]
              : ["none"],
          },
        );
        const record = await engine.startMock(request);
        refresh(record);
        return record;
      },
      createDryRun: () => {
        const request = createRunRequest(
          {
            now: () => new Date().toISOString(),
            nextId: () => crypto.randomUUID(),
          },
          {
            mode: "dryRun" as ExecutionMode,
            text: "Inspect this local Runtime request.",
            variables: { audience: "learner" },
            plannedToolIds: ["test-report-reader"],
          },
        );
        const record = engine.createDryRun(request);
        refresh(record);
        return record;
      },
      startRequest: async (input) => {
        const request = createRunRequest({ now: () => new Date().toISOString(), nextId: () => crypto.randomUUID() }, { mode: "mock", ...input });
        const record = await engine.startMock(request);
        refresh(record);
        return record;
      },
      previewRequest: (input) => {
        const request = createRunRequest({ now: () => new Date().toISOString(), nextId: () => crypto.randomUUID() }, { mode: "dryRun", ...input });
        const record = engine.createDryRun(request);
        refresh(record);
        return record;
      },
      approve: (id) => refresh(engine.approve(id)),
      reject: (id) => refresh(engine.reject(id)),
      cancel: async (id) => refresh(await engine.cancel(id)),
      getRun: (id) => engine.getRun(id),
      deleteRun: (id) => {
        engine.deleteRun(id);
        refresh();
      },
      clearHistory: () => {
        engine.clearHistory();
        refresh();
      },
    }),
    [activeRun, engine, refresh, runs],
  );
  return (
    <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>
  );
}
export function useRuntime() {
  const context = useContext(RuntimeContext);
  if (!context)
    throw new Error("useRuntime must be used within RuntimeProvider");
  return context;
}
