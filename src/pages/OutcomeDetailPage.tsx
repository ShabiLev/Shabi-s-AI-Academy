import { Link, useParams } from "react-router-dom";
import { EvidenceStatus, LimitationsPanel, NextActions, RealityBadge, ResultActions, ResultSummary } from "../components/outcomes";
import { useLanguage } from "../i18n/LanguageContext";
import {
  outcomeNextActionToOutcomeAction,
  outcomeRealityToBadgeMode,
  outcomeToLimitations,
  outcomeVerificationToEvidenceState,
  toLocalizedOutcomeText,
  useOutcomes,
} from "../outcomes";

const text = {
  he: { notFoundTitle: "התוצאה לא נמצאה", notFoundBody: "ייתכן שהיא הוסרה או שייכת לפרופיל מקומי אחר.", back: "חזרה לתוצאות", openSource: "פתיחת המקור" },
  en: { notFoundTitle: "Outcome not found", notFoundBody: "It may have been removed or belong to another local actor.", back: "Back to outcomes", openSource: "Open source" },
};

export function OutcomeDetailPage() {
  const { outcomeId = "" } = useParams();
  const { language } = useLanguage();
  const { outcomes, evidence } = useOutcomes();
  const copy = text[language];
  const outcome = outcomes.find((item) => item.id === outcomeId);

  if (!outcome) {
    return (
      <div className="page">
        <h1>{copy.notFoundTitle}</h1>
        <p>{copy.notFoundBody}</p>
        <Link to="/outcomes">{copy.back}</Link>
      </div>
    );
  }

  const linkedEvidence = evidence
    .filter((item) => outcome.evidenceIds.includes(item.id))
    .map((item) => ({ id: item.id, label: toLocalizedOutcomeText(`${item.evidenceType}: ${item.summary}`) }));

  return (
    <div className="page">
      <ResultSummary
        language={language}
        title={toLocalizedOutcomeText(outcome.title)}
        summary={toLocalizedOutcomeText(outcome.summary)}
        location={toLocalizedOutcomeText(outcome.resultLocation)}
        focusOnMount
      >
        <RealityBadge language={language} mode={outcomeRealityToBadgeMode(outcome.realityMode)} />
      </ResultSummary>
      <EvidenceStatus
        language={language}
        state={outcomeVerificationToEvidenceState(outcome)}
        evidence={linkedEvidence}
        explanation={outcome.blockedReason ? toLocalizedOutcomeText(outcome.blockedReason) : undefined}
      />
      <LimitationsPanel language={language} limitations={outcomeToLimitations(outcome)} />
      <NextActions language={language} actions={outcome.nextActions.map(outcomeNextActionToOutcomeAction)} />
      <ResultActions
        language={language}
        actions={[
          { id: "open-source", label: toLocalizedOutcomeText(copy.openSource), href: outcome.resultLocation },
          { id: "back", label: toLocalizedOutcomeText(copy.back), href: "/outcomes" },
        ]}
      />
    </div>
  );
}
