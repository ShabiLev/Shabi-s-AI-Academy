import { mkdirSync, writeFileSync } from "node:fs";

export function writeQualityArtifact(name: string, value: unknown) {
  mkdirSync("quality/generated", { recursive: true });
  writeFileSync(`quality/generated/${name}.json`, `${JSON.stringify(value, null, 2)}\n`);
}
