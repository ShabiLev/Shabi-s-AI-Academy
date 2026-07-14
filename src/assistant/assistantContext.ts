import type { Language } from "../i18n/types";
import { resolvePageMetadata } from "../guidance";
export function explainRoute(route: string): Record<Language, string> {
  const page = resolvePageMetadata(route);
  return { he: `${page.title.he}: ${page.purpose.he} הפעולה הבאה: ${page.primaryTask.he}`, en: `${page.title.en}: ${page.purpose.en} Next: ${page.primaryTask.en}` };
}

