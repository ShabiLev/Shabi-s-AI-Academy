/* eslint-disable react-refresh/only-export-components -- provider and hook share a storage boundary. */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { RadarRecord } from "../radar/records";
import {
  createGuestProfileRepository,
  GUEST_PROFILE_LIMITS,
  type GuestProfileRepository,
} from "./repository";
import type { GuestProfile, RecommendationFeedback, SavedRadarSearch } from "./types";

interface GuestProfileValue {
  readonly profile: GuestProfile;
  readonly update: (change: (profile: GuestProfile) => GuestProfile) => void;
  readonly toggleFavorite: (id: string) => void;
  readonly toggleFollowTopic: (topic: string) => void;
  readonly toggleFollowSource: (sourceId: string) => void;
  readonly toggleDismiss: (id: string) => void;
  readonly markRead: (record: RadarRecord, read?: boolean) => void;
  readonly recordView: (record: RadarRecord) => void;
  readonly setRecommendationFeedback: (itemId: string, value: RecommendationFeedback["value"]) => void;
  readonly saveSearch: (search: Omit<SavedRadarSearch, "id" | "createdAt" | "updatedAt"> & { id?: string }) => void;
  readonly deleteSearch: (id: string) => void;
  readonly reset: () => void;
  readonly repository: GuestProfileRepository;
}

const Context = createContext<GuestProfileValue | null>(null);
const now = () => new Date().toISOString();
const toggle = (items: readonly string[], value: string, limit: number) =>
  items.includes(value) ? items.filter((item) => item !== value) : [...items, value].slice(-limit);

export function GuestProfileProvider({ children }: { children: ReactNode }) {
  const repository = useMemo(() => createGuestProfileRepository(), []);
  const [profile, setProfile] = useState(repository.load);
  const update = useCallback((change: (value: GuestProfile) => GuestProfile) => {
    setProfile((current) => {
      const next = { ...change(current), updatedAt: now() };
      repository.save(next);
      return next;
    });
  }, [repository]);
  const value: GuestProfileValue = {
    profile,
    repository,
    update,
    toggleFavorite: (id) => update((current) => ({
      ...current,
      favoriteIds: toggle(current.favoriteIds, id, GUEST_PROFILE_LIMITS.favorites),
    })),
    toggleFollowTopic: (topic) => update((current) => ({
      ...current,
      selectedTopics: toggle(current.selectedTopics, topic, GUEST_PROFILE_LIMITS.topics),
    })),
    toggleFollowSource: (sourceId) => update((current) => ({
      ...current,
      selectedSources: toggle(current.selectedSources, sourceId, GUEST_PROFILE_LIMITS.sources),
    })),
    toggleDismiss: (id) => update((current) => ({
      ...current,
      dismissedIds: toggle(current.dismissedIds, id, GUEST_PROFILE_LIMITS.dismissed),
    })),
    markRead: (record, read = true) => update((current) => ({
      ...current,
      readItems: read
        ? [...current.readItems.filter((item) => item.id !== record.canonicalId), {
          id: record.canonicalId,
          checksum: record.checksum,
          at: now(),
        }].slice(-GUEST_PROFILE_LIMITS.readItems)
        : current.readItems.filter((item) => item.id !== record.canonicalId),
    })),
    recordView: (record) => update((current) => ({
      ...current,
      recentViews: [...current.recentViews.filter((item) => item.id !== record.canonicalId), {
        id: record.canonicalId,
        checksum: record.checksum,
        at: now(),
      }].slice(-GUEST_PROFILE_LIMITS.recentViews),
    })),
    setRecommendationFeedback: (itemId, feedbackValue) => update((current) => ({
      ...current,
      recommendationFeedback: [
        ...current.recommendationFeedback.filter((item) => item.itemId !== itemId),
        { itemId, value: feedbackValue, at: now() },
      ].slice(-GUEST_PROFILE_LIMITS.feedback),
    })),
    saveSearch: (search) => update((current) => {
      const timestamp = now();
      const id = search.id ?? crypto.randomUUID();
      const existing = current.savedSearches.find((item) => item.id === id);
      return {
        ...current,
        savedSearches: [...current.savedSearches.filter((item) => item.id !== id), {
          ...search,
          id,
          createdAt: existing?.createdAt ?? timestamp,
          updatedAt: timestamp,
        }].slice(-GUEST_PROFILE_LIMITS.savedSearches),
      };
    }),
    deleteSearch: (id) => update((current) => ({
      ...current,
      savedSearches: current.savedSearches.filter((item) => item.id !== id),
    })),
    reset: () => setProfile(repository.reset()),
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useGuestProfile(): GuestProfileValue {
  const value = useContext(Context);
  if (!value) throw new Error("useGuestProfile must be used within GuestProfileProvider");
  return value;
}
