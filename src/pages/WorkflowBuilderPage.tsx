import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deterministicHash } from "../evaluations/hash";
import { useLanguage } from "../i18n/LanguageContext";
import { useOutcomes } from "../outcomes";
import { addWorkflowNode, moveWorkflowNode, parseWorkflowState, removeWorkflowNode, updateWorkflowNode, useWorkflows, validateWorkflow, workflowNodeTypes, type Workflow, type WorkflowNodeType, type WorkflowRun } from "../workflows";

const issueText: Record<string, { he: string; en: string }> = {
  "exactly-one-start": { he: "נדרשת נקודת התחלה אחת", en: "Exactly one Start is required" }, "at-least-one-end": { he: "נדרשת לפחות נקודת סיום אחת", en: "At least one End is required" }, "maximum-nodes": { he: "מותר לשמור עד 50 שלבים", en: "A maximum of 50 nodes is allowed" }, "unsupported-cycle": { he: "זוהתה לולאה שאינה נתמכת", en: "An unsupported cycle was detected" }, "unreachable-node": { he: "קיים שלב שאינו נגיש", en: "A node is unreachable" }, "invalid-route": { he: "חיבור השלב אינו תקין", en: "A node connection is invalid" }, "invalid-entity-reference": { he: "הפניה לישות אינה תקינה", en: "An entity reference is invalid" }, "connected-write-tool": { he: "אין להפעיל כלי כתיבה מחובר", en: "Connected write tools are not allowed" }, "approval-before-risk": { he: "נדרש אישור לפני פלט לפרויקט", en: "Approval is required before project output" },
};

const runRealityMode = (run: WorkflowRun): "simulated" | "manual-action-required" => run.realityMode === "Manual action required" ? "manual-action-required" : "simulated";

