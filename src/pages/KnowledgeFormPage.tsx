import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { deterministicHash } from "../evaluations/hash";
import { useLanguage } from "../i18n/LanguageContext";
import { useKnowledge, type KnowledgeContentType, type KnowledgeInput } from "../knowledge";
import { useOutcomes } from "../outcomes";
import { useProjects } from "../projects";
const initial: KnowledgeInput = { title: "", description: "", contentType: "note", content: "", tags: [], projectIds: [], source: "note" };
export function KnowledgeFormPage() { const { documentId } = useParams(); const [params] = useSearchParams(); const { language } = useLanguage(); const knowledge = useKnowledge(); const projects = useProjects(); const outcomesState = useOutcomes(); const navigate = useNavigate(); const existing = documentId ? knowledge.get(documentId) : undefined; const [input, setInput] = useState<KnowledgeInput>(existing ?? { ...initial, projectIds: params.get("project") ? [params.get("project")!] : [] }); const [error, setError] = useState(""); const text = language === "he" ? { title: existing ? "עריכת מסמך" : "מסמך ידע חדש", save: "שמירה", warning: "TXT, Markdown, JSON ו-CSV עד 1MB. הקובץ נשמר מקומית ואינו נשלח לספק.", file: "טעינת קובץ", error: "המסמך אינו תקין או גדול מדי." } : { title: existing ? "Edit document" : "New knowledge document", save: "Save", warning: "TXT, Markdown, JSON, and CSV up to 1MB. The file stays local and is not sent to a provider.", file: "Load file", error: "The document is invalid or too large." };
  const createKnowledgeOutcome = (document: ReturnType<typeof knowledge.create>) => {
    const outcome = outcomesState.create({
      title: document.title, summary: document.description || document.title, intent: document.description || document.title,
      status: "ready", realityMode: "local", sourceModule: "knowledge", sourceEntityId: document.id, resultType: "context-result",
      resultLocation: `/knowledge/${document.id}`,
      usageInstructions: language === "he" ? "ניתן לקשר את המסמך כהקשר לפרויקט, פרומפט או משימה." : "Link this document as context to a project, prompt, or mission.",
      nextActions: [{ id: "review", label: language === "he" ? "סקירת המסמך" : "Review the document", route: `/knowledge/${document.id}` }],
      limitations: [language === "he" ? "מקומי בלבד; אין אחזור מבוסס RAG." : "Local only; no RAG-based retrieval occurs."],
      deliverableIds: [], evidenceIds: [], verificationState: "unverified",
    });
    if (!outcome) return;
    const now = new Date().toISOString();
    outcomesState.addDeliverable({
      schemaVersion: 2, id: `deliverable-${outcome.id}`, actorId: outcome.actorId, outcomeId: outcome.id,
      title: language === "he" ? "מסמך ידע שמור" : "Saved knowledge document", resultType: "knowledge-deliverable",
      location: `/knowledge/${document.id}`, usageInstructions: document.description || document.title,
      sourceEntityId: document.id, contentHash: deterministicHash(document.content), createdAt: now, updatedAt: now, version: 1,
    });
    outcomesState.update(outcome.id, { status: "completed" });
  };
  const save = () => { try { let documentIdValue: string; if (existing) { knowledge.update(existing.id, input); documentIdValue = existing.id; } else { const created = knowledge.create(input); documentIdValue = created.id; createKnowledgeOutcome(created); } for (const projectId of input.projectIds) projects.link(projectId, "documentIds", documentIdValue); navigate(`/knowledge/${documentIdValue}`); } catch { setError(text.error); } }; return <div className="page"><h1>{text.title}</h1><p>{text.warning}</p>{error && <p role="alert">{error}</p>}<div className="glass-panel"><label>Title<input value={input.title} onChange={(event) => setInput({ ...input, title: event.target.value })} /></label><label>Description<textarea value={input.description} onChange={(event) => setInput({ ...input, description: event.target.value })} /></label><label>Type<select value={input.contentType} onChange={(event) => setInput({ ...input, contentType: event.target.value as KnowledgeContentType })}>{["note", "text", "markdown", "json", "csv"].map((value) => <option key={value}>{value}</option>)}</select></label><label>{text.file}<input type="file" accept=".txt,.md,.markdown,.json,.csv,text/plain,text/markdown,application/json,text/csv" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; const extension = file.name.split(".").pop()?.toLowerCase(); const contentType: KnowledgeContentType = extension === "json" ? "json" : extension === "csv" ? "csv" : extension === "md" || extension === "markdown" ? "markdown" : "text"; setInput({ ...input, title: input.title || file.name, filename: file.name, content: await file.text(), contentType, source: "file" }); }} /></label><label>Content<textarea rows={16} value={input.content} onChange={(event) => setInput({ ...input, content: event.target.value, source: "paste" })} /></label><label>Tags<input value={input.tags.join(", ")} onChange={(event) => setInput({ ...input, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} /></label><button onClick={save}>{text.save}</button></div></div>; }
