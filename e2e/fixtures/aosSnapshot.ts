import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";

export async function routeAosSnapshot(page: Page) {
  const snapshot = JSON.parse(
    readFileSync("public/generated/aos-snapshot.json", "utf8"),
  );

  await page.route("**/generated/aos-snapshot.json", (route) =>
    route.fulfill({ json: snapshot }),
  );
}
