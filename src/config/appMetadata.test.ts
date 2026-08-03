import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { appMetadata } from "./appMetadata";

describe("displayed application version", () => {
  it("matches the package.json version, with no independently hard-coded copy", () => {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageVersion = (JSON.parse(readFileSync(packageJsonPath, "utf8")) as { version: string }).version;
    expect(appMetadata.version).toBe(packageVersion);
  });

  it("is not a beta, preview, or release-candidate label", () => {
    expect(appMetadata.version).not.toMatch(/beta|rc|preview|candidate/i);
  });
});
