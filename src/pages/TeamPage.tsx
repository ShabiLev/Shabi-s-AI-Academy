import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  agentCatalog,
  communitySource,
  permissionLabel,
  skillLevelLabel,
  skillCatalog,
  teamPresets,
  useMissions,
} from "../missions";
import { useLanguage } from "../i18n/LanguageContext";

export function TeamPage() {
  const { language } = useLanguage();
  const missions = useMissions();
  const { missionId } = useParams();
  const scopedMission = missions.missions.find(
    (mission) => mission.id === missionId,
  );
  const scopedTeam = scopedMission
    ? [...teamPresets, ...missions.teams].find(
        (team) => team.id === scopedMission.teamId,
      )
    : undefined;
  const [specialistId, setSpecialistId] = useState("");
  const [replacementId, setReplacementId] = useState("");
  const [message, setMessage] = useState("");
  const he = language === "he";
  const skillProgress = missions.skillProgress;
  const page = (
    <div className="page team-page" data-testid="team-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">
            {he
              ? "תפקידים שקופים והרשאות מוגבלות"
              : "Transparent roles and bounded permissions"}
          </p>
          <h1>{he ? "צוותי סוכנים" : "Agent Teams"}</h1>
          <p>
            {he
              ? "תבניות מערכת הן לקריאה בלבד. העתקה יוצרת צוות מקומי שניתן לערוך."
              : "System presets are read-only. Copying creates an editable local team."}
          </p>
        </div>
        <Link className="button primary-button" to="/missions/new">
          {he ? "בניית משימה" : "Build mission"}
        </Link>
      </header>
      <section>
        <h2>{he ? "תבניות צוות" : "Team presets"}</h2>
        <div className="mission-card-grid">
          {teamPresets.map((team) => (
            <article className="mission-card" key={team.id}>
              <span className="mission-status">
                {he ? "מערכת · בלתי ניתן לשינוי" : "System · immutable"}
              </span>
              <h3>{team.name[language]}</h3>
              <p>{team.description[language]}</p>
              <ul>
                {team.memberAgentIds.map((id) => (
                  <li key={id}>
                    {agentCatalog.find((agent) => agent.id === id)?.name[
                      language
                    ] ?? id}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => missions.copyPreset(team.id)}
              >
                {he ? "העתקה לצוותים שלי" : "Copy to My Teams"}
              </button>
            </article>
          ))}
        </div>
      </section>
      {missions.teams.length > 0 && (
        <section>
          <h2>{he ? "הצוותים שלי" : "My Teams"}</h2>
          <div className="mission-card-grid">
            {missions.teams.map((team) => (
              <article className="mission-card" key={team.id}>
                <h3>{team.name[language]}</h3>
                <p>{team.description[language]}</p>
                <span>
                  {he ? "עותק מקומי וניתן לעריכה" : "Local editable copy"}
                </span>
              </article>
            ))}
          </div>
        </section>
      )}
      <section>
        <h2>{he ? "קטלוג מומחים מיוחס" : "Attributed specialist catalog"}</h2>
        <p>
          {he
            ? "הקטלוג הותאם ידנית כנתונים בלבד; אין ייבוא רשת או הרצת הוראות מקור."
            : "The catalog was manually adapted as inert data; there is no network import or source instruction execution."}
        </p>
        <div className="agent-catalog-grid">
          {agentCatalog.map((agent) => (
            <article className="agent-catalog-card" key={agent.id}>
              <h3>{agent.name[language]}</h3>
              <p>{agent.purpose[language]}</p>
              <p>
                <strong>{he ? "הרשאות" : "Permissions"}:</strong>{" "}
                {agent.permissions
                  .map((permission) => permissionLabel(permission, language))
                  .join(", ")}
              </p>
              {agent.sourceDetails?.path && (
                <details>
                  <summary>
                    {he ? "ייחוס והתאמה" : "Attribution and adaptation"}
                  </summary>
                  <code>{agent.sourceDetails.path}</code>
                  <p>
                    {agent.sourceDetails.license} ·{" "}
                    {agent.sourceDetails.revision?.slice(0, 12)}
                  </p>
                </details>
              )}
            </article>
          ))}
        </div>
        <p className="community-attribution">
          <a
            href={`${communitySource.repository}/tree/${communitySource.revision}`}
            target="_blank"
            rel="noreferrer"
          >
            agency-agents
          </a>{" "}
          · {communitySource.license} · {communitySource.copyright}
        </p>
      </section>
      <section className="skill-map">
        <h2>{he ? "מפת מיומנויות" : "Skill Map"}</h2>
        <p>
          {he
            ? "צפייה בדף אינה מעלה רמה. רק השלמה או ראיית Evaluation מאומתת נחשבות; ראיית Evaluation ניתנת להסרה."
            : "A page view never raises a level. Only completion or validated Evaluation evidence counts; Evaluation evidence is removable."}
        </p>
        <div className="skill-grid">
          {skillCatalog.map((skill) => {
            const progress = skillProgress.find(
              (item) => item.skillId === skill.id,
            )!;
            return (
              <article key={skill.id}>
                <h3>{skill.name[language]}</h3>
                <span>{skillLevelLabel(progress.level, language)}</span>
                {progress.evidence.filter((item) => item.source === "evaluation").map((evidence) => (
                  <div className="skill-evidence-row" key={evidence.id}>
                    <small>{he ? "ראיית Evaluation" : "Evaluation evidence"} · {evidence.outcome} · {evidence.confidence}</small>
                    <button type="button" onClick={() => missions.removeSkillEvidence(evidence.id)}>
                      {he ? "הסרת ראיה" : "Remove evidence"}
                    </button>
                  </div>
                ))}
                <Link to={skill.lessonRoute}>
                  {he ? "שלב למידה הבא" : "Next learning step"}
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
  const controls = scopedMission && scopedTeam && (
    <section className="mission-panel" aria-labelledby="mission-team-controls">
      <h2 id="mission-team-controls">
        {he ? "בקרות צוות המשימה" : "Mission team controls"}
      </h2>
      <p>
        {he
          ? "שינוי צוות נשמר מקומית ומתועד; סוקר השלב אינו יכול להחליף את בעל התפקיד."
          : "Team changes are stored locally and recorded; a phase reviewer cannot replace its owner."}
      </p>
      {message && <div role="status">{message}</div>}
      <label>
        {he ? "הוספת מומחה" : "Add specialist"}
        <select
          value={specialistId}
          onChange={(event) => setSpecialistId(event.target.value)}
        >
          <option value="">{he ? "בחירה" : "Select"}</option>
          {agentCatalog
            .filter((agent) => !scopedTeam.memberAgentIds.includes(agent.id))
            .map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name[language]}
              </option>
            ))}
        </select>
      </label>
      <button
        type="button"
        disabled={!specialistId}
        onClick={() => {
          const ok = missions.addSpecialist(scopedMission.id, specialistId);
          setMessage(
            ok
              ? he
                ? "המומחה נוסף לצוות מקומי."
                : "Specialist added to a local team."
              : he
                ? "לא ניתן להוסיף את המומחה."
                : "The specialist could not be added.",
          );
        }}
      >
        {he ? "הוספה" : "Add"}
      </button>
      {scopedMission.phases[scopedMission.currentPhaseIndex] && (
        <>
          <label>
            {he ? "החלפת בעל התפקיד בשלב הפעיל" : "Replace active phase owner"}
            <select
              value={replacementId}
              onChange={(event) => setReplacementId(event.target.value)}
            >
              <option value="">{he ? "בחירה" : "Select"}</option>
              {agentCatalog
                .filter(
                  (agent) =>
                    scopedTeam.memberAgentIds.includes(agent.id) &&
                    agent.permissions.includes(
                      scopedMission.phases[scopedMission.currentPhaseIndex]
                        .requiredPermission,
                    ) &&
                    agent.id !==
                      scopedMission.phases[scopedMission.currentPhaseIndex]
                        .reviewerAgentId,
                )
                .map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name[language]}
                  </option>
                ))}
            </select>
          </label>
          <button
            type="button"
            disabled={!replacementId}
            onClick={() => {
              const ok = missions.replaceAgent(
                scopedMission.id,
                scopedMission.phases[scopedMission.currentPhaseIndex].id,
                replacementId,
              );
              setMessage(
                ok
                  ? he
                    ? "בעל התפקיד הוחלף."
                    : "Phase owner replaced."
                  : he
                    ? "ההחלפה נחסמה."
                    : "Replacement was blocked.",
              );
            }}
          >
            {he ? "החלפה" : "Replace"}
          </button>
        </>
      )}
    </section>
  );
  return <>{page}{controls}</>;
}
