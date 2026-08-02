export type KnowledgeContentType = "text" | "markdown" | "json" | "csv" | "note";
export interface KnowledgeDocument { id: string; title: string; description: string; contentType: KnowledgeContentType; filename?: string; content: string; size: number; tags: string[]; projectIds: string[]; source: "file" | "paste" | "note"; createdAt: string; updatedAt: string; version: number; hash: string; status: "ready" }
export interface KnowledgeContextLink { id: string; documentId: string; targetModule: "project"; targetId: string; createdAt: string }
export interface KnowledgeState { schemaVersion: 2; documents: KnowledgeDocument[]; contextLinks: KnowledgeContextLink[] }
export type KnowledgeInput = Omit<KnowledgeDocument, "id" | "createdAt" | "updatedAt" | "version" | "hash" | "status" | "size">;
