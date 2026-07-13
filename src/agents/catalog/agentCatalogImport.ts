import { createAgent } from "../agentStorage";
import type { Agent } from "../types";
import type { StarterAgent } from "./types";

export const findAgentCatalogCopies = (agents: readonly Agent[], sourceTemplateId: string) => agents.filter((agent) => agent.importedFromCatalog && agent.sourceTemplateId === sourceTemplateId);

export function importStarterAgent(template: StarterAgent, language: "he" | "en"): Agent {
  return createAgent({
    name: template.name[language], description: template.description[language], language, category: template.category,
    tags: [template.category, "starter-agent"], role: template.role[language], goal: template.goal[language],
    inputs: [...template.requiredInputs, ...template.optionalInputs].map((input) => input[language]).join("\n"),
    instructions: template.instructions[language], tools: [...template.plannedTools], memoryStrategy: template.memory,
    validationRules: template.validation[language],
    retryPolicy: { maximumRetries: template.retry.maximumRetries, retryCondition: "Recoverable validation failure", backoff: "none", fallbackAction: "Stop and request guidance", stopCondition: template.retry.stopCondition[language] },
    humanApprovalPoints: template.approvalPoints.map((point) => ({ title: language === "he" ? "אישור אנושי" : "Human approval", description: point[language], stage: "before action", required: true, approverRole: language === "he" ? "אחראי" : "Responsible reviewer" })),
    outputFormat: template.output[language], completionCriteria: template.completionCriteria[language], notes: template.riskNotes[language], status: "draft",
    importedFromCatalog: true, sourceTemplateId: template.id,
  });
}
