import { evaluateAgent } from "./agentQuality";
import type { Agent, AgentFilters } from "./types";
export function filterAgents(items: Agent[], f: AgentFilters) {
  const q = f.search.trim().toLowerCase();
  return items
    .filter(
      (a) =>
        (!q ||
          [a.name, a.description, a.tags.join(" "), a.goal].some((x) =>
            x.toLowerCase().includes(q),
          )) &&
        (f.category === "all" || a.category === f.category) &&
        (f.status === "all" || a.status === f.status) &&
        (!f.favoritesOnly || a.isFavorite),
    )
    .sort((a, b) =>
      f.sort === "name"
        ? a.name.localeCompare(b.name)
        : f.sort === "created"
          ? b.createdAt.localeCompare(a.createdAt)
          : f.sort === "version"
            ? b.version - a.version
            : f.sort === "quality"
              ? evaluateAgent(b).score - evaluateAgent(a).score
              : b.updatedAt.localeCompare(a.updatedAt),
    );
}
export function sanitizeAgentFilename(name: string) {
  return (
    name
      .replace(/[<>:"/\\|?*]/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "agent"
  ).slice(0, 80);
}
