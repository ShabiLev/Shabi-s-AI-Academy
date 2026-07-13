import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { useAgentLibrary } from "../agents/AgentLibraryContext";
import { agentUi } from "../agents/agentUi";
import { buildAgentBlueprint } from "../agents/agentBlueprint";
import { evaluateAgent } from "../agents/agentQuality";
import { sanitizeAgentFilename } from "../agents/utils";
import { ConfirmDialog } from "../components/prompts/ConfirmDialog";
import { createFieldDiff } from "../builders";
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
  const previousVersion = a.versionHistory?.at(-1);
  const versionDiff = previousVersion ? createFieldDiff(previousVersion as unknown as Record<string, unknown>, a as unknown as Record<string, unknown>, ["name", "goal", "instructions", "completionCriteria"]) : [];
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
        <Link to={`/playground/agents?agent=${a.id}`}>{ui === "he" ? "פתיחה במגרש" : "Open in Playground"}</Link>
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
      <section className="version-history"><h2>{ui === "he" ? "היסטוריית גרסאות" : "Version history"}</h2>{a.versionHistory?.length ? <ol>{a.versionHistory.map((version) => <li key={`${version.version}-${version.savedAt}`}>v{version.version} · <time>{new Date(version.savedAt).toLocaleString(ui === "he" ? "he-IL" : "en-US")}</time> · {version.name}</li>)}</ol> : <p>{ui === "he" ? "הגרסה הראשונה עדיין פעילה." : "The first version is still active."}</p>}</section>
      {versionDiff.length > 0 && <section className="version-history"><h2>{ui === "he" ? "שינויים מהגרסה הקודמת" : "Changes from previous version"}</h2><ul>{versionDiff.map((change) => <li key={change.field}><strong>{change.field}</strong>: <del>{change.before}</del> → <ins>{change.after}</ins></li>)}</ul></section>}
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
