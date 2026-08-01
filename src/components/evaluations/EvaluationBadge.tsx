import type { ReactNode } from "react";

export function EvaluationBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "positive" | "warning" | "danger";
}) {
  return <span className={`evaluation-badge evaluation-badge-${tone}`}>{children}</span>;
}
