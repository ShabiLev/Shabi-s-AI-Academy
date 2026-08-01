import type { LocalizedText, SafeTraceMetadata, TraceEvent } from "./types";
import { validateTrace } from "./validation";

const SENSITIVE = /(?:bearer\s+|api[-_ ]?key|secret|password|token|authorization|credential|-----BEGIN)/i;
const PATH = /(?:[a-z]:[\\/][^\s]+|\/(?:users|home|private|var)\/[^\s]+)/gi;

export function safeTraceSummary(value: LocalizedText): LocalizedText {
  const clean = (text: string) => {
    if (SENSITIVE.test(text)) return "[redacted sensitive summary]";
    return text.replace(PATH, "[redacted local path]").slice(0, 1_000);
  };
  return { he: clean(value.he), en: clean(value.en) };
}

export function createTraceEvent(input: Omit<TraceEvent, "schemaVersion" | "summary" | "metadata"> & { summary: LocalizedText; metadata?: SafeTraceMetadata }): TraceEvent {
  const event: TraceEvent = { ...input, schemaVersion: 1, summary: safeTraceSummary(input.summary), metadata: input.metadata ?? {} };
  if (!validateTrace(event)) throw new Error("Invalid trace event.");
  return event;
}

export function exportTraceJson(events: readonly TraceEvent[]): string {
  if (!events.every(validateTrace)) throw new Error("Unsafe trace cannot be exported.");
  return JSON.stringify({ schemaVersion: 1, kind: "academy-evaluation-trace", events }, null, 2);
}

export function exportTraceMarkdown(events: readonly TraceEvent[], language: "he" | "en" = "en"): string {
  if (!events.every(validateTrace)) throw new Error("Unsafe trace cannot be exported.");
  const markdownEscape = (value: string) => value.replace(/([\\`*_[\]<>#])/g, "\\$1");
  return ["# Evaluation trace", "", ...events.map((event) =>
    `- ${event.sequence}. ${event.timestamp} — **${event.eventType}** — ${markdownEscape(event.summary[language].replace(/[\r\n]+/g, " "))}`)].join("\n");
}

const htmlEscape = (value: string) => value.replace(/[&<>"']/g, (match) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[match]!);

export function exportTraceHtml(events: readonly TraceEvent[], language: "he" | "en" = "en"): string {
  if (!events.every(validateTrace)) throw new Error("Unsafe trace cannot be exported.");
  return `<!doctype html><html lang="${language}" dir="${language === "he" ? "rtl" : "ltr"}"><head><meta charset="utf-8"><title>Evaluation trace</title></head><body><main><h1>Evaluation trace</h1><ol>${events.map((event) =>
    `<li><time>${htmlEscape(event.timestamp)}</time> <strong>${htmlEscape(event.eventType)}</strong> ${htmlEscape(event.summary[language])}</li>`).join("")}</ol></main></body></html>`;
}
