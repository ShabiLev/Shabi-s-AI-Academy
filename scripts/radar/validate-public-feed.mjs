import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const feedPath = process.env.RADAR_FEED_PATH
  ? path.resolve(process.cwd(), process.env.RADAR_FEED_PATH)
  : new URL("../../public/generated/ai-radar-feed.json", import.meta.url);
const registryPath = new URL("../../config/radar-sources.json", import.meta.url);
const outputDirectory = new URL("../../quality/runtime/ci/ai-radar/", import.meta.url);
const source = await readFile(feedPath, "utf8");
if (Buffer.byteLength(source) > 1_500_000) throw new Error("Radar feed exceeds 1.5 MB");
const feed = JSON.parse(source);
if (feed.schemaVersion !== 1 || !Array.isArray(feed.records) || feed.records.length > 250) throw new Error("Invalid Radar feed envelope");

const registry = JSON.parse(await readFile(registryPath, "utf8"));
const sourcesById = new Map(registry.sources.map((item) => [item.id, item]));
const allowedHosts = new Set(registry.sources.flatMap((item) => item.allowedHosts));
const sourceChecks = [];
for (const record of feed.records) {
  if (!record || typeof record !== "object" || record.status !== "published") throw new Error("Only published Radar records may ship");
  if (["pending-review", "held", "rejected"].includes(record.publicationState)
    || ["flagged", "quarantined"].includes(record.safetyState)) {
    throw new Error(`Non-publishable Radar record state: ${record.id}`);
  }
  const configuredSource = sourcesById.get(record.sourceId);
  const approved = record.reviewed === true || (record.publicationState === "trusted-source-auto-published"
    && configuredSource?.enabled === true && configuredSource.publicationPolicy === "trusted-source-auto-published");
  if (!approved) throw new Error(`Radar record is not approved for publication: ${record.id}`);
  const url = new URL(record.sourceUrl);
  if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)
    || !configuredSource?.allowedHosts.includes(url.hostname) || url.username || url.password) {
    throw new Error(`Disallowed Radar URL: ${url}`);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal, headers: { "User-Agent": "Shabis-AI-Academy-Radar-Validator/1.0" } });
    const finalUrl = new URL(response.url || url);
    const safeRedirect = configuredSource.allowedHosts.includes(finalUrl.hostname);
    // Authentication, method, and bot-policy denials still prove the official
    // host is reachable; transport/server failures or an unsafe redirect block.
    const reachable = safeRedirect && response.status < 500;
    sourceChecks.push({ sourceId: record.sourceId, url: url.href, finalUrl: finalUrl.href, reachable, status: response.status });
  } catch (error) {
    sourceChecks.push({ sourceId: record.sourceId, url: url.href, reachable: false, error: error instanceof Error ? error.message.slice(0, 160) : "request failed" });
  } finally { clearTimeout(timeout); }
}

const report = {
  schemaVersion: 1, githubSha: process.env.GITHUB_SHA ?? null, generatedAt: new Date().toISOString(),
  feedDigest: `sha256:${createHash("sha256").update(source).digest("hex")}`,
  recordCount: feed.records.length, sourceChecks,
  publication: feed.provider === "scheduled-radar-ingestion"
    ? "scheduled bounded feed; reviewed fallback retained on failure"
    : "reviewed fallback",
};
await mkdir(outputDirectory, { recursive: true });
await writeFile(new URL("report.json", outputDirectory), `${JSON.stringify(report, null, 2)}\n`, "utf8");
if (sourceChecks.some((check) => !check.reachable)) throw new Error("One or more public Radar sources are unavailable; reviewed cache remains unchanged");
