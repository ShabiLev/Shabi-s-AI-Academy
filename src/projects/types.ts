export type ProjectStatus = "planning" | "active" | "onHold" | "completed" | "archived";
export interface ProjectActivity { id: string; timestamp: string; summary: string }
export interface Project {
  id: string; name: string; description: string; category: string; status: ProjectStatus; tags: string[];
  promptIds: string[]; agentIds: string[]; runIds: string[]; documentIds: string[]; notes: string;
  activity: ProjectActivity[]; createdAt: string; updatedAt: string; version: number; favorite: boolean; archived: boolean;
}
export type ProjectInput = Pick<Project, "name" | "description" | "category" | "status" | "tags" | "notes">;
export interface ProjectState { schemaVersion: 1; projects: Project[] }
