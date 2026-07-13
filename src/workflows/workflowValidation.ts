import type { Workflow, WorkflowValidationIssue } from "./types";
export function validateWorkflow(workflow: Workflow, references: ReadonlySet<string> = new Set()): WorkflowValidationIssue[] {
  const issues: WorkflowValidationIssue[] = []; const starts = workflow.nodes.filter((node) => node.type === "start"), ends = workflow.nodes.filter((node) => node.type === "end");
  if (starts.length !== 1) issues.push({ code: "exactly-one-start", severity: "error" }); if (!ends.length) issues.push({ code: "at-least-one-end", severity: "error" }); if (workflow.nodes.length > 50) issues.push({ code: "maximum-nodes", severity: "error" });
  const ids = new Set(workflow.nodes.map((node) => node.id)); const visited = new Set<string>(); const visiting = new Set<string>(); let cycle = false;
  const visit = (id: string) => { if (visiting.has(id)) { cycle = true; return; } if (visited.has(id)) return; visiting.add(id); const node = workflow.nodes.find((item) => item.id === id); node?.nextNodeIds.forEach((next) => { if (ids.has(next)) visit(next); }); visiting.delete(id); visited.add(id); };
  if (starts[0]) visit(starts[0].id); if (cycle) issues.push({ code: "unsupported-cycle", severity: "error" }); workflow.nodes.filter((node) => !visited.has(node.id)).forEach((node) => issues.push({ code: "unreachable-node", nodeId: node.id, severity: "error" }));
  for (const node of workflow.nodes) { if (node.nextNodeIds.some((id) => !ids.has(id))) issues.push({ code: "invalid-route", nodeId: node.id, severity: "error" }); const reference = node.config.entityId; if (reference && references.size && !references.has(reference)) issues.push({ code: "invalid-entity-reference", nodeId: node.id, severity: "error" }); if (/connected|write-tool/i.test(Object.values(node.config).join(" "))) issues.push({ code: "connected-write-tool", nodeId: node.id, severity: "error" }); }
  const riskyIndex = workflow.nodes.findIndex((node) => node.type === "projectOutput"); const approvalIndex = workflow.nodes.findIndex((node) => node.type === "approval"); if (riskyIndex >= 0 && (approvalIndex < 0 || approvalIndex > riskyIndex)) issues.push({ code: "approval-before-risk", nodeId: workflow.nodes[riskyIndex].id, severity: "error" });
  return issues;
}

