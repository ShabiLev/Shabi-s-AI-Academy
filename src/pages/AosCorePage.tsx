import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAosCore } from "../aos-core";
import { useLanguage } from "../i18n/LanguageContext";

export function AosCorePage() {
  const { language } = useLanguage();
  const he = language === "he";
  const { registry, scheduler, eventBus } = useAosCore();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"all" | "online" | "offline">("all");
  const capabilities = useMemo(() => registry.search(query, mode === "all" ? {} : { mode }), [mode, query, registry]);
  const jobs = scheduler.list();
  const events = eventBus.history().slice(-10).reverse();

  return <div className="page aos-core-page">
    <header className="page-heading"><span className="eyebrow">AOS Core 1.0.0</span><h1>{he ? "ליבת מערכת הסוכנים" : "Agent Operating System Core"}</h1><p>{he ? "יכולות, משימות רקע ואבחון אירועים מקומיים ללא מצב גלובלי נסתר." : "Capabilities, background-task definitions, and bounded local event diagnostics without hidden global state."}</p></header>
    <section className="panel"><h2>{he ? "מאגר יכולות" : "Capability Registry"}</h2><div className="aos-core-filters"><label>{he ? "חיפוש" : "Search"}<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label>{he ? "מצב" : "Mode"}<select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}><option value="all">{he ? "הכול" : "All"}</option><option value="online">Online</option><option value="offline">Offline</option></select></label></div><div className="aos-core-grid">{capabilities.map((capability) => <article key={capability.id}><h3>{capability.title[language]}</h3><p>{capability.description[language]}</p><dl><div><dt>{he ? "בעלים" : "Owner"}</dt><dd>{capability.owner}</dd></div><div><dt>{he ? "סיכון" : "Risk"}</dt><dd>{capability.riskLevel}</dd></div><div><dt>{he ? "זמינות" : "Availability"}</dt><dd>{capability.availability}</dd></div></dl><Link to={capability.documentationUrl}>{he ? "תיעוד" : "Documentation"}</Link></article>)}</div></section>
    <section className="panel"><h2>{he ? "מתזמן" : "Scheduler"}</h2><p>{he ? "הרצה מתוזמנת מתבצעת ב־GitHub Actions; הדפדפן מציג הגדרות ומאפשר סימולציה ידנית בלבד." : "Scheduled execution belongs to GitHub Actions; the browser exposes definitions and manual simulation only."}</p><ul>{jobs.map(({ task, status }) => <li key={task.id}><bdi dir="ltr">{task.id}</bdi> — {status} — <bdi dir="ltr">{task.schedule.expression ?? task.schedule.kind}</bdi></li>)}</ul></section>
    <section className="panel"><h2>{he ? "אבחון Event Bus" : "Event Bus diagnostics"}</h2>{events.length ? <ol>{events.map((event) => <li key={event.id}><bdi dir="ltr">{event.name}</bdi> <time dateTime={event.publishedAt}>{new Date(event.publishedAt).toLocaleTimeString(language)}</time></li>)}</ol> : <p>{he ? "עדיין לא פורסמו אירועים בסשן זה." : "No events have been published in this session yet."}</p>}<p>{he ? "שגיאות מסירה" : "Delivery errors"}: {eventBus.deliveryErrors().length}</p></section>
  </div>;
}
