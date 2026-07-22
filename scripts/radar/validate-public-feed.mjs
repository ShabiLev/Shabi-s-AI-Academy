import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const feedPath = new URL("../../public/generated/ai-radar-feed.json", import.meta.url);
const outputDirectory = new URL("../../quality/runtime/ci/ai-radar/", import.meta.url);
const source = await readFile(feedPath, "utf8");
if (Buffer.byteLength(source) > 1_500_000) throw new Error("Radar feed exceeds 1.5 MB");
const feed = JSON.parse(source);
if (feed.schemaVersion !== 1 || !Array.isArray(feed.records) || feed.records.length > 250) throw new Error("Invalid Radar feed envelope");

const allowedHosts = new Set(["openai.com", "digital-strategy.ec.europa.eu", "hakaveret.education.gov.il"]);
const sourceChecks = [];
for (const record of feed.records) {
  if (!record || typeof record !== "object" || record.reviewed !== true || record.status !== "published") throw new Error("Only reviewed published Radar records may ship");
  const url = new URL(record.sourceUrl);
  if (url.protocol !== "https:" || !allowedHosts.has(url.hostname) || url.username || url.password) throw new Error(`Disallowed Radar URL: ${url}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal, headers: { "User-Agent": "Shabis-AI-Academy-Radar-Validator/1.0" } });
    // Authentication/bot-policy denials still prove the official host is reachable;
    // only transport/server failures block the cached-feed validation.
    const reachable = response.ok || response.status === 401 || response.status === 403;
    sourceChecks.push({ sourceId: record.sourceId, url: url.href, reachable, status: response.status });
  } catch (error) {
    sourceChecks.push({ sourceId: record.sourceId, url: url.href, reachable: false, error: error instanceof Error ? error.message.slice(0, 160) : "request failed" });
  } finally { clearTimeout(timeout); }
}

const report = {
  schemaVersion: 1, githubSha: process.env.GITHUB_SHA ?? null, generatedAt: new Date().toISOString(),
  feedDigest: `sha256:${createHash("sha256").update(source).digest("hex")}`,
  recordCount: feed.records.length, sourceChecks,
  publication: "artifact-only; reviewed feed publication requires a pull request",
};
await mkdir(outputDirectory, { recursive: true });
await writeFile(new URL("report.json", outputDirectory), `${JSON.stringify(report, null, 2)}\n`, "utf8");
if (sourceChecks.some((check) => !check.reachable)) throw new Error("One or more public Radar sources are unavailable; reviewed cache remains unchanged");
