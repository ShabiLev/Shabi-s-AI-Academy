import { useState } from "react";
import { Link } from "react-router-dom";
import { useAgentLibrary } from "../agents/AgentLibraryContext";
import { starterAgents } from "../agents/catalog";
import { useLanguage } from "../i18n/LanguageContext";
import { useProjects } from "../projects";
import { useRuntime } from "../runtime/RuntimeContext";
import type { MockScenario, RuntimeHistoryRecord } from "../runtime";

const scenarios: MockScenario[] = ["success", "retryThenSuccess", "retryExhausted", "approvalRequired", "cancelled"];
const scenarioNames: Record<MockScenario, { he: string; en: string }> = {
  success: { he: "הצלחה", en: "Success" },
  validationFailure: { he: "כשל אימות", en: "Validation failure" },
  retryThenSuccess: { he: "ניסיון חוזר ואז הצלחה", en: "Retry then success" },
  retryExhausted: { he: "מיצוי ניסיונות", en: "Retries exhausted" },
  approvalRequired: { he: "נדרש אישור", en: "Approval required" },
  approvalRejected: { he: "אישור נדחה", en: "Approval rejected" },
  cancelled: { he: "ביטול", en: "Cancelled" },
};

export function AgentPlaygroundPage() {
  const { language } = useLanguage();
  const { state, importFromCatalog } = useAgentLibrary();
  const runtime = useRuntime();
  const projects = useProjects();
  const [source, setSource] = useState(`starter:${starterAgents[0].id}`);
  const [input, setInput] = useState("Review the supplied local sample. / סקרו את הדוגמה המקומית שסופקה.");
  const [scenario, setScenario] = useState<MockScenario>("success");
  const [mode, setMode] = useState<"mock" | "dryRun" | "liveReserved">("mock");
  const [record, setRecord] = useState<RuntimeHistoryRecord>();
  const [projectId, setProjectId] = useState("");
  const [saved, setSaved] = useState(false);
  const starter = source.startsWith("starter:") ? starterAgents.find((agent) => `starter:${agent.id}` === source) : undefined;
  const mine = state.agents.find((agent) => `mine:${agent.id}` === source);
  const name = starter?.name[language] ?? mine?.name ?? "Agent";
  const tools = starter?.plannedTools ?? mine?.tools ?? ["none"];
  const text = language === "he" ? {
    title: "מגרש משחקים לסוכנים", select: "בחירת סוכן", starter: "סוכנים התחלתיים", mine: "הסוכנים שלי",
    input: "קלט לדוגמה", scenario: "תרחיש", mode: "מצב", run: "הרצה", import: "ייבוא הסוכן",
    live: "הרצה חיה מושבתת", planned: "כלים מתוכננים — אינם מחוברים", output: "פלט וציר זמן",
    history: "היסטוריית הרצות", project: "בחירת פרויקט", chooseProject: "בחרו פרויקט",
    saveProject: "שמירה לפרויקט", saved: "הסוכן וההרצה נשמרו בפרויקט המקומי",
  } : {
    title: "Agent Playground", select: "Select agent", starter: "Starter Agents", mine: "My Agents",
    input: "Sample input", scenario: "Scenario", mode: "Mode", run: "Run", import: "Import agent",
    live: "Live execution is disabled", planned: "Planned tools — not connected", output: "Output and timeline",
    history: "Run History", project: "Select project", chooseProject: "Choose a project",
    saveProject: "Save to project", saved: "Agent and run saved to the local project",
  };

  const execute = async () => {
    if (mode === "liveReserved") return;
    const payload = { text: `${name}\n${input}`, scenario, plannedToolIds: ["none"] };
    setRecord(mode === "mock" ? await runtime.startRequest(payload) : runtime.previewRequest(payload));
  };
  const saveToProject = () => {
    if (!projectId) return;
    projects.link(projectId, "agentIds", starter?.id ?? mine?.id ?? source);
    if (record) projects.link(projectId, "runIds", record.id);
    setSaved(true);
  };

  return <div className="page playground-page">
    <header className="page-header"><div><h1>{text.title}</h1><p>{text.planned}</p></div><Link to="/runs">{text.history}</Link></header>
    <div className="playground-grid">
      <section className="glass-panel">
        <label>{text.select}<select value={source} onChange={(event) => { setSource(event.target.value); setSaved(false); }}>
          <optgroup label={text.starter}>{starterAgents.map((agent) => <option key={agent.id} value={`starter:${agent.id}`}>{agent.name[language]}</option>)}</optgroup>
          <optgroup label={text.mine}>{state.agents.map((agent) => <option key={agent.id} value={`mine:${agent.id}`}>{agent.name}</option>)}</optgroup>
        </select></label>
        <label>{text.input}<textarea value={input} onChange={(event) => setInput(event.target.value)} /></label>
        <label>{text.scenario}<select value={scenario} onChange={(event) => setScenario(event.target.value as MockScenario)}>{scenarios.map((value) => <option key={value} value={value}>{scenarioNames[value][language]}</option>)}</select></label>
        <label>{text.mode}<select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}><option value="mock">Mock</option><option value="dryRun">Dry Run</option><option value="liveReserved" disabled>Live</option></select></label>
        <label>{text.project}<select value={projectId} onChange={(event) => { setProjectId(event.target.value); setSaved(false); }}><option value="">{text.chooseProject}</option>{projects.state.projects.filter((project) => !project.archived).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
        {mode === "liveReserved" && <p>{text.live}</p>}
        <h2>{text.planned}</h2><ul>{tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
        <div className="card-actions"><button disabled={mode === "liveReserved"} onClick={execute}>{text.run}</button>{starter && <button onClick={() => importFromCatalog(starter, language)}>{text.import}</button>}<button disabled={!projectId} onClick={saveToProject}>{text.saveProject}</button></div>
        {saved && <p role="status">{text.saved}</p>}
      </section>
      <aside className="glass-panel"><h2>{text.output}</h2>{record ? <><p>{record.result.status}</p><pre className="runtime-output">{record.result.output ?? record.result.dryRunPreview?.assembledPrompt}</pre><ol>{record.result.events.map((event) => <li key={event.id}>{event.sequence}. {event.safeSummary}</li>)}</ol></> : <p>{mode === "liveReserved" ? text.live : text.planned}</p>}</aside>
    </div>
  </div>;
}
