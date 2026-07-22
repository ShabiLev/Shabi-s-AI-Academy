import { parseRadarFeed, type RadarFeed } from "./records";

export type RadarProviderStatus = "cached" | "online" | "offline" | "unavailable" | "partial";

export interface RadarProviderResult {
  readonly status: RadarProviderStatus;
  readonly feed?: RadarFeed;
  readonly message?: string;
}

export interface RadarProvider {
  readonly id: string;
  load(signal?: AbortSignal): Promise<RadarProviderResult>;
}

export class UnavailableRadarProvider implements RadarProvider {
  readonly id = "unavailable";
  async load(): Promise<RadarProviderResult> {
    return { status: "unavailable", message: "No secure Radar provider is configured." };
  }
}

export class StaticRadarProvider implements RadarProvider {
  readonly id = "reviewed-static";
  constructor(private readonly feed: RadarFeed) {}
  async load(): Promise<RadarProviderResult> {
    return { status: this.feed.partial ? "partial" : "cached", feed: this.feed };
  }
}

export class SameOriginRadarProvider implements RadarProvider {
  readonly id = "same-origin-feed";
  constructor(private readonly fetcher: typeof fetch, private readonly url = "/generated/ai-radar-feed.json") {}
  async load(signal?: AbortSignal): Promise<RadarProviderResult> {
    try {
      const response = await this.fetcher(this.url, { signal, credentials: "same-origin", headers: { Accept: "application/json" } });
      if (!response.ok) return { status: response.status === 404 ? "unavailable" : "offline", message: `Radar feed returned ${response.status}.` };
      const length = Number(response.headers.get("content-length") ?? "0");
      if (length > 1_500_000) return { status: "unavailable", message: "Radar feed exceeds the safe size limit." };
      const feed = parseRadarFeed(await response.json());
      if (!feed) return { status: "unavailable", message: "Radar feed failed schema validation." };
      return { status: feed.partial ? "partial" : "online", feed };
    } catch (error) {
      if (signal?.aborted) return { status: "offline", message: "Radar request was cancelled." };
      return { status: "offline", message: error instanceof Error ? error.message.slice(0, 160) : "Radar feed is unavailable." };
    }
  }
}

