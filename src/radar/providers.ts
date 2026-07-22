import { parseRadarFeed, type RadarFeed } from "./records";

export type RadarProviderStatus = "cached" | "online" | "offline" | "unavailable" | "partial";
export type RadarErrorCode =
  | "RADAR_OFFLINE"
  | "RADAR_TIMEOUT"
  | "RADAR_PROVIDER_UNAVAILABLE"
  | "RADAR_INVALID_RESPONSE"
  | "RADAR_RATE_LIMITED"
  | "RADAR_UNKNOWN_ERROR";

export interface RadarProviderResult {
  readonly status: RadarProviderStatus;
  readonly feed?: RadarFeed;
  readonly errorCode?: RadarErrorCode;
}
export interface RadarProvider {
  readonly id: string;
  load(signal?: AbortSignal): Promise<RadarProviderResult>;
}

export class UnavailableRadarProvider implements RadarProvider {
  readonly id = "unavailable";
  async load(): Promise<RadarProviderResult> {
    return { status: "unavailable", errorCode: "RADAR_PROVIDER_UNAVAILABLE" };
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
      // Native Window.fetch requires the Window receiver. Calling a stored
      // function as `this.fetcher()` binds it to the provider instance and
      // causes an "Illegal invocation" in browsers.
      const response = await this.fetcher.call(globalThis, this.url, { signal, credentials: "same-origin", headers: { Accept: "application/json" } });
      if (response.status === 429) return { status: "offline", errorCode: "RADAR_RATE_LIMITED" };
      if (!response.ok) return { status: response.status === 404 ? "unavailable" : "offline", errorCode: "RADAR_PROVIDER_UNAVAILABLE" };
      const length = Number(response.headers.get("content-length") ?? "0");
      if (length > 1_500_000) return { status: "unavailable", errorCode: "RADAR_INVALID_RESPONSE" };
      let unknownFeed: unknown;
      try {
        unknownFeed = await response.json();
      } catch {
        return { status: "unavailable", errorCode: "RADAR_INVALID_RESPONSE" };
      }
      const feed = parseRadarFeed(unknownFeed);
      if (!feed) return { status: "unavailable", errorCode: "RADAR_INVALID_RESPONSE" };
      return { status: feed.partial ? "partial" : "online", feed };
    } catch (error) {
      if (signal?.aborted || (error instanceof DOMException && error.name === "AbortError")) return { status: "offline", errorCode: "RADAR_TIMEOUT" };
      if (error instanceof TypeError) return { status: "offline", errorCode: "RADAR_OFFLINE" };
      return { status: "offline", errorCode: "RADAR_UNKNOWN_ERROR" };
    }
  }
}
