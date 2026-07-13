import type { LocalizedText } from "../../course/types";
import type { AgentCategory, MemoryStrategy } from "../types";

export interface StarterAgent {
  readonly id: string;
  readonly name: LocalizedText;
  readonly description: LocalizedText;
  readonly category: AgentCategory;
  readonly role: LocalizedText;
  readonly goal: LocalizedText;
  readonly requiredInputs: readonly LocalizedText[];
  readonly optionalInputs: readonly LocalizedText[];
  readonly instructions: LocalizedText;
  readonly plannedTools: readonly string[];
  readonly risks: readonly LocalizedText[];
  readonly connectionStatus: "notConnected";
  readonly memory: MemoryStrategy;
  readonly validation: LocalizedText;
  readonly retry: { readonly maximumRetries: 2; readonly stopCondition: LocalizedText };
  readonly approvalPoints: readonly LocalizedText[];
  readonly output: LocalizedText;
  readonly completionCriteria: LocalizedText;
  readonly riskNotes: LocalizedText;
  readonly qualityTarget: LocalizedText;
  readonly mockScenario: "success" | "retryThenSuccess" | "approvalRequired";
  readonly sampleInput: LocalizedText;
  readonly version: 1;
}
