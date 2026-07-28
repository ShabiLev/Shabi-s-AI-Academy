import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { pageRegistry } from "../guidance";
import { useGuidedTour } from "../guidance/tours";
import {
  helpAreaForProductArea,
  helpAreaLabels,
  helpLevelLabels,
  type HelpAreaFilter,
  type HelpLevelFilter,
} from "../help/helpCenterUi";
import { helpSections } from "../help/helpData";
import { useLanguage } from "../i18n/LanguageContext";

export function HelpCenterPage() {
  const { language } = useLanguage();
  const [params] = useSearchParams();
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<HelpAreaFilter>("all");
  const [level, setLevel] = useState<HelpLevelFilter>("all");
  const { firstVisit, restartFirstVisit } = useGuidedTour();
  const article = params.get("article");
  const items = useMemo(() => pageRegistry.filter((page) => {
    const haystack = `${page.title.he} ${page.title.en} ${page.summary.he} ${page.summary.en}`.toLocaleLowerCase();
    return (!query || haystack.includes(query.toLocaleLowerCase()))
      && (area === "all" || helpAreaForProductArea(page.area) === area)
      && (level === "all" || page.visibility === level);
  }), [area, level, query]);
  const currentHelp = article ? helpSections.find((item) => item.id === article) : undefined;

  return <div className="page help-center-page">
    {currentHelp && <section className="panel current-screen-help" aria-labelledby="current-help-title"><p className="eyebrow">{language === "he" ? "המסך הנוכחי" : "Current screen"}</p><h2 id="current-help-title">{language === "he" ? currentHelp.titleHe : currentHelp.titleEn}</h2><p>{language === "he" ? currentHelp.summaryHe : currentHelp.summaryEn}</p><Link to={currentHelp.relatedRoutes[0]}>{language === "he" ? "חזרה לתכונה" : "Back to feature"}</Link></section>}
    <section className="help-filters panel" aria-label={language === "he" ? "סינון עזרה" : "Help filters"}>
      <label>{language === "he" ? "חיפוש" : "Search"}<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <label>{language === "he" ? "אזור מוצר" : "Product area"}<select value={area} onChange={(event) => setArea(event.target.value as HelpAreaFilter)}>{Object.entries(helpAreaLabels).map(([value, label]) => <option key={value} value={value}>{label[language]}</option>)}</select></label>
      <label>{language === "he" ? "רמה" : "Level"}<select value={level} onChange={(event) => setLevel(event.target.value as HelpLevelFilter)}>{Object.entries(helpLevelLabels).map(([value, label]) => <option key={value} value={value}>{label[language]}</option>)}</select></label>
    </section>
    <div className="help-center-grid">
      <section><h2>{language === "he" ? "הדרכה לפי משימה" : "Task guidance"}</h2><div className="card-grid">{items.map((page) => {
        const areaLabel = helpAreaLabels[helpAreaForProductArea(page.area)][language];
        return <article className="panel" key={page.id}><p className="eyebrow">{areaLabel}</p><h3>{page.title[language]}</h3><p>{page.summary[language]}</p><div className="card-actions"><Link to={page.route}>{language === "he" ? "פתחו תכונה" : "Open feature"}</Link><Link to={`/how-to#${page.helpId}`}>{language === "he" ? "מדריך מלא" : "Full guide"}</Link></div></article>;
      })}</div></section>
      <aside className="help-resources"><section className="panel"><h2>{language === "he" ? "משאבים" : "Resources"}</h2><ul><li><Link to="/glossary">{language === "he" ? "מילון מונחים" : "Glossary"}</Link></li><li><Link to="/docs">{language === "he" ? "תיעוד טכני" : "Technical documentation"}</Link></li><li><Link to="/lessons">{language === "he" ? "שיעורים קשורים" : "Related lessons"}</Link></li><li><Link to="/prompts/packs">{language === "he" ? "פרומפטים קשורים" : "Related prompts"}</Link></li><li><Link to="/agents/catalog">{language === "he" ? "סוכנים קשורים" : "Related agents"}</Link></li></ul></section>{firstVisit.status === "completed" && <section className="panel walkthrough-replay-panel"><h2>WALK ME</h2><p>{language === "he" ? "אפשר לחזור להדרכה בכל עת בלי למחוק עבודה או העדפות." : "Replay the product guide at any time without deleting work or preferences."}</p><button type="button" className="button button-secondary" onClick={restartFirstVisit}>{language === "he" ? "הפעלת WALK ME מחדש" : "Replay WALK ME"}</button></section>}</aside>
    </div>
  </div>;
}
