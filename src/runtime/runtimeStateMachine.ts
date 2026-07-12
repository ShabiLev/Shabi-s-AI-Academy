import { runtimeError } from "./runtimeErrors";
import { createRunEvent, type EventFactory } from "./runtimeEvents";
import type { RunStatus, RuntimeState, TransitionResult } from "./types";

const transitions: Readonly<Record<RunStatus, readonly RunStatus[]>> = {
  draft: ["queued", "completed", "cancelled"],
  queued: ["running", "cancelled"],
  running: [
    "waitingForApproval",
    "retrying",
    "completed",
    "failed",
    "cancelled",
  ],
  waitingForApproval: ["running", "cancelled"],
  retrying: ["running", "failed", "cancelled"],
  completed: [],
  failed: [],
  cancelled: [],
};
export const terminalStatuses: readonly RunStatus[] = [
  "completed",
  "failed",
  "cancelled",
];

export function transitionRuntime(
  state: RuntimeState,
  to: RunStatus,
  runId: string,
  summary: string,
  factory: EventFactory,
  details?: Record<string, string | number | boolean>,
): TransitionResult {
  if (state.status === "cancelled" && to === "cancelled")
    return { ok: true, state };
  if (!transitions[state.status].includes(to)) {
    return {
      ok: false,
      state,
      error: runtimeError(
        "invalidTransition",
        "This Runtime transition is not allowed.",
        "stateMachine",
        false,
        "Return to the previous valid Runtime state.",
        `${state.status}->${to}`,
      ),
    };
  }
  const event = createRunEvent(
    factory,
    runId,
    state.events.length + 1,
    to,
    summary,
    "statusChanged",
    details,
  );
  return { ok: true, state: { status: to, events: [...state.events, event] } };
}
