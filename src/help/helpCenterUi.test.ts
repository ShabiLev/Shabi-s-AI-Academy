import { describe, expect, it } from "vitest";
import { helpAreaForProductArea, helpAreaLabels, helpLevelLabels } from "./helpCenterUi";

describe("Help Center localization", () => {
  it("maps every product area to a localized Help filter area", () => {
    expect(helpAreaForProductArea("home")).toBe("learn");
    expect(helpAreaForProductArea("learn")).toBe("learn");
    expect(helpAreaForProductArea("build")).toBe("build");
    expect(helpAreaForProductArea("workspace")).toBe("workspace");
    expect(helpAreaForProductArea("more")).toBe("more");
    expect(helpAreaForProductArea("account")).toBe("more");
  });

  it("defines Hebrew and English labels for every filter option", () => {
    expect(Object.values(helpAreaLabels).every((label) => label.he && label.en)).toBe(true);
    expect(Object.values(helpLevelLabels).every((label) => label.he && label.en)).toBe(true);
  });
});
