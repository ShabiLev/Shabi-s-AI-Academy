export const FEEDBACK_STORAGE_KEY = "shabis-ai-academy:feedback:v1";
export const FEEDBACK_MAX_ITEMS = 100;

export type FeedbackCategory = "incorrect-summary" | "missing-topic" | "source-concern" | "feature-request" | "general";
export interface LocalFeedback {
  readonly id: string;
  readonly category: FeedbackCategory;
  readonly message: string;
  readonly itemId?: string;
  readonly createdAt: string;
  readonly status: "local-only";
}

const categories: readonly FeedbackCategory[] = ["incorrect-summary", "missing-topic", "source-concern", "feature-request", "general"];
export function parseLocalFeedback(value: unknown): LocalFeedback[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is LocalFeedback => {
    if (!item || typeof item !== "object") return false;
    const record = item as Record<string, unknown>;
    return typeof record.id === "string" && record.id.length <= 120
      && categories.includes(record.category as FeedbackCategory)
      && typeof record.message === "string" && record.message.trim().length > 0 && record.message.length <= 500
      && (record.itemId === undefined || (typeof record.itemId === "string" && record.itemId.length <= 120))
      && typeof record.createdAt === "string" && Number.isFinite(Date.parse(record.createdAt))
      && record.status === "local-only"
      && !Object.keys(record).some((key) => /prompt|document|email|token|secret|identity/i.test(key));
  }).slice(-FEEDBACK_MAX_ITEMS);
}
export function loadLocalFeedback(storage: Pick<Storage, "getItem"> = localStorage): LocalFeedback[] {
  try {
    return parseLocalFeedback(JSON.parse(storage.getItem(FEEDBACK_STORAGE_KEY) ?? "[]"));
  } catch {
    return [];
  }
}
export function saveLocalFeedback(
  input: Pick<LocalFeedback, "category" | "message" | "itemId">,
  storage: Pick<Storage, "getItem" | "setItem"> = localStorage,
): LocalFeedback | undefined {
  const candidate: LocalFeedback = {
    id: crypto.randomUUID(),
    category: input.category,
    message: input.message.trim().slice(0, 500),
    itemId: input.itemId?.slice(0, 120),
    createdAt: new Date().toISOString(),
    status: "local-only",
  };
  if (!parseLocalFeedback([candidate]).length) return undefined;
  try {
    storage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify([...loadLocalFeedback(storage), candidate].slice(-FEEDBACK_MAX_ITEMS)));
    return candidate;
  } catch {
    return undefined;
  }
}
export function clearLocalFeedback(storage: Pick<Storage, "removeItem"> = localStorage): void {
  try {
    storage.removeItem(FEEDBACK_STORAGE_KEY);
  } catch {
    // An in-memory caller may still clear its state.
  }
}
