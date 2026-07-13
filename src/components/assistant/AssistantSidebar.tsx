import { Link, useLocation } from "react-router-dom";
import { explainRoute, assistantUi, useAssistant } from "../../assistant";
import { useLanguage } from "../../i18n/LanguageContext";
export function AssistantSidebar() {
  const { language } = useLanguage(); const ui = assistantUi[language]; const { mode, setMode, history } = useAssistant(); const { pathname } = useLocation();
  if (mode === "collapsed") return <button type="button" className="assistant-launcher" onClick={() => setMode("compact")} aria-label={ui.expand}>AI</button>;
  return <aside className={`assistant-sidebar assistant-${mode}`} aria-label={ui.title}><header><div><strong>{ui.title}</strong><small>{language === "he" ? "מקומי ודטרמיניסטי" : "Local and deterministic"}</small></div><div>{mode === "compact" && <button type="button" onClick={() => setMode("expanded")} aria-label={ui.expand}>↗</button>}<button type="button" onClick={() => setMode("collapsed")} aria-label={ui.collapse}>×</button></div></header><p className="assistant-notice">{ui.notice}</p><section><h2>{ui.explain}</h2><p>{explainRoute(pathname)[language]}</p></section><section><h2>{ui.suggestions}</h2><nav><Link to="/search">{language === "he" ? "חיפוש בסביבה" : "Search workspace"}</Link><Link to="/assistant">{ui.chat}</Link><Link to="/how-to">{language === "he" ? "עזרה רלוונטית" : "Relevant help"}</Link></nav></section>{mode === "expanded" && <section><h2>{ui.recent}</h2>{history.length ? <ul>{history.slice(-4).reverse().map((entry) => <li key={entry.id}>{entry.text.slice(0, 100)}</li>)}</ul> : <p>{language === "he" ? "אין עדיין פעילות עוזר." : "No Assistant activity yet."}</p>}</section>}</aside>;
}

