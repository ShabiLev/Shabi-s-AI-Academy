import type { ComponentProps } from "react";
import type { TranslationKey } from "../../i18n/types";
import type { Icon } from "../common/Icon";

export interface NavigationItem {
  to: string;
  label: TranslationKey;
  icon: ComponentProps<typeof Icon>["name"];
  end?: boolean;
  visibility?: "all" | "advanced" | "developer";
}

export interface NavigationGroup {
  id: string;
  title: { he: string; en: string };
  items: NavigationItem[];
}

const beginner: NavigationItem[] = [
  { to: "/dashboard", label: "nav.dashboard", icon: "dashboard", end: true },
  { to: "/missions", label: "nav.missions", icon: "projects" },
  { to: "/evaluations", label: "nav.evaluations", icon: "qa" },
  { to: "/team", label: "nav.teams", icon: "agents" },
  { to: "/lessons", label: "nav.lessons", icon: "lessons" },
  { to: "/prompts", label: "nav.prompts", icon: "prompts" },
  { to: "/agents", label: "nav.agents", icon: "agents" },
  { to: "/projects", label: "nav.projects", icon: "projects" },
  { to: "/outcomes", label: "nav.outcomes", icon: "projects" },
  { to: "/radar", label: "nav.radar", icon: "radar" },
  { to: "/history", label: "nav.history", icon: "clock" },
  { to: "/help", label: "nav.help", icon: "lessons" },
];

const advanced: NavigationItem[] = [
  { to: "/evaluation-suites", label: "nav.evaluationSuites", icon: "qa", visibility: "advanced" },
  { to: "/playground/prompts", label: "nav.playgrounds", icon: "prompts", visibility: "advanced" },
  { to: "/workflows", label: "nav.workflows", icon: "projects", visibility: "advanced" },
  { to: "/runs", label: "nav.runtime", icon: "clock", visibility: "advanced" },
  { to: "/qa", label: "nav.qa", icon: "qa", visibility: "advanced" },
  { to: "/aos", label: "nav.aos", icon: "aos", visibility: "advanced" },
  { to: "/knowledge", label: "nav.knowledge", icon: "lessons", visibility: "advanced" },
  { to: "/analytics", label: "nav.analytics", icon: "radar", visibility: "advanced" },
  { to: "/aos/capabilities", label: "nav.capabilityRegistry", icon: "aos", visibility: "advanced" },
  { to: "/aos/scheduler", label: "nav.scheduler", icon: "clock", visibility: "advanced" },
  { to: "/settings", label: "nav.settings", icon: "settings", visibility: "advanced" },
  { to: "/developer", label: "nav.developer", icon: "settings", visibility: "developer" },
];

export const navigationItems = [...beginner, ...advanced];
export const navigationGroups: NavigationGroup[] = [
  { id: "start", title: { he: "התחלה", en: "Start" }, items: beginner.slice(0, 6) },
  { id: "workspace", title: { he: "עבודה ועזרה", en: "Work and help" }, items: beginner.slice(6) },
  { id: "advanced-create", title: { he: "יצירה מתקדמת", en: "Advanced creation" }, items: advanced.slice(0, 4) },
  { id: "advanced-system", title: { he: "מערכת ואיכות", en: "System and quality" }, items: advanced.slice(4) },
];
