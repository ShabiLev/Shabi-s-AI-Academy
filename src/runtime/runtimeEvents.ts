import type { RunEvent, RunStatus } from "./types";

export interface EventFactory {
  now: () => string;
  nextId: () => string;
}

export function createRunEvent(
  factory: EventFactory,
  runId: string,
  sequence: number,
  status: RunStatus,
  safeSummary: string,
  kind = "statusChanged",
  details?: RunEvent["details"],
): RunEvent {
  return {
    id: factory.nextId(),
    runId,
    sequence,
    timestamp: factory.now(),
    kind,
    status,
    safeSummary,
    ...(details ? { details } : {}),
  };
}
