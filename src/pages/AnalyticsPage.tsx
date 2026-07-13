import { useMemo, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { measureWorkspaceStorage, useWorkspace } from "../workspace";

const eventLabels: Record<string, { he: string; en: string }> = {
  routeViewed: { he: "צפייה במסך", en: "Route viewed" },
  searchPerformed: { he: "חיפוש בוצע", en: "Search performed" },
  commandExecuted: { he: "פקודה הופעלה", en: "Command executed" },
  assistantIntent: { he: "בקשת עוזר", en: "Assistant request" },
  workflowRun: { he: "הרצת תהליך", en: "Workflow run" },
};

function inDateRange(timestamp: string, from: string, to: string): boolean {
  const date = timestamp.slice(0, 10);
  return (!from || date >= from) && (!to || date <= to);
}

export function AnalyticsPage() {
  const { language } = useLanguage();
  const { state, setAnalyticsEnabled, reset } = useWorkspace();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const storage = measureWorkspaceStorage();
  const events = useMemo(
    () => state.analytics.filter((event) => inDateRange(event.timestamp, from, to)),
    [from, state.analytics, to],
  );
  const counts = useMemo(
    () =>
      Object.entries(
        events.reduce<Record<string, number>>(
          (result, event) => ({ ...result, [event.type]: (result[event.type] ?? 0) + 1 }),
          {},
        ),
      ).sort((left, right) => right[1] - left[1]),
    [events],
  );
  const download = () => {
    const blob = new Blob(
      [JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), range: { from: from || null, to: to || null }, events }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "academy-local-analytics.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return <div className="page analytics-page">
    <header className="page-heading"><div><h1>{language === "he" ? "ניתוח שימוש" : "Usage analytics"}</h1><p>{language === "he" ? "ניתוח מקומי בדפדפן — ללא תוכן פרומפטים, מסמכים, מידע אישי או סודות." : "Browser-local analytics — no prompt content, document bodies, personal data, or secrets."}</p></div></header>
    <section className="analytics-controls">
      <label><input type="checkbox" checked={state.analyticsEnabled} onChange={(event) => setAnalyticsEnabled(event.target.checked)} />{language === "he" ? "איסוף אירועים מקומיים" : "Collect local events"}</label>
      <label>{language === "he" ? "מתאריך" : "From date"}<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
      <label>{language === "he" ? "עד תאריך" : "To date"}<input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} /></label>
      <button type="button" onClick={() => { setFrom(""); setTo(""); }}>{language === "he" ? "ניקוי טווח" : "Clear date range"}</button>
      <button type="button" onClick={download}>{language === "he" ? "ייצוא ניתוח" : "Export analytics"}</button>
      <button type="button" onClick={() => reset("analytics")}>{language === "he" ? "ניקוי ניתוח" : "Clear analytics"}</button>
    </section>
    <section><h2>{language === "he" ? "מדדי סביבת העבודה" : "Workspace metrics"}</h2><div className="analytics-metrics"><article><strong>{events.length}</strong><span>{language === "he" ? "אירועים בטוחים בטווח" : "safe events in range"}</span></article><article><strong>{state.activities.length}</strong><span>{language === "he" ? "פעילויות אחרונות" : "recent activities"}</span></article><article><strong>{state.preferences.filter((item) => item.favorite).length}</strong><span>{language === "he" ? "מועדפים" : "favorites"}</span></article><article><strong>{Math.round(storage.totalBytes / 1024)} KB</strong><span>{language === "he" ? "אחסון אקדמיה" : "Academy storage"}</span></article></div></section>
    <section><h2>{language === "he" ? "אירועים לפי סוג" : "Events by type"}</h2>{counts.length ? <table><thead><tr><th>{language === "he" ? "אירוע" : "Event"}</th><th>{language === "he" ? "כמות" : "Count"}</th></tr></thead><tbody>{counts.map(([type, count]) => <tr key={type}><td>{eventLabels[type]?.[language] ?? type}</td><td>{count}</td></tr>)}</tbody></table> : <p>{language === "he" ? "אין אירועים בטווח שנבחר." : "No events in the selected range."}</p>}</section>
    <section><h2>{language === "he" ? "שימוש באחסון" : "Storage usage"}</h2>{storage.nearCapacity && <p role="alert">{language === "he" ? "האחסון המקומי מתקרב לקיבולת. לא נמחק מידע אוטומטית." : "Local storage is nearing capacity. No data is deleted automatically."}</p>}<table><thead><tr><th>{language === "he" ? "תחום" : "Domain"}</th><th>{language === "he" ? "בתים" : "Bytes"}</th></tr></thead><tbody>{storage.domains.map((domain) => <tr key={domain.key}><td><code dir="ltr">{domain.key}</code></td><td>{domain.bytes}</td></tr>)}</tbody></table></section>
  </div>;
}
