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

export const navigationItems: NavigationItem[] = [
  { to: "/", label: "nav.dashboard", icon: "dashboard", end: true },
  { to: "/journey", label: "nav.journey", icon: "radar" },
  { to: "/lessons", label: "nav.lessons", icon: "lessons" },
  { to: "/radar", label: "nav.radar", icon: "radar" },
  { to: "/prompts", label: "nav.prompts", icon: "prompts" },
  { to: "/agents", label: "nav.agents", icon: "agents" },
  { to: "/playground/prompts", label: "nav.promptPlayground", icon: "prompts" },
  { to: "/playground/agents", label: "nav.agentPlayground", icon: "agents" },
  { to: "/workflows", label: "nav.workflows", icon: "projects" },
  { to: "/projects", label: "nav.projects", icon: "projects" },
  { to: "/knowledge", label: "nav.knowledge", icon: "lessons" },
  { to: "/runs", label: "nav.runs", icon: "clock" },
  { to: "/assistant", label: "nav.assistant", icon: "agents" },
  { to: "/search", label: "nav.search", icon: "prompts" },
  { to: "/analytics", label: "nav.analytics", icon: "radar", visibility: "advanced" },
  { to: "/how-to", label: "nav.howTo", icon: "lessons" },
  { to: "/docs", label: "nav.documentation", icon: "lessons", visibility: "advanced" },
  { to: "/qa", label: "nav.qa", icon: "qa", visibility: "advanced" },
  { to: "/release", label: "nav.release", icon: "qa", visibility: "advanced" },
  { to: "/settings", label: "nav.settings", icon: "settings" },
  { to: "/developer", label: "nav.developer", icon: "settings", visibility: "developer" },
  { to: "/roadmap", label: "nav.roadmap", icon: "radar", visibility: "advanced" },
];

export const navigationGroups = [
  { id: "home", items: navigationItems.filter((item) => item.to === "/") },
  { id: "learn", items: navigationItems.filter((item) => ["/journey", "/lessons", "/radar"].includes(item.to)) },
  { id: "build", items: navigationItems.filter((item) => ["/prompts", "/agents", "/playground/prompts", "/playground/agents", "/workflows"].includes(item.to)) },
  { id: "workspace", items: navigationItems.filter((item) => ["/projects", "/knowledge", "/runs"].includes(item.to)) },
  { id: "more", items: navigationItems.filter((item) => ["/assistant", "/search", "/analytics", "/how-to", "/docs", "/qa", "/release", "/settings", "/developer", "/roadmap"].includes(item.to)) },
] as const;
