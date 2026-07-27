/* eslint-disable react-refresh/only-export-components -- provider and hook share one domain boundary. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAosCore } from "../aos-core";
import { useGuestProfile } from "../guest-profile";
import { retainRadarHistory } from "./history";
import { SameOriginRadarProvider, type RadarErrorCode, type RadarProviderStatus } from "./providers";
import { reviewedRadarFeed } from "./reviewedFeed";
import { loadRadarHistory, saveRadarHistory } from "./storage";
import type { RadarRecord, RadarSourceHealth } from "./records";

interface RadarValue {
  records: readonly RadarRecord[];
  favoriteIds: readonly string[];
  status: RadarProviderStatus;
  errorCode?: RadarErrorCode;
  refreshing: boolean;
  generatedAt: string;
  lastSuccessfulAt?: string;
  sourceHealth: readonly RadarSourceHealth[];
  refresh: () => Promise<void>;
  toggleFavorite: (canonicalId: string) => void;
  markRead: (record: RadarRecord, read?: boolean) => void;
  recordView: (record: RadarRecord) => void;
}

const Context = createContext<RadarValue | null>(null);
const today = () => new Date().toISOString().slice(0, 10);

export function RadarDataProvider({ children }: { children: ReactNode }) {
  const { eventBus } = useAosCore();
  const guest = useGuestProfile();
  const favoriteIds = guest.profile.favoriteIds;
  const [records, setRecords] = useState<RadarRecord[]>(() => retainRadarHistory([...loadRadarHistory(), ...reviewedRadarFeed.records], today(), new Set(guest.profile.favoriteIds)));
  const [status, setStatus] = useState<RadarProviderStatus>("cached");
  const [errorCode, setErrorCode] = useState<RadarErrorCode>();
  const [refreshing, setRefreshing] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(reviewedRadarFeed.generatedAt);
  const [lastSuccessfulAt, setLastSuccessfulAt] = useState<string>();
  const [sourceHealth, setSourceHealth] = useState<readonly RadarSourceHealth[]>([]);
  const initialRefreshStarted = useRef(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const basePath = import.meta.env.BASE_URL.replace(/\/?$/, "/");
      const feedUrl = new URL(`${basePath}generated/ai-radar-feed.json`, window.location.origin).toString();
      const result = await new SameOriginRadarProvider(window.fetch, feedUrl).load();
      setStatus(result.status);
      setErrorCode(result.errorCode);
      if (result.feed) {
        setGeneratedAt(result.feed.generatedAt);
        setLastSuccessfulAt(result.feed.lastSuccessfulAt ?? result.feed.generatedAt);
        setSourceHealth(result.feed.sourceHealth ?? []);
        setRecords((current) => {
          const next = retainRadarHistory([...current, ...result.feed!.records], today(), new Set(favoriteIds));
          saveRadarHistory(next);
          return next;
        });
        eventBus.publish("radar.feed.updated", { version: 1, provider: result.feed.provider, itemCount: result.feed.records.length, retrievedAt: new Date().toISOString() });
      }
    } finally {
      setRefreshing(false);
    }
  }, [eventBus, favoriteIds]);

  const toggleFavorite = useCallback((canonicalId: string) => {
    guest.toggleFavorite(canonicalId);
    const next = favoriteIds.includes(canonicalId)
      ? favoriteIds.filter((id) => id !== canonicalId)
      : [...favoriteIds, canonicalId];
    setRecords((existing) => {
      const retained = retainRadarHistory(existing, today(), new Set(next));
      saveRadarHistory(retained);
      return retained;
    });
    eventBus.publish("radar.item.saved", { version: 1, itemId: canonicalId, saved: next.includes(canonicalId), occurredAt: new Date().toISOString() });
  }, [eventBus, favoriteIds, guest]);

  useEffect(() => {
    if (initialRefreshStarted.current) return;
    initialRefreshStarted.current = true;
    void refresh();
  }, [refresh]);

  const value = useMemo<RadarValue>(() => ({
    records,
    favoriteIds,
    status,
    errorCode,
    refreshing,
    generatedAt,
    lastSuccessfulAt,
    sourceHealth,
    refresh,
    toggleFavorite,
    markRead: guest.markRead,
    recordView: guest.recordView,
  }), [errorCode, favoriteIds, generatedAt, guest.markRead, guest.recordView, lastSuccessfulAt, records, refresh, refreshing, sourceHealth, status, toggleFavorite]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRadar(): RadarValue {
  const value = useContext(Context);
  if (!value) throw new Error("useRadar must be used within RadarDataProvider");
  return value;
}
