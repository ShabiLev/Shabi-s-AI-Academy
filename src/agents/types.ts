export type AgentLanguage = "he" | "en" | "mixed";
export type AgentCategory =
  | "qa"
  | "sql"
  | "jira"
  | "release"
  | "product"
  | "customer"
  | "development"
  | "learning"
  | "general";
export type AgentStatus = "draft" | "ready" | "archived";
export type MemoryStrategy =
  "none" | "conversation" | "session" | "longTerm" | "rag" | "custom";
export type Backoff = "none" | "fixed" | "incremental" | "exponential";
export interface AgentTool {
  id: string;
  risk: "low" | "medium" | "high";
  requiresHumanApproval: boolean;
  connectionStatus: "notConnected";
}
export interface ApprovalPoint {
  title: string;
  description: string;
  stage: string;
  required: boolean;
  approverRole: string;
}
export interface RetryPolicy {
  maximumRetries: number;
  retryCondition: string;
  backoff: Backoff;
  fallbackAction: string;
  stopCondition: string;
}
export interface AgentTestCase { id: string; input: string; expectedCharacteristics: string; forbiddenOutput: string; status: "draft" | "passed" | "failed" }
export interface AgentVersionSnapshot { version: number; savedAt: string; name: string; goal: string; instructions: string; completionCriteria: string }
export interface Agent {
  id: string;
  name: string;
  description: string;
  language: AgentLanguage;
  category: AgentCategory;
  tags: string[];
  role: string;
  goal: string;
  inputs: string;
  instructions: string;
  tools: string[];
  memoryStrategy: MemoryStrategy;
  validationRules: string;
  retryPolicy: RetryPolicy;
  humanApprovalPoints: ApprovalPoint[];
  outputFormat: string;
  completionCriteria: string;
  notes: string;
  outputSchema?: string;
  riskNotes?: string;
  sampleInput?: string;
  mockScenario?: string;
  errorHandling?: string;
  testCases?: AgentTestCase[];
  versionHistory?: AgentVersionSnapshot[];
  status: AgentStatus;
  version: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  importedFromCatalog?: boolean;
  sourceTemplateId?: string;
}
export type AgentInput = Omit<
  Agent,
  "id" | "version" | "isFavorite" | "createdAt" | "updatedAt"
>;
export interface AgentFilters {
  search: string;
  category: AgentCategory | "all";
  status: AgentStatus | "all";
  favoritesOnly: boolean;
  sort: "updated" | "created" | "name" | "quality" | "version";
}
export interface AgentState {
  schemaVersion: 1;
  agents: Agent[];
  filters: AgentFilters;
  draft?: Partial<AgentInput>;
  lastOpenedAgentId?: string;
  lastSimulationInput?: string;
}
export const categories: AgentCategory[] = [
  "qa",
  "sql",
  "jira",
  "release",
  "product",
  "customer",
  "development",
  "learning",
  "general",
];
export const toolCatalog: AgentTool[] = [
  {
    id: "jiraReader",
    risk: "medium",
    requiresHumanApproval: false,
    connectionStatus: "notConnected",
  },
  {
    id: "githubReader",
    risk: "low",
    requiresHumanApproval: false,
    connectionStatus: "notConnected",
  },
  {
    id: "sqlQuery",
    risk: "high",
    requiresHumanApproval: true,
    connectionStatus: "notConnected",
  },
  {
    id: "testReport",
    risk: "low",
    requiresHumanApproval: false,
    connectionStatus: "notConnected",
  },
  {
    id: "fileReader",
    risk: "medium",
    requiresHumanApproval: false,
    connectionStatus: "notConnected",
  },
  {
    id: "webSearch",
    risk: "medium",
    requiresHumanApproval: false,
    connectionStatus: "notConnected",
  },
  {
    id: "emailDraft",
    risk: "high",
    requiresHumanApproval: true,
    connectionStatus: "notConnected",
  },
  {
    id: "calendarReader",
    risk: "medium",
    requiresHumanApproval: false,
    connectionStatus: "notConnected",
  },
  {
    id: "notification",
    risk: "high",
    requiresHumanApproval: true,
    connectionStatus: "notConnected",
  },
  {
    id: "none",
    risk: "low",
    requiresHumanApproval: false,
    connectionStatus: "notConnected",
  },
];
export const emptyAgent: AgentInput = {
  name: "",
  description: "",
  language: "he",
  category: "general",
  tags: [],
  role: "",
  goal: "",
  inputs: "",
  instructions: "",
  tools: ["none"],
  memoryStrategy: "none",
  validationRules: "",
  retryPolicy: {
    maximumRetries: 0,
    retryCondition: "",
    backoff: "none",
    fallbackAction: "",
    stopCondition: "",
  },
  humanApprovalPoints: [],
  outputFormat: "",
  completionCriteria: "",
  notes: "",
  outputSchema: "",
  riskNotes: "",
  sampleInput: "",
  mockScenario: "",
  errorHandling: "",
  testCases: [],
  versionHistory: [],
  status: "draft",
  importedFromCatalog: false,
  sourceTemplateId: undefined,
};
