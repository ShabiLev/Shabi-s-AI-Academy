import { createHash } from "node:crypto";

export const MAX_SOURCE_BYTES = 1_000_000;
export const MAX_SOURCE_ITEMS = 40;
export const MAX_PUBLISHED_ITEMS = 100;
export const SOURCE_TIMEOUT_MS = 15_000;
export const MAX_ATTEMPTS = 3;

const entityMap = new Map([
  ["amp", "&"], ["lt", "<"], ["gt", ">"], ["quot", "\""], ["apos", "'"],
  ["#39", "'"], ["nbsp", " "],
]);
export function decodeXml(value = "") {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&([^;]{1,12});/g, (match, entity) => {
    if (entityMap.has(entity)) return entityMap.get(entity);
    if (/^#\d+$/.test(entity)) return String.fromCodePoint(Number(entity.slice(1)));
    if (/^#x[a-f0-9]+$/i.test(entity)) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    return match;
  });
}
export function inertText(value, max) {
  return decodeXml(String(value ?? ""))
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}
const tag = (xml, name) => {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match?.[1] ?? "";
};
const linkFromAtom = (entry) => {
  const alternate = entry.match(/<link\b[^>]*\brel=["']alternate["'][^>]*\bhref=["']([^"']+)["'][^>]*\/?>/i);
  const any = entry.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\/?>/i);
  return decodeXml(alternate?.[1] ?? any?.[1] ?? tag(entry, "link")).trim();
};
export function parseXmlItems(xml, adapter) {
  if (typeof xml !== "string" || xml.length > MAX_SOURCE_BYTES) throw new Error("payload-too-large");
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error("unsafe-xml-declaration");
  const pattern = adapter === "rss" ? /<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi : /<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi;
  const results = [];
  for (const match of xml.matchAll(pattern)) {
    const entry = match[1];
    results.push({
      title: inertText(tag(entry, "title"), 240),
      summary: inertText(tag(entry, adapter === "rss" ? "description" : "summary") || tag(entry, "content"), 1_200),
      url: adapter === "rss" ? inertText(tag(entry, "link"), 500) : linkFromAtom(entry),
      publishedAt: inertText(tag(entry, "pubDate") || tag(entry, "published") || tag(entry, "updated"), 80),
      updatedAt: inertText(tag(entry, "updated") || tag(entry, "pubDate") || tag(entry, "published"), 80),
    });
    if (results.length >= MAX_SOURCE_ITEMS) break;
  }
  return results;
}

export function canonicalizeUrl(value, allowedHosts) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || !allowedHosts.includes(url.hostname)) {
    throw new Error("unsafe-source-url");
  }
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (/^utm_|^(ref|source|campaign)$/i.test(key)) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  return url.toString();
}

const slug = (value) => value.toLocaleLowerCase().normalize("NFKD")
  .replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 70);
const sha256 = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const dateOnly = (value) => new Date(value).toISOString().slice(0, 10);
const hebrew = (value) => /[\u0590-\u05ff]/.test(value);
const classify = (text) => {
  const value = text.toLocaleLowerCase();
  if (/agent|tool use|mcp|prompt/.test(value)) return { category: "agents", topics: ["agents", "prompting"] };
  if (/eval|benchmark|test|quality|safety|security|red team/.test(value)) return { category: "evaluation", topics: ["evaluation", "qa", "safety"] };
  if (/policy|regulat|govern|law/.test(value)) return { category: "governance", topics: ["governance"] };
  if (/open.?source|github|release|sdk|api/.test(value)) return { category: "open-source", topics: ["developer-tools", "open-source"] };
  return { category: "models", topics: ["models"] };
};
const israelScore = (value) => /\bisrael|israeli|hebrew|ישראל|עברית\b/i.test(value) ? 90 : 0;

