import { connectSequentially, createWorkflow, createWorkflowNode } from "./workflowEngine";
import type { Workflow } from "./types";
const template = (id: string, he: string, en: string, middle: Parameters<typeof createWorkflowNode>[0][]): Workflow => ({ ...connectSequentially(createWorkflow({ he, en }, [createWorkflowNode("start"), ...middle.map(createWorkflowNode), createWorkflowNode("end")])), id: `template:${id}`, templateId: id });
export const workflowTemplates: readonly Workflow[] = [
  template("qa-release", "סקירת שחרור QA", "QA Release Review", ["prompt", "agent", "validation", "approval", "mockRun"]),
  template("prompt-review", "צינור סקירת פרומפט", "Prompt Review Pipeline", ["prompt", "validation", "dryRun"]),
  template("agent-quality", "סקירת איכות סוכן", "Agent Quality Review", ["agent", "validation", "approval", "mockRun"]),
  template("sql-review", "סקירת דוח SQL", "SQL Report Review", ["knowledgeDocument", "prompt", "validation", "dryRun"]),
  template("customer-review", "סקירת תקשורת לקוח", "Customer Communication Review", ["prompt", "agent", "approval", "mockRun"]),
] as const;

