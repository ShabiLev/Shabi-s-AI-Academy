import type { RiskLevel } from "../types";
export interface ToolDefinition {
  id: string;
  name: { he: string; en: string };
  description: { he: string; en: string };
  inputSchemaDescription: string;
  outputSchemaDescription: string;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  connectionStatus: "notConnected";
}
