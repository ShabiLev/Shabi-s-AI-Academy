import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { createWorkspaceBackup, serializeWorkspaceBackup } from "../backup";

const sourceRoot = join(process.cwd(), "src");
const extensions = new Set([".ts", ".tsx", ".js", ".jsx"]);

function sourceText(directory = sourceRoot): string {
  return readdirSync(directory, { withFileTypes: true }).map((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceText(path);
    return extensions.has(extname(entry.name)) ? readFileSync(path, "utf8") : "";
  }).join("\n");
}

describe("authentication security boundaries", () => {
  it("contains no privileged server credential names or embedded JWT secrets", () => {
    const source = sourceText();
    const privilegedName = ["SUPABASE", "SERVICE", "ROLE", "KEY"].join("_");
    expect(source).not.toContain(privilegedName);
    expect(source).not.toMatch(/eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{10,}/);
  });

  it("never writes password values to browser storage", () => {
    const source = sourceText();
    expect(source).not.toMatch(/(?:localStorage|sessionStorage)\.setItem\([^\n]{0,100}password/i);
  });

  it("workspace exports exclude auth sessions and credentials", () => {
    const backup = serializeWorkspaceBackup(createWorkspaceBackup());
    expect(backup).not.toMatch(/access_token|refresh_token|password/i);
    expect(backup).not.toContain("shabis-ai-academy-guest-session");
  });
});
