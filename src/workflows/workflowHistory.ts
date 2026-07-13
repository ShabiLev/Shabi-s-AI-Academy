import type { WorkflowRun } from "./types";
export function addWorkflowRun(history: readonly WorkflowRun[], run: WorkflowRun): WorkflowRun[] { return [...history.filter((item) => item.id !== run.id), run].slice(-100); }

