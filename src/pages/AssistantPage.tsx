import { useState } from "react";
import { Link } from "react-router-dom";
import { assistantUi, useAssistant } from "../assistant";
import { useLanguage } from "../i18n/LanguageContext";
export function AssistantPage() {
  const { language } = useLanguage(); const ui = assistantUi[language];
  const { history, lastResponse, pendingAction, send, executeAction, confirmAction, cancelAction, clearHistory } = useAssistant();
  const [input, setInput] = useState("");
  const examples = language === "he" ? ["מצא לי פרומפט לבדיקות API", "איזה סוכן מתאים לתכנון רגרסיה?", "תסביר לי את המסך הזה", "צור פרויקט QA חדש"] : ["Find me a SQL review prompt", "Which agent should I use for regression planning?", "Explain this screen", "Create a QA project"];
  return <div className="page assistant-page">
    <header className="page-heading"><div><h1>{ui.title}</h1><p>{ui.notice}</p></div><Link to="/how-to">{language === "he" ? "עזרה" : "Help"}</Link></header>
    <div className="assistant-chat-layout"><section className="assistant-chat" aria-label={language === "he" ? "שיחה מקומית" : "Local chat"}>
      <ol aria-live="polite">{history.map((entry) => <li key={entry.id} className={`assistant-message ${entry.role}`}><strong>{entry.role === "user" ? (language === "he" ? "אתה" : "You") : ui.title}</strong><p>{entry.response ? entry.response.text[language] : entry.text}</p>{entry.response?.entities.length ? <ul>{entry.response.entities.map((entity) => <li key={`${entry.response?.id}-${entity.id}`}><Link to={entity.route}>{entity.title}</Link><small>{entity.summary}</small></li>)}</ul> : null}{entry.response?.action && !entry.response.action.confirmationRequired && <button type="button" onClick={() => void executeAction(entry.response!.action!)}>{entry.response.action.title[language]}</button>}</li>)}</ol>
      {pendingAction && <div className="assistant-confirm" role="alert"><p>{lastResponse?.text[language]}</p><button type="button" onClick={cancelAction}>{language === "he" ? "ביטול" : "Cancel"}</button><button type="button" onClick={() => void confirmAction()}>{language === "he" ? "אישור" : "Confirm"}</button></div>}
      <form onSubmit={(event) => { event.preventDefault(); if (!input.trim()) return; send(input); setInput(""); }}><label>{language === "he" ? "בקשה לעוזר המקומי" : "Request for the Local Assistant"}<textarea rows={3} value={input} maxLength={2000} onChange={(event) => setInput(event.target.value)} /></label><div><button type="submit">{language === "he" ? "שליחה" : "Send"}</button><button type="button" onClick={clearHistory}>{language === "he" ? "ניקוי היסטוריה" : "Clear history"}</button></div></form>
    </section><aside className="assistant-examples"><h2>{language === "he" ? "דוגמאות נתמכות" : "Supported examples"}</h2>{examples.map((example) => <button type="button" key={example} onClick={() => setInput(example)}>{example}</button>)}<p>{language === "he" ? "העוזר אינו מדמה תשובת מודל חופשית ואינו מפעיל כלי חיצוני." : "The Assistant does not simulate freeform model output or execute external tools."}</p></aside></div>
  </div>;
}
