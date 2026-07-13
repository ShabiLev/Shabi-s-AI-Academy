import { normalizeSearchText } from "../search";
import type { WorkspaceCommand } from "./types";
export function searchCommands(commands: readonly WorkspaceCommand[], query: string, language: "he" | "en", history: readonly string[] = []): WorkspaceCommand[] {
  const normalized = normalizeSearchText(query);
  return commands.map((command) => { const text = normalizeSearchText(`${command.title[language]} ${command.description[language]} ${command.aliases.join(" ")}`); const match = !normalized ? 1 : text === normalized ? 20 : text.includes(normalized) ? 10 : normalized.split(" ").filter((part) => text.includes(part)).length; return { command, score: match + Math.max(0, 5 - history.indexOf(command.id)) * Number(history.includes(command.id)) }; })
    .filter(({ score }) => score > 0).sort((a, b) => b.score - a.score || a.command.id.localeCompare(b.command.id)).map(({ command }) => command);
}

