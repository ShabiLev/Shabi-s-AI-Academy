import { describe, expect, it, vi } from "vitest";
import { createCommandRegistry, executeCommand, parseCommandHistory, searchCommands } from ".";
describe("workspace commands", () => {
  const commands = createCommandRegistry({ route: "/prompts/abc", currentEntity: "prompt", backupAvailable: false });
  it("registers navigation, creation, actions, aliases, and contextual commands", () => { expect(commands.find((item) => item.id === "nav.dashboard")?.enabled).toBe(true); expect(searchCommands(commands, "find", "en")[0].id).toBe("action.search"); expect(commands.find((item) => item.id === "context.favorite")?.enabled).toBe(true); });
  it("explains disabled commands", () => { const command = commands.find((item) => item.id === "action.export")!; expect(command.enabled).toBe(false); expect(command.disabledReason?.en).toContain("backup"); });
  it("executes typed actions and rejects disabled state", async () => { const navigate = vi.fn(); const base = { navigate, language: "en" as const, setLanguage: vi.fn(), toggleMotion: vi.fn(), clearRecents: vi.fn(), showShortcuts: vi.fn(), copyRoute: vi.fn(), favoriteCurrent: vi.fn(() => true), exportWorkspace: vi.fn(() => false) }; expect((await executeCommand(commands[0], base)).ok).toBe(true); expect(navigate).toHaveBeenCalled(); expect((await executeCommand(commands.find((item) => item.id === "action.export")!, base)).ok).toBe(false); });
  it("bounds and validates local history", () => { expect(parseCommandHistory({ commandIds: [1, "ok", "ok"] }).commandIds).toEqual(["ok"]); expect(parseCommandHistory({ commandIds: Array.from({ length: 40 }, (_, index) => String(index)) }).commandIds).toHaveLength(30); });
});
