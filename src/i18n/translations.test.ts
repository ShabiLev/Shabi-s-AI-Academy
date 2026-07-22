import { describe, expect, it } from "vitest";
import { translations } from "./translations";

describe("translation completeness", () => {
  it("keeps Hebrew and English keys identical and values non-empty", () => {
    const hebrewKeys = Object.keys(translations.he).sort();
    const englishKeys = Object.keys(translations.en).sort();

    expect(hebrewKeys).toEqual(englishKeys);
    for (const key of hebrewKeys) {
      expect(translations.he[key as keyof typeof translations.he].trim(), `${key} is empty in Hebrew`).not.toBe("");
      expect(translations.en[key as keyof typeof translations.en].trim(), `${key} is empty in English`).not.toBe("");
    }
  });
});
