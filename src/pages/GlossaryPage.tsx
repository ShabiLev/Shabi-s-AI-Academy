import { Link } from "react-router-dom";
import { glossaryTerms } from "../glossary/glossaryData";
import { useLanguage } from "../i18n/LanguageContext";

export function GlossaryPage() {
  const { language } = useLanguage();
  return <div className="page glossary-page"><div className="glossary-grid">{glossaryTerms.map((term) => <article className="panel glossary-card" id={term.id} key={term.id}><h2>{term.name[language]} <small lang={language === "he" ? "en" : "he"}>{term.name[language === "he" ? "en" : "he"]}</small></h2><p>{term.definition[language]}</p><p>{term.example[language]}</p>{term.availability && <p className="notice-inline">{term.availability[language]}</p>}<div className="inline-actions"><Link to={term.relatedLesson}>{language === "he" ? "שיעור קשור" : "Related lesson"}</Link><Link to={term.relatedFeature}>{language === "he" ? "תכונה קשורה" : "Related feature"}</Link></div></article>)}</div></div>;
}
