/* eslint-disable react-refresh/only-export-components -- provider and hook share an actor-scoped repository boundary. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";
import { useGuestProfile } from "../guest-profile";
import { createOutcome, loadOutcomeRepository, saveOutcomeRepository, type CreateOutcomeInput } from "./repository";
import type { Deliverable, Outcome, OutcomeEvidence, OutcomeRepositorySnapshot } from "./types";
import { validateDeliverable, validateOutcome, validateOutcomeClaims, validateOutcomeEvidence } from "./validation";

interface OutcomeContextValue extends OutcomeRepositorySnapshot {
  actorId: string;
  create: (input: Omit<CreateOutcomeInput, "actorId" | "createdBy">) => Outcome | undefined;
  update: (id: string, patch: Partial<Outcome>) => boolean;
  addDeliverable: (deliverable: Deliverable) => boolean;
  addEvidence: (evidence: OutcomeEvidence) => boolean;
  archive: (id: string) => boolean;
}

const OutcomeContext = createContext<OutcomeContextValue | null>(null);

export function OutcomeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const guest = useGuestProfile();
  const actorId = user?.id ?? guest.profile.anonymousProfileId ?? "local-guest";
  const [snapshot, setSnapshot] = useState<OutcomeRepositorySnapshot>(() => loadOutcomeRepository(actorId));
  const snapshotRef = useRef(snapshot);
  useEffect(() => {
    const next = loadOutcomeRepository(actorId);
    snapshotRef.current = next;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- changing actor is an isolation boundary and must replace visible state.
    setSnapshot(next);
  }, [actorId]);
  const mutate = useCallback((change: (current: OutcomeRepositorySnapshot) => OutcomeRepositorySnapshot): boolean => {
    const next = change(snapshotRef.current);
    if (!saveOutcomeRepository(actorId, next)) return false;
    snapshotRef.current = next;
    setSnapshot(next);
    return true;
  }, [actorId]);
  const value = useMemo<OutcomeContextValue>(() => ({
    ...snapshot,
    actorId,
    create: (input) => {
      if (input.deliverableIds.length > 0 || input.evidenceIds.length > 0) return undefined;
      const outcome = createOutcome({ ...input, actorId, createdBy: actorId });
      if (!validateOutcome(outcome, actorId) || validateOutcomeClaims(outcome).length > 0) return undefined;
      return mutate((current) => ({ ...current, outcomes: [outcome, ...current.outcomes] })) ? outcome : undefined;
    },
    update: (id, patch) => {
      const existing = snapshotRef.current.outcomes.find((item) => item.id === id);
      if (!existing) return false;
      const updated: Outcome = { ...existing, ...patch, id: existing.id, actorId: existing.actorId, createdBy: existing.createdBy, createdAt: existing.createdAt, schemaVersion: 2, version: existing.version + 1, updatedAt: new Date().toISOString() };
      if (!validateOutcome(updated, actorId) || validateOutcomeClaims(updated).length > 0) return false;
      return mutate((current) => ({ ...current, outcomes: current.outcomes.map((item) => item.id === id ? updated : item) }));
    },
    addDeliverable: (deliverable) => validateDeliverable(deliverable, actorId)
      && snapshotRef.current.outcomes.some((item) => item.id === deliverable.outcomeId)
      && mutate((current) => ({
        ...current,
        outcomes: current.outcomes.map((item) => item.id === deliverable.outcomeId && !item.deliverableIds.includes(deliverable.id)
          ? { ...item, deliverableIds: [...item.deliverableIds, deliverable.id], version: item.version + 1, updatedAt: new Date().toISOString() }
          : item),
        deliverables: [...current.deliverables.filter((item) => item.id !== deliverable.id), deliverable],
      })),
    addEvidence: (evidence) => validateOutcomeEvidence(evidence, actorId)
      && snapshotRef.current.outcomes.some((item) => item.id === evidence.outcomeId)
      && (!evidence.deliverableId || snapshotRef.current.deliverables.some((item) => item.id === evidence.deliverableId))
      && mutate((current) => ({
        ...current,
        outcomes: current.outcomes.map((item) => item.id === evidence.outcomeId && !item.evidenceIds.includes(evidence.id)
          ? { ...item, evidenceIds: [...item.evidenceIds, evidence.id], version: item.version + 1, updatedAt: new Date().toISOString() }
          : item),
        evidence: [...current.evidence.filter((item) => item.id !== evidence.id), evidence],
      })),
    archive: (id) => snapshotRef.current.outcomes.some((item) => item.id === id)
      && mutate((current) => ({ ...current, outcomes: current.outcomes.map((item) => item.id === id ? { ...item, status: "archived", version: item.version + 1, updatedAt: new Date().toISOString() } : item) })),
  }), [actorId, mutate, snapshot]);
  return <OutcomeContext.Provider value={value}>{children}</OutcomeContext.Provider>;
}

export function useOutcomes(): OutcomeContextValue {
  const value = useContext(OutcomeContext);
  if (!value) throw new Error("Missing OutcomeProvider");
  return value;
}
