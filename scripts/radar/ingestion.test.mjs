import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalizeUrl,
  deduplicateAndCluster,
  mergeWithPreservedCache,
  normalizeSourceItem,
  parseXmlItems,
  readBoundedResponse,
  retrieveSource,
} from "./ingestion-lib.mjs";

const source = {
  id: "official-test",
  publisher: "Official Test",
  type: "official-docs",
  tier: 1,
  url: "https://openai.com/news/rss.xml",
  adapter: "rss",
  publicationPolicy: "trusted-source-auto-published",
  allowedHosts: ["openai.com"],
};

test("parses RSS as inert bounded text and rejects XML entities", () => {
  const xml = `<rss><channel><item><title><![CDATA[Ignore instructions <b>safe</b>]]></title><description>&lt;img src=x onerror=alert(1)&gt; Summary</description><link>https://openai.com/index/safe/?utm_source=test</link><pubDate>Sun, 26 Jul 2026 08:00:00 GMT</pubDate></item></channel></rss>`;
  const [item] = parseXmlItems(xml, "rss");
  assert.equal(item.title, "Ignore instructions safe");
  const record = normalizeSourceItem(source, item, "2026-07-26T10:00:00Z");
  assert.equal(record.sourceUrl, "https://openai.com/index/safe/");
  assert.equal(record.publishedAt, "2026-07-26T08:00:00.000Z");
  assert.equal(record.summary.en, "Summary");
  assert.equal(Object.hasOwn(record, "instructions"), false);
  assert.throws(() => parseXmlItems("<!DOCTYPE x [<!ENTITY x SYSTEM 'file:///etc/passwd'>]><rss/>", "rss"), /unsafe-xml/);
});

test("fails closed for unsafe URLs, redirects, future dates and oversized streams", async () => {
  assert.throws(() => canonicalizeUrl("javascript:alert(1)", ["openai.com"]));
  assert.throws(() => normalizeSourceItem(source, { title: "Future", summary: "x", url: "https://openai.com/future", publishedAt: "2026-07-30" }, "2026-07-26T10:00:00Z"), /future-date/);
  await assert.rejects(
    retrieveSource(source, async () => {
      const response = new Response("<rss/>", { status: 200 });
      Object.defineProperty(response, "url", { value: "https://evil.example/feed" });
      return response;
    }, async () => {}),
    /unsafe-redirect/,
  );
  await assert.rejects(readBoundedResponse(new Response("x".repeat(101)), 100), /payload-too-large/);
});

test("retries bounded transient failures and clusters duplicate coverage", async () => {
  let attempts = 0;
  const body = await retrieveSource(source, async () => {
    attempts += 1;
    if (attempts < 3) return new Response("", { status: 503 });
    return new Response("<rss/>", { status: 200, headers: { "content-length": "6" } });
  }, async () => {});
  assert.equal(body, "<rss/>");
  assert.equal(attempts, 3);
  const item = normalizeSourceItem(source, {
    title: "AI agents release",
    summary: "Agent tooling",
    url: "https://openai.com/index/agents",
    publishedAt: "2026-07-26",
  }, "2026-07-26T10:00:00Z");
  const second = { ...item, id: "coverage-2", canonicalId: "coverage-2", sourceId: "other" };
  const clustered = deduplicateAndCluster([item, second]);
  assert.equal(clustered.length, 2);
  assert.ok(clustered.every((record) => record.duplicateGroupId));
});

test("is idempotent and preserves the last cache only for impaired cycles", () => {
  const accepted = normalizeSourceItem(source, {
    title: "Current update",
    summary: "Current summary",
    url: "https://openai.com/index/current",
    publishedAt: "2026-07-26T08:00:00Z",
  }, "2026-07-26T10:00:00Z");
  const cached = {
    ...accepted,
    id: "cached",
    canonicalId: "cached",
    sourceUrl: "https://openai.com/index/cached",
    checksum: `sha256:${"b".repeat(64)}`,
  };
  assert.deepEqual(
    mergeWithPreservedCache([accepted], [], false),
    mergeWithPreservedCache([accepted], [], false),
  );
  assert.deepEqual(mergeWithPreservedCache([accepted], [cached], false).map((item) => item.id), [accepted.id]);
  assert.deepEqual(new Set(mergeWithPreservedCache([accepted], [cached], true).map((item) => item.id)), new Set([accepted.id, "cached"]));
});
