import type { ProductArea } from "../guidance/types";

export type HelpAreaFilter = "all" | "learn" | "build" | "workspace" | "more";
export type HelpLevelFilter = "all" | "beginner" | "advanced";

export const helpAreaLabels = {
  all: { he: "הכול", en: "All" },
  learn: { he: "למידה", en: "Learn" },
  build: { he: "בנייה", en: "Build" },
  workspace: { he: "סביבת עבודה", en: "Workspace" },
  more: { he: "נוספים", en: "More" },
} as const satisfies Record<HelpAreaFilter, { he: string; en: string }>;

export const helpLevelLabels = {
  all: { he: "הכול", en: "All" },
  beginner: { he: "מתחילים", en: "Beginner" },
  advanced: { he: "מתקדמים", en: "Advanced" },
} as const satisfies Record<HelpLevelFilter, { he: string; en: string }>;

export function helpAreaForProductArea(area: ProductArea): Exclude<HelpAreaFilter, "all"> {
  if (area === "home" || area === "learn") return "learn";
  if (area === "build") return "build";
  if (area === "workspace") return "workspace";
  return "more";
}
