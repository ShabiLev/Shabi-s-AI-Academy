import {
  RUNTIME_SCHEMA_VERSION,
  RUNTIME_VERSION,
  type ExecutionMode,
  type MockScenario,
  type RunRequest,
} from "./types";

export interface RuntimeFactory {
  now: () => string;
  nextId: () => string;
}
export function browserRuntimeFactory(): RuntimeFactory {
  return {
    now: () => new Date().toISOString(),
    nextId: () => crypto.randomUUID(),
  };
}
export function createRunRequest(
  factory: RuntimeFactory,
  input: {
    mode: ExecutionMode;
    scenario?: MockScenario;
    text: string;
    systemInstruction?: string;
    variables?: Record<string, string>;
    plannedToolIds?: string[];
  },
): RunRequest {
  return {
    id: factory.nextId(),
    schemaVersion: RUNTIME_SCHEMA_VERSION,
    runtimeVersion: RUNTIME_VERSION,
    mode: input.mode,
    providerId: input.mode === "mock" ? "mock" : input.mode,
    input: input.text,
    systemInstruction:
      input.systemInstruction ??
      "Act as a deterministic educational Runtime demonstration.",
    variables: input.variables ?? {},
    plannedToolIds: input.plannedToolIds ?? ["none"],
    scenario: input.scenario ?? "success",
    requestedAt: factory.now(),
  };
}
