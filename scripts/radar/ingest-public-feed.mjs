import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  mergeWithPreservedCache,
  normalizeSourceItem,
  parseXmlItems,
  retrieveSource,
} from "./ingestion-lib.mjs";

const root = process.cwd();
const registryPath = path.join(root, "config", "radar-sources.json");
const outputPath = path.resolve(root, process.env.RADAR_OUTPUT ?? "public/generated/ai-radar-feed.json");
const runtimeDir = path.join(root, "quality", "runtime", "radar");
const now = new Date().toISOString();

const registry = JSON.parse(await readFile(registryPath, "utf8"));
if (registry.schemaVersion !== 1 || !Array.isArray(registry.sources)) throw new Error("Invalid Radar source registry");
const existing = await readFile(outputPath, "utf8").then(JSON.parse).catch(() => ({ records: [], generatedAt: now }));
const accepted = [];
const quarantine = [];
const sourceHealth = [];

for (const source of registry.sources) {
  if (!source.enabled) {
    sourceHealth.push({ sourceId: source.id, status: "disabled", checkedAt: now, itemCount: 0 });
    continue;
  }
  try {
    const xml = await retrieveSource(source);
    const candidates = parseXmlItems(xml, source.adapter);
    let publishedCount = 0;
    for (const candidate of candidates) {
      try {
        accepted.push(normalizeSourceItem(source, candidate, now));
        publishedCount += 1;
      } catch (error) {
        quarantine.push({ sourceId: source.id, reason: error instanceof Error ? error.message : "invalid-item" });
      }
    }
    sourceHealth.push({
      sourceId: source.id,
      status: publishedCount ? "healthy" : "degraded",
      checkedAt: now,
      lastSuccessfulAt: now,
      itemCount: publishedCount,
      ...(publishedCount ? {} : { errorCode: "no-publishable-items" }),
    });
  } catch (error) {
    sourceHealth.push({
      sourceId: source.id,
      status: "failed",
      checkedAt: now,
      itemCount: 0,
      errorCode: error instanceof Error ? error.message.slice(0, 80) : "source-failed",
    });
  }
}

const succeeded = sourceHealth.filter((source) => source.status === "healthy").length;
const failed = sourceHealth.filter((source) => source.status === "failed" || source.status === "degraded").length;
const existingRecords = existing.records ?? [];
const records = mergeWithPreservedCache(accepted, existingRecords, failed > 0);
if (!succeeded && !records.length) throw new Error("All Radar sources failed and no reviewed cache is available");
const lastSuccessfulAt = succeeded ? now : existing.lastSuccessfulAt ?? existing.generatedAt;
const feed = {
  schemaVersion: 1,
  provider: "scheduled-radar-ingestion",
  generatedAt: now,
  lastSuccessfulAt,
  partial: failed > 0,
  sourceHealth,
  records,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await mkdir(runtimeDir, { recursive: true });
const temporary = `${outputPath}.tmp`;
await writeFile(temporary, `${JSON.stringify(feed, null, 2)}\n`, "utf8");
await rename(temporary, outputPath);
await writeFile(path.join(runtimeDir, "source-health.json"), `${JSON.stringify({
  generatedAt: now,
  registry: registry.sources.map(({ allowedHosts, ...source }) => ({ ...source, allowedHosts })),
  sourceHealth,
  accepted: accepted.length,
  duplicatesRemoved: accepted.length + (failed ? existingRecords.length : 0) - records.length,
  quarantined: quarantine.length,
}, null, 2)}\n`, "utf8");
await writeFile(path.join(runtimeDir, "quarantine.json"), `${JSON.stringify({ generatedAt: now, items: quarantine }, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  output: path.relative(root, outputPath),
  records: records.length,
  healthySources: succeeded,
  impairedSources: failed,
  quarantined: quarantine.length,
  partial: feed.partial,
}, null, 2));
