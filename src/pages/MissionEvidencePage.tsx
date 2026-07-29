import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { evidenceKindLabel, useMissions } from "../missions";

export function MissionEvidencePage() {
  const { language } = useLanguage();
  const { missionId } = useParams();
  const missionState = useMissions();
  const currentMission = missionState.missions.find((mission) => mission.id === missionId) ?? missionState.currentMission;
  const he = language === "he";
  if (!currentMission) return <div className="page mission-empty"><h1>{he ? "אין ראיות פעילות" : "No active evidence"}</h1><Link to="/missions/new">{he ? "יצירת משימה" : "Create mission"}</Link></div>;
  const passed = currentMission.evidence.filter((item) => item.result === "PASS").length;
  const failed = currentMission.evidence.filter((item) => item.result === "FAIL").length;
  return <div className="page mission-projection-page"><header className="page-heading"><div><h1>{he ? "ראיות המשימה" : "Mission Evidence"}</h1><p>{he ? `${passed} שערים עברו · ${failed} נכשלו` : `${passed} gates passed · ${failed} failed`}</p></div><Link to={`/missions/${currentMission.id}`}>{he ? "חזרה לסביבת העבודה" : "Back to workspace"}</Link></header><div className="evidence-timeline">{currentMission.evidence.map((item) => <article key={item.id} data-result={item.result}><strong>{item.result}</strong><div><h2>{evidenceKindLabel(item.kind, language)}</h2><p>{item.summary[language]}</p><time dateTime={item.recordedAt}>{new Date(item.recordedAt).toLocaleString(language === "he" ? "he-IL" : "en-US")}</time></div></article>)}</div></div>;
}
