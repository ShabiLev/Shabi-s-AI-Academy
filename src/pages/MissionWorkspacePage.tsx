import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { agentCatalog, blockedReasonLabel, evidenceKindLabel, executionLabel, gateLabel, guidanceLabel, missionStatusLabel, phaseInputLabel, phaseStatusLabel, teamPresets, useMissions, type GuidanceMode, type MissionStatus } from "../missions";
import { useLanguage } from "../i18n/LanguageContext";
import { useProjects } from "../projects";

const actionLabel = (status: MissionStatus, he: boolean) => {
  if (status === "awaiting-plan-approval") return he ? "אישור התכנית" : "Approve plan";
  if (status === "ready") return he ? "התחלה" : "Start";
  if (status === "paused") return he ? "המשך בטוח" : "Safe continue";
  if (status === "needs-input" || status === "needs-work") return he ? "ניסיון חוזר" : "Retry";
  return he ? "השלמת השלב המדומה" : "Complete simulated phase";
};

export function MissionWorkspacePage() {
  const { missionId = "" } = useParams();
  const { language } = useLanguage();
  const missionState = useMissions();
  const projects = useProjects();
  const navigate = useNavigate();
  const mission = missionState.missions.find((item) => item.id === missionId);
  const [message, setMessage] = useState("");
  const [packName, setPackName] = useState("");
  const [packNote, setPackNote] = useState("");
  const [teamExpanded, setTeamExpanded] = useState(false);
  const [deliverableSummary, setDeliverableSummary] = useState("");
  const [simulationAcknowledged, setSimulationAcknowledged] = useState(false);
  const [blocker, setBlocker] = useState("");
  const he = language === "he";
  if (!mission) return <div className="page mission-empty"><h1>{he ? "המשימה לא נמצאה" : "Mission not found"}</h1><p>{he ? "ייתכן שהנתון הוסר או שייך לפרופיל מקומי אחר." : "It may have been removed or belong to another local actor."}</p><Link to="/missions">{he ? "חזרה למשימות" : "Back to missions"}</Link></div>;
  const team = [...teamPresets, ...missionState.teams].find((item) => item.id === mission.teamId);
  const current = mission.phases[mission.currentPhaseIndex];
  const terminal = ["completed", "cancelled", "blocked"].includes(mission.status);
  const act = () => {
    const action = mission.status === "awaiting-plan-approval" ? "approve-plan"
      : mission.status === "ready" ? "start"
        : mission.status === "paused" ? "continue"
          : mission.status === "needs-input" || mission.status === "needs-work" ? "retry"
            : "complete-phase";
    const result = missionState.applyAction(mission.id, action, action === "complete-phase" ? { deliverableSummary, evidenceIds: [], simulationAcknowledged, blocker } : undefined);
    if (result.ok && action === "complete-phase") { setDeliverableSummary(""); setSimulationAcknowledged(false); setBlocker(""); }
    setMessage(result.ok ? (he ? "המעבר תועד בהצלחה." : "Transition recorded successfully.") : result.reason === "missing-completion-proof" ? (he ? "נדרש תוצר, ראיה, אישור מפורש לסימולציה או חוסם מתועד." : "Add a deliverable, evidence, explicit simulation acknowledgement, or a documented blocker.") : result.reason === "resume-drift" ? (he ? "זוהה שינוי מאז ההשהיה. נדרש קלט לפני המשך." : "State drift was detected. Input is required before continuing.") : (he ? `הפעולה נחסמה: ${result.reason ?? "מעבר לא תקין"}` : `Action blocked: ${result.reason ?? "invalid transition"}`));
  };

  return <div className="page mission-workspace-page" data-testid="mission-workspace">
    <header className="page-heading mission-heading"><div><p className="eyebrow">{executionLabel(mission.executionLevel, language)} · {guidanceLabel(mission.guidanceMode, language)}</p><h1>{mission.title}</h1><p>{mission.interpretation.summary[language]}</p></div><span className={`mission-status mission-status-${mission.status}`}>{missionStatusLabel(mission.status, language)}</span></header>
    {message && <div role="status" className="mission-alert">{message}</div>}
    <label className="mission-mode-control">{he ? "מצב הדרכה למשימה" : "Mission guidance mode"}<select value={mission.guidanceMode} onChange={(event) => missionState.setGuidanceMode(mission.id, event.target.value as GuidanceMode)}>{(["teach", "guided", "expert", "audit-only"] as GuidanceMode[]).map((mode) => <option key={mode} value={mode}>{guidanceLabel(mode, language)}</option>)}</select></label>
    <nav className="mission-tabs" aria-label={he ? "תצוגות משימה" : "Mission views"}><Link to={`/missions/${mission.id}`} aria-current="page">{he ? "עבודה" : "Workspace"}</Link><Link to={`/missions/${mission.id}/team`}>{he ? "צוות" : "Team"}</Link><Link to={`/missions/${mission.id}/plan`}>{he ? "תכנית" : "Plan"}</Link><Link to={`/missions/${mission.id}/evidence`}>{he ? "ראיות" : "Evidence"}</Link></nav>
    <div className="mission-control-room">
      <aside className="mission-panel mission-plan-rail"><h2>{he ? "תכנית" : "Plan"}</h2><ol>{mission.phases.map((phase, index) => <li key={phase.id} aria-current={index === mission.currentPhaseIndex ? "step" : undefined} data-status={phase.status}><strong>{phase.title[language]}</strong><span>{phaseStatusLabel(phase.status, language)}</span></li>)}</ol></aside>
      <main className="mission-panel mission-active-phase">
        <p className="eyebrow">{he ? `שלב ${mission.currentPhaseIndex + 1} מתוך ${mission.phases.length}` : `Phase ${mission.currentPhaseIndex + 1} of ${mission.phases.length}`}</p>
        <h2>{current.title[language]}</h2>
        <dl><div><dt>{he ? "בעל תפקיד" : "Owner"}</dt><dd>{agentCatalog.find((agent) => agent.id === current.ownerAgentId)?.name[language] ?? current.ownerAgentId}</dd></div><div><dt>{he ? "סוקר עצמאי" : "Independent reviewer"}</dt><dd>{agentCatalog.find((agent) => agent.id === current.reviewerAgentId)?.name[language] ?? (he ? "אישור משתמש" : "User approval")}</dd></div><div><dt>{he ? "שער" : "Gate"}</dt><dd>{gateLabel(current.gate, language)}</dd></div></dl>
        <p>{phaseInputLabel(current.inputSummary, language)}</p>
        {mission.status === "running" && <fieldset className="mission-completion-proof"><legend>{he ? "הוכחת השלמת השלב" : "Phase completion proof"}</legend><label>{he ? "תוצר או סיכום עבודה" : "Deliverable or work summary"}<textarea value={deliverableSummary} maxLength={2000} onChange={(event) => setDeliverableSummary(event.target.value)} /></label><label><input type="checkbox" checked={simulationAcknowledged} onChange={(event) => setSimulationAcknowledged(event.target.checked)} />{he ? "אני מאשר/ת שזו סימולציה מקומית ולא ביצוע חי" : "I acknowledge this is a local simulation, not live execution"}</label><label>{he ? "חוסם מתועד (יחסום את המשימה במקום להשלים אותה)" : "Documented blocker (blocks instead of completing)"}<input value={blocker} maxLength={1000} onChange={(event) => setBlocker(event.target.value)} /></label></fieldset>}
        {!terminal && <div className="mission-actions"><button type="button" className="primary-button" onClick={act}>{actionLabel(mission.status, he)}</button>{mission.status === "running" && <><button type="button" onClick={() => { const result = missionState.applyAction(mission.id, "fail-phase"); setMessage(result.ok ? (he ? "כשל השער תועד; ניתן לתקן ולנסות שוב." : "Gate failure recorded; correct and retry.") : (he ? "תיעוד הכשל נכשל." : "Failure could not be recorded.")); }}>{he ? "סימון צורך בתיקון" : "Mark needs work"}</button><button type="button" onClick={() => { const result = missionState.applyAction(mission.id, "pause"); setMessage(result.ok ? (he ? "המשימה נשמרה בנקודת השלב המדויקת." : "Mission saved at the exact phase checkpoint.") : (he ? "ההשהיה נכשלה." : "Pause failed.")); }}>{he ? "השהיה" : "Pause"}</button></>}<button type="button" onClick={() => missionState.applyAction(mission.id, "cancel")}>{he ? "ביטול" : "Cancel"}</button></div>}
        {mission.blockedReason && <div role="alert" className="mission-alert">{blockedReasonLabel(mission.blockedReason, language)}</div>}
        <section className="context-pack-form"><h3>{he ? "חבילת הקשר" : "Context Pack"}</h3><p>{he ? "הערה מקומית מוגבלת; אינה נכנסת לניתוח שימוש." : "A bounded local note; it never enters analytics."}</p><label>{he ? "שם" : "Name"}<input value={packName} maxLength={120} onChange={(event) => setPackName(event.target.value)} /></label><label>{he ? "הערה" : "Note"}<textarea value={packNote} maxLength={2000} onChange={(event) => setPackNote(event.target.value)} /></label><button type="button" onClick={() => { const pack = missionState.createContextPack(mission.id, packName, packNote); if (pack) { setPackName(""); setPackNote(""); setMessage(he ? "חבילת ההקשר נשמרה וקושרה למשימה." : "Context Pack saved and linked to this mission."); } }}>{he ? "שמירת חבילה" : "Save pack"}</button></section>
        {mission.contextPackIds.length > 0 && <section aria-label={he ? "חבילות הקשר מקושרות" : "Linked Context Packs"}>{missionState.contextPacks.filter((pack) => mission.contextPackIds.includes(pack.id)).map((pack) => <article key={pack.id}><h3>{pack.name[language]}</h3><dl><div><dt>{he ? "רגישות" : "Sensitivity"}</dt><dd>{pack.sensitivity}</dd></div><div><dt>{he ? "טריות" : "Freshness"}</dt><dd>{pack.freshness}</dd></div><div><dt>{he ? "בעלים" : "Owner"}</dt><dd>{he ? "הפרופיל המקומי הנוכחי" : "Current local profile"}</dd></div><div><dt>{he ? "גודל" : "Size"}</dt><dd>{pack.sizeBytes} bytes</dd></div><div><dt>{he ? "סטטוס אימות" : "Validation"}</dt><dd>{pack.validationStatus}</dd></div></dl></article>)}</section>}
        {mission.learningSummary && <section className="mission-learning-summary"><h3>{he ? "מה למדת" : "What you learned"}</h3><p>{mission.learningSummary.summary[language]}</p><Link to={mission.learningSummary.nextPracticeRoute}>{he ? "תרגול מומלץ הבא" : "Recommended next practice"}</Link></section>}
        <div className="mission-secondary-actions">
          <button type="button" onClick={() => {
            const blob = new Blob([JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), mission }, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `${mission.id}.json`;
            anchor.click();
            URL.revokeObjectURL(url);
          }}>{he ? "ייצוא משימה" : "Export mission"}</button>
          <button type="button" onClick={() => {
            const project = projects.create({ name: mission.title, description: mission.interpretation.summary[language], category: "mission", status: "planning", tags: ["mission"], notes: `Mission: ${mission.id}` });
            navigate(`/projects/${project.id}`);
          }}>{he ? "המרה לפרויקט" : "Convert to Project"}</button>
        </div>
      </main>
      <aside className="mission-panel mission-evidence-rail"><h2>{he ? "צוות וראיות" : "Team and evidence"}</h2><button type="button" className="mission-team-toggle" aria-expanded={teamExpanded} onClick={() => setTeamExpanded((expanded) => !expanded)}>{teamExpanded ? (he ? "הסתרת הצוות" : "Hide team") : (he ? "הצגת הצוות" : "Show team")}</button><div className="mission-team-details" data-expanded={teamExpanded}><p><strong>{team?.name[language]}</strong></p><ul className="team-compact">{team?.memberAgentIds.map((id) => <li key={id}>{agentCatalog.find((agent) => agent.id === id)?.name[language] ?? id}</li>)}</ul></div><h3>{he ? "ראיות אחרונות" : "Recent evidence"}</h3><ul className="evidence-list">{mission.evidence.slice(-5).reverse().map((item) => <li key={item.id} data-result={item.result}><strong>{item.result}</strong><span><span className="sr-only">{evidenceKindLabel(item.kind, language)}: </span>{item.summary[language]}</span></li>)}</ul></aside>
    </div>
  </div>;
}
