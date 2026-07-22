import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { useWorkspace } from "../../workspace";
import type { WorkspaceEntityType } from "../../workspace/types";

export function RecentItems() {
  const { language } = useLanguage();
  const { state, reset } = useWorkspace();
  const he = language === "he";
  const [type, setType] = useState<WorkspaceEntityType | "all">("all");
  const [confirming, setConfirming] = useState(false);
  const items = useMemo(() => [...state.activities].filter((item) => type === "all" || item.entityType === type).sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 25), [state.activities, type]);
  const types = [...new Set(state.activities.map((item) => item.entityType))];
  const entityNames: Record<WorkspaceEntityType, { he: string; en: string }> = {
    lesson: { he: "שיעור", en: "Lesson" }, prompt: { he: "פרומפט", en: "Prompt" }, agent: { he: "סוכן", en: "Agent" },
    project: { he: "פרויקט", en: "Project" }, document: { he: "מסמך ידע", en: "Knowledge document" }, run: { he: "הרצה", en: "Run" },
    workflow: { he: "תהליך", en: "Workflow" }, help: { he: "עזרה", en: "Help" }, documentation: { he: "תיעוד", en: "Documentation" },
  };
  const kindNames = {
    opened: { he: "נפתח", en: "Opened" }, edited: { he: "נערך", en: "Edited" }, run: { he: "הורץ", en: "Run" },
    searched: { he: "חיפוש", en: "Searched" }, created: { he: "נוצר", en: "Created" }, imported: { he: "יובא", en: "Imported" }, completed: { he: "הושלם", en: "Completed" },
  } as const;
  return <section className="panel recent-items" aria-labelledby="recent-items-title">
    <header><div><h2 id="recent-items-title">{he ? "פריטים אחרונים" : "Recent Items"}</h2><p>{he ? "היסטוריה מקומית של פריטים שפתחת, ערכת או הרצת." : "Local history of items you opened, edited, or ran."}</p></div>{state.activities.length > 0 && !confirming && <button type="button" className="text-button" onClick={() => setConfirming(true)}>{he ? "ניקוי היסטוריה" : "Clear history"}</button>}</header>
    {confirming && <div className="confirmation-panel" role="alert"><p>{he ? "למחוק את כל היסטוריית הפריטים המקומית? לא ניתן לבטל פעולה זו." : "Delete all local item history? This cannot be undone."}</p><div className="inline-actions"><button type="button" className="button button-danger" onClick={() => { reset("activity"); setConfirming(false); }}>{he ? "מחיקת הכול" : "Delete all"}</button><button type="button" className="button" onClick={() => setConfirming(false)}>{he ? "ביטול" : "Cancel"}</button></div></div>}
    {types.length > 1 && <label>{he ? "סוג פריט" : "Item type"}<select value={type} onChange={(event) => setType(event.target.value as typeof type)}><option value="all">{he ? "הכול" : "All"}</option>{types.map((value) => <option key={value} value={value}>{entityNames[value][language]}</option>)}</select></label>}
    {items.length ? <ol>{items.map((item) => <li key={item.id}><Link to={item.route}>{item.title === item.route ? entityNames[item.entityType][language] : item.title}</Link><span>{entityNames[item.entityType][language]} · {kindNames[item.kind][language]}</span><time dir="ltr" dateTime={item.timestamp}>{new Date(item.timestamp).toLocaleString(language)}</time></li>)}</ol> : <div className="empty-state"><h3>{he ? "אין עדיין פריטים אחרונים" : "No recent items yet"}</h3><p>{he ? "פריטים שתפתח או תריץ יופיעו כאן." : "Items you open or run will appear here."}</p><Link to="/lessons">{he ? "פתיחת שיעורים" : "Browse lessons"}</Link></div>}
  </section>;
}