export function WorkflowBuilderPage() {
  const { workflowId } = useParams(); const { language } = useLanguage(); const api = useWorkflows(); const outcomesState = useOutcomes(); const navigate = useNavigate(); const existing = workflowId ? api.get(workflowId) : undefined;
  const [workflow, setWorkflow] = useState<Workflow | undefined>(() => existing); const [newType, setNewType] = useState<WorkflowNodeType>("prompt"); const [message, setMessage] = useState(""); const [draftName, setDraftName] = useState({ he: "תהליך עבודה חדש", en: "New workflow" }); const [running, setRunning] = useState(false);
  // react-router reuses this same component instance across the /workflows/new -> /workflows/:workflowId
  // transition (both routes render WorkflowBuilderPage), so `workflow` — lazily initialized once from
  // `existing` at first mount, when there was no id yet — never picks up a workflow created afterward.
  // Re-sync whenever the route resolves to a different persisted workflow than what's currently loaded.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the route resolving to a different workflow id is an isolation boundary and must replace the loaded state.
    if (existing && workflow?.id !== existing.id) setWorkflow(existing);
  }, [existing, workflow?.id]);
  if (!workflowId) return <div className="page workflow-builder-page"><header className="page-heading"><div><Link to="/workflows">← {language === "he" ? "תהליכים" : "Workflows"}</Link><h1>{language === "he" ? "יצירת תהליך עבודה" : "Create workflow"}</h1></div></header><section className="workflow-metadata"><label>{language === "he" ? "שם בעברית" : "Hebrew name"}<input value={draftName.he} onChange={(event) => setDraftName((value) => ({ ...value, he: event.target.value }))} /></label><label>{language === "he" ? "שם באנגלית" : "English name"}<input value={draftName.en} onChange={(event) => setDraftName((value) => ({ ...value, en: event.target.value }))} /></label><button type="button" onClick={() => { const created = api.create(draftName); navigate(`/workflows/${created.id}`); }}>{language === "he" ? "יצירה" : "Create"}</button></section></div>;
  if (!workflow) return <div className="page"><h1>{language === "he" ? "התהליך לא נמצא" : "Workflow not found"}</h1><Link to="/workflows">{language === "he" ? "חזרה" : "Back"}</Link></div>;
  const issues = validateWorkflow(workflow); const save = () => { api.save(workflow); setMessage(language === "he" ? "התהליך נשמר מקומית." : "Workflow saved locally."); };
  const createRunOutcome = (result: WorkflowRun) => {
    if (outcomesState.outcomes.some((outcome) => outcome.sourceModule === "workflow" && outcome.sourceEntityId === result.id)) return;
    const realityMode = runRealityMode(result);
    const nextActions = [{ id: "review", label: language === "he" ? "סקירת התהליך" : "Review the workflow", route: `/workflows/${workflow.id}` }];
    const created = outcomesState.create({
      title: workflow.name[language], summary: result.output, intent: workflow.name[language], status: "ready", realityMode,
      sourceModule: "workflow", sourceEntityId: result.id, resultType: "run-report", resultLocation: `/workflows/${workflow.id}`,
      usageInstructions: result.nextAction, nextActions, limitations: result.limitations,
      deliverableIds: [], evidenceIds: [], verificationState: "unverified",
    });
    if (!created) return;
    const now = new Date().toISOString();
    outcomesState.addDeliverable({
      schemaVersion: 2, id: `deliverable-${created.id}`, actorId: created.actorId, outcomeId: created.id,
      title: language === "he" ? "דוח הרצת תהליך" : "Workflow run report", resultType: "run-report-deliverable",
      location: `/workflows/${workflow.id}`, usageInstructions: result.nextAction,
      sourceEntityId: result.id, contentHash: deterministicHash(result), createdAt: now, updatedAt: now, version: 1,
    });
    outcomesState.update(created.id, result.status === "completed"
      ? { status: "simulated" }
      : { status: "blocked", blockedReason: result.status === "waitingForApproval" ? result.nextAction : (result.errors.join("; ") || result.output) });
  };
  const run = async (mode: "mock" | "dryRun") => {
    if (running) return;
    setRunning(true);
    api.save(workflow);
    const result = await api.run(workflow.id, mode);
    if (result) createRunOutcome(result);
    setMessage(result?.status === "waitingForApproval" ? (language === "he" ? "התהליך נעצר לאישור מפורש." : "Workflow paused for explicit approval.") : result?.status === "completed" ? (language === "he" ? "ההרצה המקומית הושלמה." : "Local run completed.") : (language === "he" ? "יש לתקן שגיאות אימות." : "Fix validation errors before running."));
    setRunning(false);
  };
  const download = () => { const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `workflow-${workflow.id}.json`; link.click(); URL.revokeObjectURL(url); };
  const importFile = async (file?: File) => { if (!file || file.size > 1_000_000) { setMessage(language === "he" ? "קובץ הייבוא חסר או גדול מדי." : "The import file is missing or too large."); return; } try { const parsed = JSON.parse(await file.text()) as unknown; const candidate = parseWorkflowState({ workflows: [parsed], history: [] }).workflows[0]; if (!candidate) throw new Error("invalid"); const imported = api.importWorkflow(candidate); navigate(`/workflows/${imported.id}`); } catch { setMessage(language === "he" ? "קובץ התהליך אינו תקין." : "The workflow file is invalid."); } };
  return <div className="page workflow-builder-page"><header className="page-heading"><div><Link to="/workflows">← {language === "he" ? "תהליכים" : "Workflows"}</Link><h1>{language === "he" ? "בונה תהליך עבודה" : "Workflow Builder"}</h1><p>{language === "he" ? "כל הפעולות זמינות באמצעות רשימה וכפתורי מקלדת; אין צורך בגרירה." : "Every operation is available through list and keyboard controls; dragging is not required."}</p></div></header>
    <section className="workflow-metadata"><label>{language === "he" ? "שם בעברית" : "Hebrew name"}<input value={workflow.name.he} onChange={(event) => setWorkflow({ ...workflow, name: { ...workflow.name, he: event.target.value } })} /></label><label>{language === "he" ? "שם באנגלית" : "English name"}<input value={workflow.name.en} onChange={(event) => setWorkflow({ ...workflow, name: { ...workflow.name, en: event.target.value } })} /></label></section>
    <section className="workflow-add"><label>{language === "he" ? "סוג שלב" : "Step type"}<select value={newType} onChange={(event) => setNewType(event.target.value as WorkflowNodeType)}>{workflowNodeTypes.filter((type) => !["start","end"].includes(type)).map((type) => <option key={type}>{type}</option>)}</select></label><button type="button" disabled={workflow.nodes.length >= 50} onClick={() => setWorkflow(addWorkflowNode(workflow, newType))}>{language === "he" ? "הוספת שלב" : "Add step"}</button></section>
    <ol className="workflow-node-list" aria-label={language === "he" ? "שלבי התהליך" : "Workflow steps"}>{workflow.nodes.map((node, index) => <li key={node.id}><header><span>{index + 1}</span><strong>{node.title[language]}</strong><small>{node.type}</small></header><label>{language === "he" ? "כותרת" : "Title"}<input value={node.title[language]} onChange={(event) => setWorkflow(updateWorkflowNode(workflow, node.id, { title: { ...node.title, [language]: event.target.value } }))} /></label><label>{language === "he" ? "הפניה לישות (אופציונלי)" : "Entity reference (optional)"}<input value={node.config.entityId ?? ""} onChange={(event) => setWorkflow(updateWorkflowNode(workflow, node.id, { config: { ...node.config, entityId: event.target.value } }))} /></label><div><button type="button" disabled={index <= 1} onClick={() => setWorkflow(moveWorkflowNode(workflow, node.id, -1))}>{language === "he" ? "הזזה למעלה" : "Move up"}</button><button type="button" disabled={index === 0 || index >= workflow.nodes.length - 2} onClick={() => setWorkflow(moveWorkflowNode(workflow, node.id, 1))}>{language === "he" ? "הזזה למטה" : "Move down"}</button><button type="button" disabled={node.type === "start" || node.type === "end"} onClick={() => setWorkflow(removeWorkflowNode(workflow, node.id))}>{language === "he" ? "הסרת שלב" : "Remove step"}</button></div><p>{language === "he" ? "מחובר לשלב הבא" : "Connected to next"}: {node.nextNodeIds[0] ? workflow.nodes.find((item) => item.id === node.nextNodeIds[0])?.title[language] : "—"}</p></li>)}</ol>
    <section className="workflow-validation" aria-live="polite"><h2>{language === "he" ? "אימות" : "Validation"}</h2>{issues.length ? <ul>{issues.map((issue, index) => <li key={`${issue.code}-${issue.nodeId}-${index}`}>{issueText[issue.code]?.[language] ?? issue.code}</li>)}</ul> : <p>{language === "he" ? "התהליך תקין." : "Workflow is valid."}</p>}</section>
    <div className="workflow-actions"><button type="button" onClick={save}>{language === "he" ? "שמירה" : "Save"}</button><button type="button" disabled={running} onClick={() => void run("mock")}>Mock Run</button><button type="button" disabled={running} onClick={() => void run("dryRun")}>Dry Run</button><button type="button" onClick={download}>{language === "he" ? "ייצוא" : "Export"}</button><label className="workflow-import">{language === "he" ? "ייבוא" : "Import"}<input type="file" accept="application/json,.json" onChange={(event) => void importFile(event.target.files?.[0])} /></label></div><p role="status">{message}</p>
    {api.state.history.filter((item) => item.workflowId === workflow.id).length > 0 && <section className="workflow-history"><h2>{language === "he" ? "ציר זמן" : "Timeline"}</h2>{api.state.history.filter((item) => item.workflowId === workflow.id).slice(-3).reverse().map((runItem) => <article key={runItem.id}><h3>{runItem.mode} · {runItem.status}</h3><ol>{runItem.events.map((event) => <li key={event.id}>{event.nodeType} · {event.status} · {event.summary}</li>)}</ol></article>)}</section>}
  </div>;
}
