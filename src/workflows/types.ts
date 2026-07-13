import type { Language } from "../i18n/types";
export type WorkflowNodeType = "start" | "prompt" | "agent" | "knowledgeDocument" | "validation" | "approval" | "mockRun" | "dryRun" | "transform" | "projectOutput" | "end";
export interface WorkflowNode { id: string; type: WorkflowNodeType; title: Record<Language, string>; config: Record<string, string>; nextNodeIds: string[] }
export interface Workflow { id: string; name: Record<Language, string>; description: Record<Language, string>; nodes: WorkflowNode[]; createdAt: string; updatedAt: string; version: number; favorite: boolean; templateId?: string }
export interface WorkflowTimelineEvent { id: string; nodeId: string; nodeType: WorkflowNodeType; status: "completed" | "waitingForApproval" | "skipped" | "failed"; timestamp: string; summary: string }
export interface WorkflowRun { id: string; workflowId: string; mode: "mock" | "dryRun"; status: "completed" | "waitingForApproval" | "failed"; createdAt: string; events: WorkflowTimelineEvent[]; validationCodes: string[] }
export interface WorkflowState { schemaVersion: 1; appVersion: string; workflows: Workflow[]; history: WorkflowRun[] }
export interface WorkflowValidationIssue { code: string; nodeId?: string; severity: "error" | "warning" }
export const workflowNodeTypes: WorkflowNodeType[] = ["start", "prompt", "agent", "knowledgeDocument", "validation", "approval", "mockRun", "dryRun", "transform", "projectOutput", "end"];

