/* eslint-disable react-refresh/only-export-components -- provider and hook share one domain boundary. */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useAosCore } from "../aos-core";
import { retainRadarHistory } from "./history";
import { SameOriginRadarProvider, type RadarErrorCode, type RadarProviderStatus } from "./providers";
import { reviewedRadarFeed } from "./reviewedFeed";
import { loadRadarFavorites, loadRadarHistory, saveRadarFavorites, saveRadarHistory, toggleRadarFavorite } from "./storage";
import type { RadarRecord } from "./records";

interface RadarValue {
  records: readonly RadarRecord[];
  favoriteIds: readonly string[];
  status: RadarProviderStatus;
  errorCode?: RadarErrorCode;
  refreshing: boolean;
  refresh: () => Promise<void>;
  toggleFavorite: (canonicalId: string) => void;
}

const Context = createContext<RadarValue | null>(null);
const today = () => new Date().toISOString().slice(0, 10);

export function RadarDataProvider({ children }: { children: ReactNode }) {
  const { eventBus } = useAosCore();
  const [favoriteIds, setFavoriteIds] = useState(loadRadarFavorites);
  const [records, setRecords] = useState<RadarRecord[]>(() => retainRadarHistory([...loadRadarHistory(), ...reviewedRadarFeed.records], today(), new Set(loadRadarFavorites())));
  const [status, setStatus] = useState<RadarProviderStatus>("cached");
  const [errorCode, setErrorCode] = useState<RadarErrorCode>();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const feedUrl = new URL("generated/ai-radar-feed.json", document.baseURI).toString();
      const result = await new SameOriginRadarProvider(window.fetch, feedUrl).load();
      setStatus(result.status);
      setErrorCode(result.errorCode);
      if (result.feed) {
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
    const next = toggleRadarFavorite(favoriteIds, canonicalId);
    saveRadarFavorites(next);
    setFavoriteIds(next);
    setRecords((existing) => {
      const retained = retainRadarHistory(existing, today(), new Set(next));
      saveRadarHistory(retained);
      return retained;
    });
    eventBus.publish("radar.item.saved", { version: 1, itemId: canonicalId, saved: next.includes(canonicalId), occurredAt: new Date().toISOString() });
  }, [eventBus, favoriteIds]);

  const value = useMemo<RadarValue>(() => ({ records, favoriteIds, status, errorCode, refreshing, refresh, toggleFavorite }), [errorCode, favoriteIds, records, refresh, refreshing, status, toggleFavorite]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRadar(): RadarValue {
  const value = useContext(Context);
  if (!value) throw new Error("useRadar must be used within RadarDataProvider");
  return value;
}
