export type ProjectStatus = "planning" | "active" | "onHold" | "completed" | "archived";
export interface ProjectActivity { id: string; timestamp: string; summary: string }
export interface ProjectDecision { id: string; summary: string; rationale: string; recordedAt: string }
export interface ProjectRisk { id: string; summary: string; mitigation: string; status: "open" | "mitigated"; recordedAt: string }
export type ProjectLinkField = "promptIds" | "agentIds" | "runIds" | "documentIds" | "outcomeIds" | "teamIds" | "missionIds" | "workflowIds" | "evidenceIds" | "deliverableIds";
export interface Project {
  id: string; name: string; description: string; category: string; status: ProjectStatus; tags: string[];
  promptIds: string[]; agentIds: string[]; runIds: string[]; documentIds: string[]; notes: string;
  objective: string; targetOutcome: string; outcomeIds: string[]; teamIds: string[]; missionIds: string[];
  workflowIds: string[]; evidenceIds: string[]; deliverableIds: string[]; decisions: ProjectDecision[];
  risks: ProjectRisk[]; blockers: string[]; nextActions: string[];
  activity: ProjectActivity[]; createdAt: string; updatedAt: string; version: number; favorite: boolean; archived: boolean;
}
export type ProjectInput = Pick<Project, "name" | "description" | "category" | "status" | "tags" | "notes">;
export interface ProjectState { schemaVersion: 2; projects: Project[] }
