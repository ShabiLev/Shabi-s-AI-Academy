import { useMemo, useState } from "react";
import { filterRadarItems, isRadarSnapshotStale, newestVerification, radarItems } from "../radar";
import type { RadarCategory, RadarHorizon } from "../radar";
import { useLanguage } from "../i18n/LanguageContext";

const categories: readonly (RadarCategory | "all")[] = ["all", "models", "agents", "evaluation", "safety", "governance", "open-source"];
const horizons: readonly (RadarHorizon | "all")[] = ["all", "now", "next", "watch"];

export function RadarPage() {
  const { language } = useLanguage();
  const he = language === "he";
  const copy = he ? {
    eyebrow: "תמונת מצב מערכתית",
    title: "רדאר AI",
    intro: "אותות נבחרים ממקורות רשמיים, עם הקשר מעשי ללמידה ולבניית מערכות AI אחראיות.",
    snapshot: "תמונת מצב ערוכה — לא עדכון חי",
    policy: "הנתונים כלולים בגרסה, אינם נטענים מהרשת ואינם אוספים מידע. כל סיכום מפנה למקור הרשמי.",
    verified: "אימות מערכת אחרון",
    stale: "תמונת המצב לא אומתה ביותר מ-90 יום. יש לבדוק את המקורות לפני קבלת החלטה.",
    search: "חיפוש ברדאר",
    searchPlaceholder: "חיפוש לפי נושא, מקור או משמעות…",
    category: "נושא",
    horizon: "טווח",
    results: "אותות מוצגים",
    noResults: "לא נמצאו אותות שמתאימים למסננים.",
    reset: "ניקוי מסננים",
    implication: "למה זה חשוב",
    source: "פתיחת המקור הרשמי",
    published: "פורסם",
    checked: "נבדק",
    categories: { all: "הכול", models: "מודלים", agents: "סוכנים", evaluation: "הערכה", safety: "בטיחות", governance: "ממשל", "open-source": "קוד פתוח" },
    horizons: { all: "כל הטווחים", now: "עכשיו", next: "הבא", watch: "במעקב" },
  } : {
    eyebrow: "Curated system snapshot",
    title: "AI Radar",
    intro: "Selected signals from official sources, with practical context for learning and building responsible AI systems.",
    snapshot: "Editorial snapshot—not a live update",
    policy: "Data ships with this release, makes no network requests, and collects nothing. Every summary links to its official source.",
    verified: "Snapshot last verified",
    stale: "This snapshot has not been verified in more than 90 days. Check the sources before making a decision.",
    search: "Search the Radar",
    searchPlaceholder: "Search by topic, source, or implication…",
    category: "Topic",
    horizon: "Horizon",
    results: "signals shown",
    noResults: "No signals match these filters.",
    reset: "Clear filters",
    implication: "Why it matters",
    source: "Open official source",
    published: "Published",
    checked: "Verified",
    categories: { all: "All", models: "Models", agents: "Agents", evaluation: "Evaluation", safety: "Safety", governance: "Governance", "open-source": "Open source" },
    horizons: { all: "All horizons", now: "Now", next: "Next", watch: "Watch" },
  };
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<RadarCategory | "all">("all");
  const [horizon, setHorizon] = useState<RadarHorizon | "all">("all");
  const visibleItems = useMemo(() => filterRadarItems(radarItems, { query, category, horizon }, language), [query, category, horizon, language]);
  const locale = he ? "he-IL" : "en-US";
  const formatDate = (date: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(date + "T00:00:00Z"));
  const clear = () => { setQuery(""); setCategory("all"); setHorizon("all"); };

  return <div className="page radar-page">
    <header className="radar-hero">
      <div><span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.intro}</p></div>
      <div className="radar-freshness" data-stale={isRadarSnapshotStale(radarItems, new Date().toISOString().slice(0, 10)) || undefined}>
        <strong>{copy.snapshot}</strong><p>{copy.policy}</p><span>{copy.verified}: <time dateTime={newestVerification(radarItems)}>{formatDate(newestVerification(radarItems))}</time></span>
      </div>
    </header>
    {isRadarSnapshotStale(radarItems, new Date().toISOString().slice(0, 10)) && <p className="radar-stale" role="status">{copy.stale}</p>}
    <section className="radar-controls" aria-label={he ? "מסנני רדאר" : "Radar filters"}>
      <label className="radar-search"><span>{copy.search}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} /></label>
      <fieldset><legend>{copy.category}</legend><div className="radar-filter-list">{categories.map((value) => <button type="button" key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{copy.categories[value]}</button>)}</div></fieldset>
      <fieldset><legend>{copy.horizon}</legend><div className="radar-filter-list">{horizons.map((value) => <button type="button" key={value} aria-pressed={horizon === value} onClick={() => setHorizon(value)}>{copy.horizons[value]}</button>)}</div></fieldset>
    </section>
    <div className="radar-results-heading"><p aria-live="polite"><strong>{visibleItems.length}</strong> {copy.results}</p>{(query || category !== "all" || horizon !== "all") && <button className="text-button" type="button" onClick={clear}>{copy.reset}</button>}</div>
    {visibleItems.length ? <section className="radar-grid" aria-label={he ? "אותות AI" : "AI signals"}>{visibleItems.map((item) => <article className={`radar-card${item.featured ? " featured" : ""}`} key={item.id}>
      <div className="radar-card-meta"><span>{copy.categories[item.category]}</span><span>{copy.horizons[item.horizon]}</span></div>
      <h2>{item.title[language]}</h2><p>{item.summary[language]}</p>
      <div className="radar-implication"><strong>{copy.implication}</strong><p>{item.implication[language]}</p></div>
      <dl><div><dt>{copy.published}</dt><dd><time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time></dd></div><div><dt>{copy.checked}</dt><dd><time dateTime={item.verifiedAt}>{formatDate(item.verifiedAt)}</time></dd></div></dl>
      <a className="radar-source" href={item.sourceUrl} target="_blank" rel="noreferrer"><span>{copy.source}</span><span>{item.publisher} ↗</span></a>
    </article>)}</section> : <section className="empty-state radar-empty"><h2>{copy.noResults}</h2><button className="primary-button" type="button" onClick={clear}>{copy.reset}</button></section>}
  </div>;
}
