import type { Agent } from "./types";
export function buildAgentBlueprint(a: Agent, ui: "he" | "en") {
  const labels =
    ui === "he"
      ? {
          role: "תפקיד",
          goal: "מטרה",
          inputs: "קלטים",
          instructions: "הנחיות",
          tools: "כלים",
          memoryStrategy: "זיכרון",
          validationRules: "בדיקות ואימות",
          retryPolicy: "מדיניות ניסיון חוזר",
          humanApprovalPoints: "אישור אנושי",
          outputFormat: "פלט",
          completionCriteria: "תנאי סיום",
          notes: "הערות",
        }
      : {
          role: "Role",
          goal: "Goal",
          inputs: "Inputs",
          instructions: "Instructions",
          tools: "Tools",
          memoryStrategy: "Memory",
          validationRules: "Validation",
          retryPolicy: "Retry Policy",
          humanApprovalPoints: "Human Approval",
          outputFormat: "Output",
          completionCriteria: "Completion Criteria",
          notes: "Notes",
        };
  const values: Record<string, string> = {
    role: a.role,
    goal: a.goal,
    inputs: a.inputs,
    instructions: a.instructions,
    tools: a.tools.join(", "),
    memoryStrategy: a.memoryStrategy,
    validationRules: a.validationRules,
    retryPolicy: a.retryPolicy.maximumRetries
      ? `Max ${a.retryPolicy.maximumRetries}; ${a.retryPolicy.stopCondition}`
      : "",
    humanApprovalPoints: a.humanApprovalPoints
      .map((p) => `${p.title}: ${p.description}`)
      .join("\n"),
    outputFormat: a.outputFormat,
    completionCriteria: a.completionCriteria,
    notes: a.notes,
  };
  return Object.entries(labels)
    .filter(([k]) => values[k]?.trim())
    .map(([k, label]) => `## ${label}\n\n${values[k]}`)
    .join("\n\n");
}
