import { validateWorkflow } from "./workflowValidation";
import type { Workflow, WorkflowRun, WorkflowTimelineEvent } from "./types";
export interface WorkflowRuntimeAdapter { mock: (nodeId: string) => Promise<void>; dryRun: (nodeId: string) => void }
export async function runWorkflow(workflow: Workflow, mode: "mock" | "dryRun", runtime: WorkflowRuntimeAdapter, deps: { now?: () => string; nextId?: () => string } = {}): Promise<WorkflowRun> {
  const issues = validateWorkflow(workflow); const now = deps.now ?? (() => new Date().toISOString()); const nextId = deps.nextId ?? (() => crypto.randomUUID());
  if (issues.some((issue) => issue.severity === "error")) return { id: nextId(), workflowId: workflow.id, mode, status: "failed", createdAt: now(), events: [], validationCodes: issues.map((issue) => issue.code) };
  const events: WorkflowTimelineEvent[] = [];
  for (const node of workflow.nodes) { if (node.type === "approval") { events.push({ id: nextId(), nodeId: node.id, nodeType: node.type, status: "waitingForApproval", timestamp: now(), summary: "Workflow paused for explicit local approval." }); return { id: nextId(), workflowId: workflow.id, mode, status: "waitingForApproval", createdAt: now(), events, validationCodes: [] }; } if (node.type === "mockRun" && mode === "mock") await runtime.mock(node.id); if ((node.type === "dryRun" || node.type === "mockRun") && mode === "dryRun") runtime.dryRun(node.id); events.push({ id: nextId(), nodeId: node.id, nodeType: node.type, status: "completed", timestamp: now(), summary: `${node.type} completed locally in ${mode} mode.` }); }
  return { id: nextId(), workflowId: workflow.id, mode, status: "completed", createdAt: now(), events, validationCodes: [] };
}