export function normalizeSourceItem(source, item, retrievedAt) {
  if (!item.title || !item.url || !item.publishedAt) throw new Error("missing-required-field");
  const sourceUrl = canonicalizeUrl(item.url, source.allowedHosts);
  const published = new Date(item.publishedAt);
  if (!Number.isFinite(published.getTime())) throw new Error("invalid-date");
  const updated = new Date(item.updatedAt || item.publishedAt);
  if (!Number.isFinite(updated.getTime()) || updated.getTime() < published.getTime()) throw new Error("invalid-updated-date");
  const retrieved = new Date(retrievedAt);
  if (published.getTime() > retrieved.getTime() + 86_400_000) throw new Error("future-date");
  const ageDays = Math.floor((retrieved.getTime() - published.getTime()) / 86_400_000);
  if (ageDays > 45) throw new Error("outside-retention");
  const title = inertText(item.title, 240);
  const summary = inertText(item.summary || title, 1_200);
  const classification = classify(`${title} ${summary}`);
  const identity = `${source.id}:${sourceUrl}`;
  const canonicalId = `${source.id}:${sha256(sourceUrl).slice(7, 31)}`;
  const contentChecksum = sha256(JSON.stringify({ title, summary, sourceUrl, updatedAt: item.updatedAt }));
  return {
    id: `${slug(source.id)}-${slug(title) || contentChecksum.slice(7, 19)}`,
    canonicalId,
    title: { he: hebrew(title) ? title : title, en: title },
    summary: { he: hebrew(summary) ? summary : summary, en: summary },
    whyItMatters: {
      he: `עדכון מאומת ממקור ${source.publisher}; מומלץ לקרוא את המקור המלא לפני קבלת החלטה.`,
      en: `A verified update from ${source.publisher}; read the full source before making a decision.`,
    },
    whatChanged: {
      he: "פרסום חדש או מעודכן ממקור מאושר.",
      en: "A new or updated publication from an approved source.",
    },
    affectedAudiences: ["learners", "developers", "quality-engineers"],
    sourceId: source.id,
    sourceName: source.publisher,
    sourceUrl,
    sourceTier: source.tier,
    sourceType: source.type,
    category: classification.category,
    topics: classification.topics,
    language: hebrew(`${title} ${summary}`) ? "he" : "en",
    publicationDate: dateOnly(published),
    publishedAt: published.toISOString(),
    updatedAt: updated.toISOString(),
    retrievalDate: dateOnly(retrieved),
    lastVerifiedAt: dateOnly(retrieved),
    freshness: ageDays <= 2 ? "fresh" : ageDays <= 7 ? "aging" : "stale",
    confidence: source.tier === 1 ? 95 : 85,
    relevanceScore: classification.category === "evaluation" ? 88 : 80,
    israelRelevance: israelScore(`${title} ${summary}`),
    historical: ageDays > 7,
    saved: false,
    provider: "scheduled-radar-ingestion",
    checksum: contentChecksum,
    status: "published",
    reviewed: source.publicationPolicy === "reviewed",
    publicationState: source.publicationPolicy,
    safetyState: "passed",
    translationStatus: hebrew(`${title} ${summary}`) ? "complete" : "partial",
    version: 1,
    correctionHistory: [],
    _identity: identity,
  };
}

export function deduplicateAndCluster(records) {
  const byCanonical = new Map();
  for (const record of records) {
    const existing = byCanonical.get(record.canonicalId);
    if (!existing || record.lastVerifiedAt > existing.lastVerifiedAt) byCanonical.set(record.canonicalId, record);
  }
  const clusters = new Map();
  for (const record of byCanonical.values()) {
    const fingerprint = slug(record.title.en).split("-").filter((word) => word.length > 3).slice(0, 8).sort().join("-");
    const group = clusters.get(fingerprint) ?? [];
    group.push(record);
    clusters.set(fingerprint, group);
  }
  return [...clusters.values()].flatMap((group) => group.map((record) => ({
    ...record,
    duplicateGroupId: group.length > 1 ? `cluster:${sha256(group.map((item) => item.canonicalId).sort().join("|")).slice(7, 31)}` : undefined,
  }))).sort((left, right) => right.publicationDate.localeCompare(left.publicationDate)
    || right.relevanceScore - left.relevanceScore).slice(0, MAX_PUBLISHED_ITEMS);
}

export function mergeWithPreservedCache(accepted, existing, hasImpairedSource) {
  const retained = hasImpairedSource
    ? existing.filter((record) =>
      !accepted.some((candidate) => candidate.canonicalId === record.canonicalId))
    : [];
  return deduplicateAndCluster([...accepted, ...retained]).map(publicRecord);
}

export async function readBoundedResponse(response, maxBytes = MAX_SOURCE_BYTES) {
  const declared = Number(response.headers.get("content-length") ?? "0");
  if (declared > maxBytes) throw new Error("payload-too-large");
  if (!response.body) {
    const text = await response.text();
    if (Buffer.byteLength(text) > maxBytes) throw new Error("payload-too-large");
    return text;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.byteLength;
    if (size > maxBytes) throw new Error("payload-too-large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function retrieveSource(source, fetcher = fetch, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS);
    try {
      const response = await fetcher(source.url, {
        signal: controller.signal,
        redirect: "follow",
        headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml", "User-Agent": "Shabis-AI-Academy-Radar/1.7" },
      });
      const finalUrl = new URL(response.url || source.url);
      if (finalUrl.protocol !== "https:" || !source.allowedHosts.includes(finalUrl.hostname)) throw new Error("unsafe-redirect");
      if (response.status === 429 || response.status >= 500) throw new Error(`retryable-http-${response.status}`);
      if (!response.ok) throw new Error(`http-${response.status}`);
      return await readBoundedResponse(response);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) await sleep(250 * (2 ** (attempt - 1)));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}

export function publicRecord(record) {
  const { _identity, ...published } = record;
  void _identity;
  return published;
}
