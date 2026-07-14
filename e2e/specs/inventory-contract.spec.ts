import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";

test("every registered production route has a complete quality inventory record", () => {
  expect(() => execFileSync(process.execPath, ["quality/scripts/validate-inventory.mjs"], { stdio: "pipe" })).not.toThrow();
});
