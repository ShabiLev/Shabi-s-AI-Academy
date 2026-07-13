import type { TranslationKey } from "../../i18n/types";
import type { ComponentProps } from "react";
import type { Icon } from "../common/Icon";
export interface NavigationItem {
  to: string;
  label: TranslationKey;
  icon: ComponentProps<typeof Icon>["name"];
  end?: boolean;
}
export const navigationItems: NavigationItem[] = [
  { to: "/", label: "nav.dashboard", icon: "dashboard", end: true },
  { to: "/search", label: "nav.search", icon: "prompts" },
  { to: "/assistant", label: "nav.assistant", icon: "agents" },
  { to: "/workflows", label: "nav.workflows", icon: "projects" },
  { to: "/analytics", label: "nav.analytics", icon: "radar" },
  { to: "/lessons", label: "nav.lessons", icon: "lessons" },
  { to: "/prompts", label: "nav.prompts", icon: "prompts" },
  { to: "/agents", label: "nav.agents", icon: "agents" },
  { to: "/playground/prompts", label: "nav.promptPlayground", icon: "prompts" },
  { to: "/playground/agents", label: "nav.agentPlayground", icon: "agents" },
  { to: "/runs", label: "nav.runs", icon: "clock" },
  { to: "/projects", label: "nav.projects", icon: "projects" },
  { to: "/knowledge", label: "nav.knowledge", icon: "lessons" },
  { to: "/journey", label: "nav.journey", icon: "radar" },
  { to: "/roadmap", label: "nav.roadmap", icon: "radar" },
  { to: "/radar", label: "nav.radar", icon: "radar" },
  { to: "/how-to", label: "nav.howTo", icon: "lessons" },
  { to: "/settings", label: "nav.settings", icon: "settings" },
  { to: "/qa", label: "nav.qa", icon: "qa" },
  { to: "/docs", label: "nav.documentation", icon: "lessons" },
  { to: "/release", label: "nav.release", icon: "qa" },
  { to: "/developer", label: "nav.developer", icon: "settings" },
];
export const navigationGroups = [
  { id: "learn", items: navigationItems.filter((item) => ["/", "/lessons", "/journey"].includes(item.to)) },
  { id: "build", items: navigationItems.filter((item) => ["/prompts", "/agents", "/playground/prompts", "/playground/agents", "/workflows"].includes(item.to)) },
  { id: "workspace", items: navigationItems.filter((item) => ["/search", "/assistant", "/projects", "/knowledge", "/runs", "/analytics"].includes(item.to)) },
  { id: "system", items: navigationItems.filter((item) => ["/qa", "/docs", "/how-to", "/settings", "/developer", "/release", "/roadmap", "/radar"].includes(item.to)) },
] as const;
