import type { OutcomeLanguage } from "./types";

export type RealityMode = "live" | "local" | "simulated" | "blueprint" | "manual" | "notConnected";

const labels: Record<RealityMode, Record<OutcomeLanguage, string>> = {
  live: { he: "פעיל", en: "Live" },
  local: { he: "מקומי", en: "Local" },
  simulated: { he: "הדמיה", en: "Simulated" },
  blueprint: { he: "תכנית בלבד", en: "Blueprint only" },
  manual: { he: "נדרשת פעולה ידנית", en: "Manual action required" },
  notConnected: { he: "לא מחובר", en: "Not connected" },
};

export function RealityBadge({ mode, language }: { mode: RealityMode; language: OutcomeLanguage }) {
  return (
    <span className={`outcome-reality-badge outcome-reality-${mode}`} data-reality={mode}>
      <span className="outcome-reality-marker" aria-hidden="true" />
      {labels[mode][language]}
    </span>
  );
}
