import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { agentCatalog, executionLabel, guidanceLabel, interpretMission, permissionLabel, teamPresets, useMissions, validateTeam, type AgentTeam, type ExecutionLevel, type GuidanceMode } from "../missions";
import { useLanguage } from "../i18n/LanguageContext";

const textFor = (language: "he" | "en", he: string, en: string) => language === "he" ? he : en;

export function MissionBuilderPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const missions = useMissions();
  const [goal, setGoal] = useState("");
  const [presetId, setPresetId] = useState(teamPresets[0].id);
  const [guidanceMode, setGuidanceMode] = useState<GuidanceMode>("guided");
  const [executionLevel, setExecutionLevel] = useState<ExecutionLevel>("simulate");
  const availableTeams = [...teamPresets, ...missions.teams];
  const preset = availableTeams.find((item) => item.id === presetId) ?? teamPresets[0];
  const [selected, setSelected] = useState<string[]>([...preset.memberAgentIds]);
  const interpretation = useMemo(() => goal.trim().length >= 8 ? interpretMission(goal) : undefined, [goal]);
  const teamReady = validateTeam({ ...preset, source: "user", memberAgentIds: selected });
  const he = language === "he";
  const updatePreset = (id: string) => {
    const next = availableTeams.find((item) => item.id === id) ?? teamPresets[0];
    setPresetId(next.id);
    setSelected([...next.memberAgentIds]);
  };
  const toggleAgent = (id: string) => {
    if (id === "conductor") return;
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 8 ? [...current, id] : current);
  };
  const start = () => {
    if (!interpretation || !teamReady) return;
    const timestamp = new Date().toISOString();
    const team: AgentTeam = selected.join("|") === preset.memberAgentIds.join("|") ? preset : {
      ...preset,
      id: `team-${crypto.randomUUID()}`,
      name: { he: `${preset.name.he} — מותאם`, en: `${preset.name.en} — custom` },
      source: "user",
      sourcePresetId: preset.source === "system" ? preset.id : preset.sourcePresetId,
      memberAgentIds: selected,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    if (team.source === "user" && !missions.saveTeam(team)) return;
    const mission = missions.create({ goal, team, guidanceMode, executionLevel, language });
    navigate(`/missions/${mission.id}`);
  };

  return <div className="page mission-builder-page" data-testid="mission-builder">
    <header className="page-heading"><div><p className="eyebrow">{he ? "הגדרה לפני פעולה" : "Define before action"}</p><h1>{he ? "בניית משימה וצוות" : "Build a mission and team"}</h1><p>{he ? "בדקו מה הובן, מי נבחר ולמה. שום שלב לא מתחיל לפני אישור התכנית." : "Review what was understood, who was selected, and why. No phase starts before plan approval."}</p></div></header>
    <div className="mission-builder-grid">
      <section className="mission-panel">
        <h2>{he ? "1. מה המטרה?" : "1. What is the goal?"}</h2>
        <label>{he ? "תיאור המשימה" : "Mission description"}<textarea value={goal} maxLength={2000} onChange={(event) => setGoal(event.target.value)} placeholder={he ? "לדוגמה: הוספת יכולת נגישה עם רגרסיה מלאה" : "Example: deliver an accessible feature with full regression"} /></label>
        <p className="field-hint">{goal.length}/2000</p>
        {interpretation ? <div className="mission-interpretation" aria-live="polite"><h3>{he ? "מה המערכת הבינה" : "What the system understood"}</h3><p>{interpretation.summary[language]}</p><h4>{he ? "קריטריוני קבלה מוצעים" : "Proposed acceptance criteria"}</h4><ul>{interpretation.acceptanceCriteria.map((item) => <li key={item.en}>{item[language]}</li>)}</ul></div> : <p>{he ? "נדרשים לפחות 8 תווים כדי ליצור פירוש." : "Enter at least 8 characters to create an interpretation."}</p>}
      </section>
      <section className="mission-panel">
        <h2>{he ? "2. צוות מומלץ" : "2. Recommended team"}</h2>
        <label>{he ? "תבנית צוות" : "Team preset"}<select value={presetId} onChange={(event) => updatePreset(event.target.value)}>{availableTeams.map((item) => <option value={item.id} key={item.id}>{item.name[language]}{item.source === "user" ? (he ? " · שלי" : " · My Team") : ""}</option>)}</select></label>
        <p>{preset.description[language]}</p>
        <div className="team-selector">{agentCatalog.map((agent) => <label key={agent.id} className="agent-option">
          <input type="checkbox" checked={selected.includes(agent.id)} disabled={agent.id === "conductor"} onChange={() => toggleAgent(agent.id)} />
          <span><strong>{agent.name[language]}</strong><small>{agent.purpose[language]}</small><em>{agent.permissions.map((permission) => permissionLabel(permission, language)).join(" · ")}</em></span>
        </label>)}</div>
        <p className="field-hint">{textFor(language, `${selected.length} מתוך 8 סוכנים פעילים`, `${selected.length} of 8 active agents`)}</p>
        {!teamReady && <div role="alert" className="mission-alert">{he ? "הצוות חייב לכלול תפקיד תפעולי, מאמת וסוקר מאשר נפרד." : "The team must include an operational role, a validator, and a separate approving reviewer."}</div>}
      </section>
      <section className="mission-panel mission-run-contract">
        <h2>{he ? "3. חוזה הרצה בטוח" : "3. Safe execution contract"}</h2>
        <label>{he ? "מצב הדרכה" : "Guidance mode"}<select value={guidanceMode} onChange={(event) => { const mode = event.target.value as GuidanceMode; setGuidanceMode(mode); if (mode === "audit-only") setExecutionLevel("explain"); }}>{(["teach", "guided", "expert", "audit-only"] as GuidanceMode[]).map((mode) => <option key={mode} value={mode}>{guidanceLabel(mode, language)}</option>)}</select></label>
        <label>{he ? "רמת הרצה" : "Execution level"}<select value={executionLevel} onChange={(event) => setExecutionLevel(event.target.value as ExecutionLevel)}>{(["explain", "simulate", "dry-run", "local-execute", "connected-execute"] as ExecutionLevel[]).map((level) => <option key={level} value={level} disabled={guidanceMode === "audit-only" && level !== "explain"}>{executionLabel(level, language)}{level === "connected-execute" ? (he ? " — לא זמין" : " — unavailable") : ""}</option>)}</select></label>
        {executionLevel === "local-execute" && <div className="mission-alert">{he ? "ביצוע מקומי מוגבל למצב המשימה בדפדפן זה; אין שינוי חיצוני." : "Local execution is limited to mission state in this browser; no external system changes."}</div>}
        {executionLevel === "connected-execute" && <div role="alert" className="mission-alert">{he ? "ביצוע מחובר חסום בגרסה זו. אין מפתחות או חיבור חיצוני." : "Connected execution is blocked in this release. No keys or external connection exist."}</div>}
        <button type="button" className="primary-button" disabled={!interpretation || !teamReady} onClick={start}>{he ? "יצירת משימה לבדיקה" : "Create mission for review"}</button>
      </section>
    </div>
  </div>;
}
