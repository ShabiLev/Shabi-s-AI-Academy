import type { PromptInput, Prompt } from "./types";
const labels = {
  he: {
    role: "תפקיד",
    task: "משימה",
    context: "הקשר",
    constraints: "מגבלות",
    outputFormat: "פורמט פלט",
    examples: "דוגמאות",
    notes: "הערות",
  },
  en: {
    role: "Role",
    task: "Task",
    context: "Context",
    constraints: "Constraints",
    outputFormat: "Output Format",
    examples: "Examples",
    notes: "Notes",
  },
};
export function buildPrompt(p: Partial<PromptInput>, ui: "he" | "en") {
  const keys = Object.keys(labels[ui]) as Array<keyof typeof labels.he>;
  return keys
    .filter((k) => p[k]?.toString().trim())
    .map((k) => `${labels[ui][k]}:\n${p[k]}`)
    .join("\n\n");
}
export function sanitizeFilename(title: string) {
  return (
    title
      .normalize("NFKC")
      .replace(/[<>:"/\\|?*]/g, "-")
      .split("")
      .filter((character) => character.charCodeAt(0) > 31)
      .join("")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "prompt"
  ).toLowerCase();
}
export function formatExport(
  p: Prompt,
  kind: "txt" | "md",
  score: number,
  ui: "he" | "en",
) {
  const attribution = p.importedFromCatalog
    ? `\nSource: ${p.sourceName}\nSource repository: ${p.sourceRepository}\nSource license: ${p.sourceLicense}\nImported: ${p.sourceImportedAt}\nSource content hash: ${p.sourceContentHash}\nNote: this local copy may have been edited since import.`
    : "";
  const meta = `${p.title}\n${p.description}\nCategory: ${p.category}\nLanguage: ${p.language}\nTags: ${p.tags.join(", ")}\nVersion: ${p.version}\nQuality: ${score}/100\nCreated: ${p.createdAt}\nUpdated: ${p.updatedAt}${attribution}`;
  return kind === "md"
    ? `# ${p.title}\n\n${meta.split("\n").slice(1).join("\n\n")}\n\n## Prompt\n\n${buildPrompt(p, ui)}\n`
    : `${meta}\n\n${buildPrompt(p, ui)}\n`;
}
