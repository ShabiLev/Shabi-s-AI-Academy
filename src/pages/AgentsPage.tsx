import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { useAgentLibrary } from "../agents/AgentLibraryContext";
import { agentUi, toolNames } from "../agents/agentUi";
import { categories } from "../agents/types";
import { filterAgents } from "../agents/utils";
import { evaluateAgent } from "../agents/agentQuality";
import { ConfirmDialog } from "../components/prompts/ConfirmDialog";
export function AgentsPage() {
  const { language } = useLanguage(),
    ui = language === "he" ? "he" : "en",
    s = agentUi[ui],
    { state, setFilters, favorite, archive, remove, duplicate } =
      useAgentLibrary(),
    [deleting, setDeleting] = useState<string>(),
    navigate = useNavigate(),
    items = filterAgents(state.agents, state.filters);
  return (
    <div className="page agents-page">
      <header className="library-heading">
        <div>
          <h1>{s.library}</h1>
          <p>
            {state.agents.length} {s.counts} ·{" "}
            {state.agents.filter((a) => a.status === "ready").length} {s.ready}{" "}
            · {state.agents.filter((a) => a.isFavorite).length} ★
          </p>
        </div>
        <div className="card-actions">
          <Link to="/how-to#agent-library">{s.help}</Link>
          <Link className="primary-button" to="/agents/new">
            {s.newAgent}
          </Link>
          <Link to="/agents/catalog">{ui === "he" ? "סוכנים התחלתיים" : "Starter Agents"}</Link>
        </div>
      </header>
      <section className="prompt-filters">
        <label>
          {s.search}
          <input
            value={state.filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </label>
        <label>
          Category
          <select
            value={state.filters.category}
            onChange={(e) => setFilters({ category: e.target.value as never })}
          >
            <option value="all">{s.all}</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            value={state.filters.status}
            onChange={(e) => setFilters({ status: e.target.value as never })}
          >
            <option value="all">{s.all}</option>
            <option value="draft">{s.draft}</option>
            <option value="ready">{s.ready}</option>
            <option value="archived">{s.archived}</option>
          </select>
        </label>
        <label className="check-filter">
          <input
            type="checkbox"
            checked={state.filters.favoritesOnly}
            onChange={(e) => setFilters({ favoritesOnly: e.target.checked })}
          />
          {s.favoritesOnly}
        </label>
      </section>
      {!items.length ? (
        <section className="prompt-empty">
          <h2>{state.agents.length ? "No matching Agents" : s.empty}</h2>
          <Link className="primary-button" to="/agents/new">
            {s.newAgent}
          </Link>
        </section>
      ) : (
        <div className="prompt-grid">
          {items.map((a) => (
            <article className="prompt-card" key={a.id}>
              <button
                className="favorite-button"
                aria-label={a.isFavorite ? s.unfavorite : s.favorite}
                onClick={() => favorite(a.id)}
              >
                ★ {a.isFavorite ? s.unfavorite : s.favorite}
              </button>
              <h2>{a.name}</h2>
              <p>{a.description}</p>
              <div className="prompt-tags">
                <span>{a.category}</span>
                <span>{s[a.status]}</span>
                {a.tools.slice(0, 3).map((t) => (
                  <span key={t}>{toolNames[t as keyof typeof toolNames]}</span>
                ))}
              </div>
              <p>
                {s.quality}: {evaluateAgent(a).score}/100 · v{a.version} ·{" "}
                {a.memoryStrategy}
              </p>
              <div className="card-actions">
                <Link to={`/agents/${a.id}`}>{s.view}</Link>
                <Link to={`/agents/${a.id}/edit`}>{s.edit}</Link>
                <button
                  onClick={() => {
                    const n = duplicate(a.id, s.copy);
                    if (n) navigate(`/agents/${n.id}/edit`);
                  }}
                >
                  {s.duplicate}
                </button>
                <Link to={`/agents/${a.id}/simulate`}>{s.simulate}</Link>
                <button onClick={() => archive(a.id)}>{s.archive}</button>
                <button onClick={() => setDeleting(a.id)}>{s.delete}</button>
              </div>
            </article>
          ))}
        </div>
      )}
      {deleting && (
        <ConfirmDialog
          title={s.confirmDelete}
          description={s.simulationOnly}
          cancel={s.cancel}
          confirm={s.delete}
          onCancel={() => setDeleting(undefined)}
          onConfirm={() => {
            remove(deleting);
            setDeleting(undefined);
          }}
        />
      )}
    </div>
  );
}
