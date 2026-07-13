import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { findAgentCatalogCopies, starterAgents } from "../agents/catalog";
import { useAgentLibrary } from "../agents/AgentLibraryContext";
import { useLanguage } from "../i18n/LanguageContext";

export function StarterAgentsPage() {
  const { language } = useLanguage();
  const { state, importFromCatalog } = useAgentLibrary();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const text = language === "he" ? { title: "סוכנים התחלתיים", description: "תבניות קריאה בלבד לייבוא, Mock ו-Dry Run. כל הכלים מתוכננים ואינם מחוברים.", search: "חיפוש", all: "הכול", import: "ייבוא", another: "ייבוא עותק נוסף", open: "פתיחת עותק", simulate: "Mock מקומי", planned: "מתוכנן — לא מחובר", back: "הסוכנים שלי" } : { title: "Starter Agents", description: "Read-only templates for import, Mock, and Dry Run. Every tool is planned and not connected.", search: "Search", all: "All", import: "Import", another: "Import another", open: "Open copy", simulate: "Local Mock", planned: "Planned — not connected", back: "My Agents" };
  const items = starterAgents.filter((agent) => (category === "all" || agent.category === category) && `${agent.name.he} ${agent.name.en} ${agent.description.he} ${agent.description.en}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  return <div className="page starter-agents-page"><header className="page-header"><div><h1>{text.title}</h1><p>{text.description}</p></div><Link to="/agents">{text.back}</Link></header>
    <section className="prompt-filters" aria-label={text.title}><label>{text.search}<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">{text.all}</option>{[...new Set(starterAgents.map((agent) => agent.category))].map((value) => <option key={value}>{value}</option>)}</select></label></section>
    <p aria-live="polite">{items.length}</p><div className="prompt-grid">{items.map((template) => { const copy = findAgentCatalogCopies(state.agents, template.id)[0]; return <article className="prompt-card" key={template.id}><h2>{template.name[language]}</h2><p>{template.description[language]}</p><div className="prompt-tags"><span>{template.category}</span><span>{template.mockScenario}</span></div><p>{text.planned}</p><ul>{template.plannedTools.map((tool) => <li key={tool}>{tool}</li>)}</ul><div className="card-actions">{copy && <Link to={`/agents/${copy.id}`}>{text.open}</Link>}<button onClick={() => { const agent = importFromCatalog(template, language); navigate(`/agents/${agent.id}`); }}>{copy ? text.another : text.import}</button><button onClick={() => { const agent = copy ?? importFromCatalog(template, language); navigate(`/agents/${agent.id}/simulate`); }}>{text.simulate}</button></div></article>; })}</div>
  </div>;
}
