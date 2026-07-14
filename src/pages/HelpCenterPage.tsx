import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { pageRegistry } from "../guidance";
import { guidedTours, useGuidedTour } from "../guidance/tours";
import { helpSections } from "../help/helpData";
import { useLanguage } from "../i18n/LanguageContext";

export function HelpCenterPage() {
  const { language } = useLanguage();
  const [params] = useSearchParams();
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [level, setLevel] = useState("all");
  const { completed, startTour } = useGuidedTour();
  const article = params.get("article");
  const items = useMemo(() => pageRegistry.filter((page) => {
    const haystack = `${page.title.he} ${page.title.en} ${page.summary.he} ${page.summary.en}`.toLocaleLowerCase();
    return (!query || haystack.includes(query.toLocaleLowerCase())) && (area === "all" || page.area === area) && (level === "all" || page.visibility === level);
  }), [area, level, query]);
  const currentHelp = article ? helpSections.find((item) => item.id === article) : undefined;

  return <div className="page help-center-page">
    {currentHelp && <section className="panel current-screen-help" aria-labelledby="current-help-title"><p className="eyebrow">{language === "he" ? "המסך הנוכחי" : "Current screen"}</p><h2 id="current-help-title">{language === "he" ? currentHelp.titleHe : currentHelp.titleEn}</h2><p>{language === "he" ? currentHelp.summaryHe : currentHelp.summaryEn}</p><Link to={currentHelp.relatedRoutes[0]}>{language === "he" ? "חזרה לתכונה" : "Back to feature"}</Link></section>}
    <section className="help-filters panel" aria-label={language === "he" ? "סינון עזרה" : "Help filters"}>
      <label>{language === "he" ? "חיפוש" : "Search"}<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <label>{language === "he" ? "אזור מוצר" : "Product area"}<select value={area} onChange={(event) => setArea(event.target.value)}><option value="all">{language === "he" ? "הכול" : "All"}</option><option value="learn">Learn</option><option value="build">Build</option><option value="workspace">Workspace</option><option value="more">More</option></select></label>
      <label>{language === "he" ? "רמה" : "Level"}<select value={level} onChange={(event) => setLevel(event.target.value)}><option value="all">{language === "he" ? "הכול" : "All"}</option><option value="beginner">Beginner</option><option value="advanced">Advanced</option></select></label>
    </section>
    <div className="help-center-grid">
      <section><h2>{language === "he" ? "הדרכה לפי משימה" : "Task guidance"}</h2><div className="card-grid">{items.map((page) => <article className="panel" key={page.id}><p className="eyebrow">{page.area}</p><h3>{page.title[language]}</h3><p>{page.summary[language]}</p><div className="inline-actions"><Link to={page.route}>{language === "he" ? "פתחו תכונה" : "Open feature"}</Link><Link to={`/how-to#${page.helpId}`}>{language === "he" ? "מדריך מלא" : "Full guide"}</Link></div></article>)}</div></section>
      <aside className="help-resources"><section className="panel"><h2>{language === "he" ? "משאבים" : "Resources"}</h2><ul><li><Link to="/glossary">{language === "he" ? "מילון מונחים" : "Glossary"}</Link></li><li><Link to="/docs">{language === "he" ? "תיעוד טכני" : "Technical documentation"}</Link></li><li><Link to="/lessons">{language === "he" ? "שיעורים קשורים" : "Related lessons"}</Link></li><li><Link to="/prompts/packs">{language === "he" ? "פרומפטים קשורים" : "Related prompts"}</Link></li><li><Link to="/agents/catalog">{language === "he" ? "סוכנים קשורים" : "Related agents"}</Link></li></ul></section><section className="panel"><h2>{language === "he" ? "סיורים מודרכים" : "Guided tours"}</h2>{guidedTours.map((tour) => <button type="button" className="tour-list-button" key={tour.id} onClick={() => startTour(tour.id)}>{tour.title[language]} <span>{completed.includes(tour.id) ? (language === "he" ? "הושלם · התחלה מחדש" : "Completed · Restart") : (language === "he" ? "התחלה" : "Start")}</span></button>)}</section></aside>
    </div>
  </div>;
}
