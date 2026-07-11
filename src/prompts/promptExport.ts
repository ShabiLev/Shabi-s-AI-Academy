import { evaluatePrompt } from "./promptQuality";
import { formatExport, sanitizeFilename } from "./promptTemplate";
import type { Prompt } from "./types";
export function downloadPrompt(p: Prompt, kind: "txt" | "md", ui: "he" | "en") {
  const content = formatExport(p, kind, evaluatePrompt(p).score, ui),
    blob = new Blob(["\ufeff", content], { type: "text/plain;charset=utf-8" }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFilename(p.title)}-v${p.version}.${kind}`;
  a.click();
  URL.revokeObjectURL(url);
}
