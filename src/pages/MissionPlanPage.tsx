import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { gateLabel, phaseInputLabel, phaseStatusLabel, useMissions } from "../missions";

export function MissionPlanPage() {
  const { language } = useLanguage();
  const { missionId } = useParams();
  const missionState = useMissions();
  const currentMission = missionState.missions.find((mission) => mission.id === missionId) ?? missionState.currentMission;
  const he = language === "he";
  if (!currentMission) return <div className="page mission-empty"><h1>{he ? "אין תכנית פעילה" : "No active plan"}</h1><Link to="/missions/new">{he ? "יצירת משימה" : "Create mission"}</Link></div>;
  return <div className="page mission-projection-page"><header className="page-heading"><div><h1>{he ? "תכנית המשימה" : "Mission Plan"}</h1><p>{currentMission.title}</p></div><Link to={`/missions/${currentMission.id}`}>{he ? "חזרה לסביבת העבודה" : "Back to workspace"}</Link></header><ol className="mission-plan-detail">{currentMission.phases.map((phase, index) => <li key={phase.id} data-status={phase.status}><span>{index + 1}</span><div><h2>{phase.title[language]}</h2><p>{phaseInputLabel(phase.inputSummary, language)}</p><dl><div><dt>{he ? "שער" : "Gate"}</dt><dd>{gateLabel(phase.gate, language)}</dd></div><div><dt>{he ? "מצב" : "Status"}</dt><dd>{phaseStatusLabel(phase.status, language)}</dd></div></dl></div></li>)}</ol></div>;
}
