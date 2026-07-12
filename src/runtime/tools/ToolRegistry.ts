import type { ToolDefinition } from "./types";

const definitions: readonly ToolDefinition[] = [
  [
    "jira-reader",
    "Jira Reader",
    "קורא Jira",
    "Read supplied Jira exports",
    "medium",
    true,
  ],
  [
    "github-reader",
    "GitHub Reader",
    "קורא GitHub",
    "Read supplied repository context",
    "medium",
    true,
  ],
  [
    "sql-query",
    "SQL Query Tool",
    "כלי שאילתות SQL",
    "Describe SQL query plans",
    "high",
    true,
  ],
  [
    "test-report-reader",
    "Test Report Reader",
    "קורא דוחות בדיקה",
    "Read supplied test reports",
    "low",
    false,
  ],
  [
    "file-reader",
    "File Reader",
    "קורא קבצים",
    "Describe planned file reads",
    "medium",
    true,
  ],
  [
    "web-search",
    "Web Search",
    "חיפוש ברשת",
    "Describe planned web research",
    "medium",
    true,
  ],
  [
    "email-draft",
    "Email Draft Tool",
    "כלי טיוטת דוא״ל",
    "Draft only; never send",
    "high",
    true,
  ],
  [
    "calendar-reader",
    "Calendar Reader",
    "קורא יומן",
    "Describe planned calendar reads",
    "medium",
    true,
  ],
  [
    "notification",
    "Notification Tool",
    "כלי התראות",
    "Describe planned notification",
    "high",
    true,
  ],
  [
    "none",
    "No External Tools",
    "ללא כלים חיצוניים",
    "No planned external capability",
    "none",
    false,
  ],
].map(([id, en, he, description, riskLevel, requiresApproval]) => ({
  id: id as string,
  name: { en: en as string, he: he as string },
  description: { en: description as string, he: description as string },
  inputSchemaDescription: "Design-time description only.",
  outputSchemaDescription: "No output; tool execution is unavailable.",
  riskLevel: riskLevel as ToolDefinition["riskLevel"],
  requiresApproval: requiresApproval as boolean,
  connectionStatus: "notConnected" as const,
}));

export class ToolRegistry {
  private readonly tools = new Map(definitions.map((tool) => [tool.id, tool]));
  list() {
    return Array.from(this.tools.values());
  }
  get(id: string) {
    return this.tools.get(id);
  }
  describe(ids: readonly string[]) {
    return ids
      .map((id) => this.tools.get(id))
      .filter((tool): tool is ToolDefinition => Boolean(tool));
  }
}
