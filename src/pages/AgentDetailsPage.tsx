import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { useAgentLibrary } from "../agents/AgentLibraryContext";
import { agentUi } from "../agents/agentUi";
import { buildAgentBlueprint } from "../agents/agentBlueprint";
import { evaluateAgent } from "../agents/agentQuality";
import { sanitizeAgentFilename } from "../agents/utils";
import { ConfirmDialog } from "../components/prompts/ConfirmDialog";
export function AgentDetailsPage() {
  const { agentId = "" } = useParams(),
    { language } = useLanguage(),
    ui = language === "he" ? "he" : "en",
    s = agentUi[ui],
    { get, favorite, archive, duplicate, remove } = useAgentLibrary(),
    navigate = useNavigate(),
    [deleting, setDeleting] = useState(false),
    [message, setMessage] = useState(""),
    a = get(agentId);
  if (!a)
    return (
      <div className="page">
        <h1>{s.unknown}</h1>
        <Link to="/agents">{s.library}</Link>
      </div>
    );
  const blueprint = buildAgentBlueprint(a, ui);
  const download = (kind: "md" | "json") => {
    const blob = new Blob(
        [
          kind === "json"
            ? JSON.stringify(a, null, 2)
            : `# ${a.name}\n\n${blueprint}`,
        ],
        { type: "text/plain;charset=utf-8" },
      ),
      url = URL.createObjectURL(blob),
      link = document.createElement("a");
    link.href = url;
    link.download = `${sanitizeAgentFilename(a.name)}-v${a.version}.${kind}`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="page agent-details">
      <header className="library-heading">
        <div>
          <h1>{a.name}</h1>
          <p>{a.description}</p>
        </div>
        <Link to="/how-to#agent-blueprint">{s.help}</Link>
      </header>
      <section className="quality-panel">
        <h2>
          {s.quality}: {evaluateAgent(a).score}/100
        </h2>
        <p>{s.disclaimer}</p>
      </section>
      <pre className="details-prompt" aria-label={s.blueprint}>
        {blueprint}
      </pre>
      <div className="card-actions">
        <Link to={`/agents/${a.id}/edit`}>{s.edit}</Link>
        <Link to={`/agents/${a.id}/simulate`}>{s.simulate}</Link>
        <button
          onClick={() => {
            const n = duplicate(a.id, s.copy);
            if (n) navigate(`/agents/${n.id}/edit`);
          }}
        >
          {s.duplicate}
        </button>
        <button onClick={() => favorite(a.id)}>
          {a.isFavorite ? s.unfavorite : s.favorite}
        </button>
        <button onClick={() => archive(a.id)}>{s.archive}</button>
        <button
          onClick={() =>
            navigator.clipboard
              .writeText(blueprint)
              .then(() => setMessage("Copied"))
              .catch(() => setMessage("Copy failed"))
          }
        >
          Copy
        </button>
        <button onClick={() => download("md")}>Markdown</button>
        <button onClick={() => download("json")}>JSON</button>
        <button onClick={() => window.print()}>Print</button>
        <button onClick={() => setDeleting(true)}>{s.delete}</button>
      </div>
      <p aria-live="polite">{message}</p>
      {deleting && (
        <ConfirmDialog
          title={s.confirmDelete}
          description={s.simulationOnly}
          cancel={s.cancel}
          confirm={s.delete}
          onCancel={() => setDeleting(false)}
          onConfirm={() => {
            remove(a.id);
            navigate("/agents");
          }}
        />
      )}
    </div>
  );
}
