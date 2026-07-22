import { useMemo, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { useRadar } from "../radar";

type View = "timeline" | "compact" | "favorites";

const hebrewCategoryNames: Record<string, string> = {
  safety: "בטיחות",
  governance: "ממשל",
  education: "חינוך",
};

const hebrewFreshnessNames: Record<string, string> = {
  fresh: "חדש",
  aging: "מתיישן",
  stale: "מיושן",
};

export function RadarPage() {
  const { language } = useLanguage();
  const he = language === "he";
  const { records, favoriteIds, status, message, refreshing, refresh, toggleFavorite } = useRadar();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [source, setSource] = useState("all");
  const [date, setDate] = useState("all");
  const [view, setView] = useState<View>("timeline");
  const [renderedAt] = useState(() => Date.now());
  const categories = useMemo(() => ["all", ...new Set(records.map((item) => item.category))], [records]);
  const sources = useMemo(() => ["all", ...new Set(records.map((item) => item.sourceName))], [records]);
  const visible = useMemo(() => records.filter((item) => {
    const text = `${item.title.he} ${item.title.en} ${item.summary.he} ${item.summary.en} ${item.topics.join(" ")} ${item.sourceName}`.toLocaleLowerCase();
    const age = Math.floor((renderedAt - Date.parse(`${item.publicationDate}T00:00:00Z`)) / 86_400_000);
    return (!query.trim() || text.includes(query.trim().toLocaleLowerCase()))
      && (category === "all" || item.category === category)
      && (source === "all" || item.sourceName === source)
      && (date === "all" || (date === "today" ? age <= 0 : age <= 7))
      && (view !== "favorites" || favoriteIds.includes(item.canonicalId));
  }), [category, date, favoriteIds, query, records, renderedAt, source, view]);
  const locale = he ? "he-IL" : "en-US";
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(`${value}T00:00:00Z`));
  const statusLabel = he
    ? { cached: "מטמון מאומת", online: "מקוון", offline: "לא מקוון — מוצג מטמון", unavailable: "העדכון אינו זמין", partial: "עדכון חלקי" }[status]
    : { cached: "Reviewed cache", online: "Online", offline: "Offline — showing cache", unavailable: "Update unavailable", partial: "Partial update" }[status];
  const categoryLabel = (value: string) => he ? (hebrewCategoryNames[value] ?? value) : value;
  const freshnessLabel = (value: string) => he ? (hebrewFreshnessNames[value] ?? value) : value;

  return <div className="page radar-page">
    <header className="radar-hero">
      <div><span className="eyebrow">{he ? "מקורות ציבוריים מאומתים" : "Validated public sources"}</span><h1>{he ? "רדאר AI" : "AI Radar"}</h1><p>{he ? "ציר זמן בן שבעה ימים של אותות AI שנבדקו אנושית. תוכן רשת נשאר נתון לא מהימן עד שהוא עובר אימות סכימה וביקורת." : "A seven-day timeline of human-reviewed AI signals. Network content remains untrusted until schema validation and review."}</p></div>
      <div className="radar-freshness" data-status={status}><strong>{statusLabel}</strong><p>{he ? "אין צורך במפתח API. עדכון מקוון מתבצע רק לפי בקשה וממקור מאותה כתובת." : "No API key is required. Online refresh is manual and same-origin only."}</p><button type="button" className="button" disabled={refreshing} onClick={() => void refresh()}>{refreshing ? (he ? "מעדכן…" : "Refreshing…") : (he ? "בדיקת עדכון" : "Check for update")}</button>{message && <small role="status">{message}</small>}</div>
    </header>
    <section className="radar-controls" aria-label={he ? "מסנני רדאר" : "Radar filters"}>
      <label><span>{he ? "חיפוש" : "Search"}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <label><span>{he ? "קטגוריה" : "Category"}</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((value) => <option key={value} value={value}>{value === "all" ? (he ? "הכול" : "All") : categoryLabel(value)}</option>)}</select></label>
      <label><span>{he ? "מקור" : "Source"}</span><select value={source} onChange={(event) => setSource(event.target.value)}>{sources.map((value) => <option key={value} value={value}>{value === "all" ? (he ? "כל המקורות" : "All sources") : value}</option>)}</select></label>
      <label><span>{he ? "תאריך" : "Date"}</span><select value={date} onChange={(event) => setDate(event.target.value)}><option value="all">{he ? "שבעה ימים" : "Seven days"}</option><option value="today">{he ? "היום" : "Today"}</option></select></label>
      <fieldset><legend>{he ? "תצוגה" : "View"}</legend><div className="radar-filter-list">{(["timeline", "compact", "favorites"] as const).map((value) => <button type="button" key={value} aria-pressed={view === value} onClick={() => setView(value)}>{he ? { timeline: "ציר זמן", compact: "קומפקטי", favorites: "שמורים" }[value] : { timeline: "Timeline", compact: "Compact", favorites: "Favorites" }[value]}</button>)}</div></fieldset>
    </section>
    <div className="radar-results-heading"><p aria-live="polite"><strong>{visible.length}</strong> {he ? "פריטים" : "items"}</p></div>
    {visible.length ? <section className={`radar-grid radar-view-${view}`} aria-label={he ? "פריטי רדאר" : "Radar items"}>{visible.map((item) => {
      const saved = favoriteIds.includes(item.canonicalId);
      return <article className="radar-card" id={`radar-${item.canonicalId}`} key={item.id}>
        <div className="radar-card-meta"><span>{categoryLabel(item.category)}</span><span>{freshnessLabel(item.freshness)}</span><span>{item.sourceTier === 1 ? (he ? "מקור ראשוני" : "Primary source") : `Tier ${item.sourceTier}`}</span></div>
        <h2>{item.title[language]}</h2><p>{item.summary[language]}</p>
        {view !== "compact" && <div className="radar-implication"><strong>{he ? "למה זה חשוב" : "Why it matters"}</strong><p>{item.whyItMatters[language]}</p></div>}
        <dl><div><dt>{he ? "פורסם" : "Published"}</dt><dd><time dateTime={item.publicationDate}>{formatDate(item.publicationDate)}</time></dd></div><div><dt>{he ? "אומת" : "Verified"}</dt><dd><time dateTime={item.lastVerifiedAt}>{formatDate(item.lastVerifiedAt)}</time></dd></div><div><dt>{he ? "ביטחון" : "Confidence"}</dt><dd>{item.confidence}%</dd></div></dl>
        <div className="radar-card-actions"><button type="button" aria-pressed={saved} onClick={() => toggleFavorite(item.canonicalId)}>{saved ? (he ? "הסרה מהשמורים" : "Remove favorite") : (he ? "שמירה" : "Save")}</button><a className="radar-source" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{he ? "פתיחת המקור הרשמי" : "Open official source"}</a></div>
      </article>;
    })}</section> : <section className="empty-state radar-empty"><h2>{he ? "לא נמצאו פריטים" : "No items found"}</h2><p>{view === "favorites" ? (he ? "פריטים שתשמרו יישארו זמינים גם אחרי שבעה ימים." : "Saved items remain available beyond seven days.") : (he ? "נסו לשנות את המסננים." : "Try changing the filters.")}</p></section>}
  </div>;
}
