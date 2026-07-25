import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { useLanguage } from "../i18n/LanguageContext";

export type GuidanceHintId = "dashboard" | "sidebar" | "prompts" | "agents" | "completion";
const requiredHints: GuidanceHintId[] = ["dashboard", "sidebar", "prompts", "agents"];
const keyFor = (userId: string) => `shabis-ai-academy:guidance-hints:v1:${userId}`;

function loadDismissed(key: string): GuidanceHintId[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is GuidanceHintId => requiredHints.includes(id as GuidanceHintId)) : [];
  } catch { return []; }
}

export function GuidanceHint({ id, he, en }: { id: Exclude<GuidanceHintId, "completion">; he: string; en: string }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const storageKey = keyFor(user?.id ?? "anonymous");
  const [dismissed, setDismissed] = useState(() => loadDismissed(storageKey));
  const [completed, setCompleted] = useState(false);
  if (dismissed.includes(id)) return completed ? <p className="guidance-complete" role="status">{language === "he" ? "ההיכרות הקצרה הושלמה. העזרה תמיד זמינה." : "Quick orientation complete. Help is always available."}</p> : null;
  const dismiss = () => {
    const next = [...new Set([...dismissed, id])];
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Hints remain dismissible for this session. */ }
    setDismissed(next);
    setCompleted(requiredHints.every((hint) => next.includes(hint)));
  };
  return <aside className="guidance-hint" aria-label={language === "he" ? "רמז מסך" : "Page hint"}>
    <p>{language === "he" ? he : en}</p>
    <div><Link to="/help">{language === "he" ? "צריך עזרה?" : "Need help?"}</Link><button type="button" className="text-button" onClick={dismiss}>{language === "he" ? "הבנתי" : "Got it"}</button></div>
  </aside>;
}
