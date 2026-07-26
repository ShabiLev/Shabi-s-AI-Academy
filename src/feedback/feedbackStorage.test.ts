import { describe, expect, it } from "vitest";
import { FEEDBACK_MAX_ITEMS, parseLocalFeedback } from "./feedbackStorage";

describe("local privacy-preserving feedback", () => {
  it("bounds messages, rejects private-shaped fields and caps retention", () => {
    const base = { id: "feedback-1", category: "general", message: "Useful feature", createdAt: "2026-07-26T12:00:00Z", status: "local-only" };
    expect(parseLocalFeedback([base])).toHaveLength(1);
    expect(parseLocalFeedback([{ ...base, promptContent: "private" }])).toEqual([]);
    expect(parseLocalFeedback(Array.from({ length: 150 }, (_, index) => ({ ...base, id: `feedback-${index}` })))).toHaveLength(FEEDBACK_MAX_ITEMS);
  });
});
