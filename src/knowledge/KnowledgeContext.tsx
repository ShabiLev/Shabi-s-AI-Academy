/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { createKnowledgeDocument, deriveContextLinks, loadKnowledgeState, saveKnowledgeState } from "./knowledgeStorage";
import type { KnowledgeDocument, KnowledgeInput, KnowledgeState } from "./types";
interface Value { state: KnowledgeState; create: (input: KnowledgeInput) => KnowledgeDocument; update: (id: string, input: KnowledgeInput) => void; remove: (id: string) => void; get: (id: string) => KnowledgeDocument | undefined; clear: () => void }
const Context = createContext<Value | null>(null);
export function KnowledgeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadKnowledgeState);
  // contextLinks is always recomputed from the resulting documents, never independently patched —
  // this is what keeps it from drifting out of sync with each document's own projectIds.
  const mutate = (fn: (state: KnowledgeState) => KnowledgeState) => setState((current) => {
    const applied = fn(current);
    const next: KnowledgeState = { ...applied, contextLinks: deriveContextLinks(applied.documents) };
    saveKnowledgeState(next);
    return next;
  }); const value = useMemo<Value>(() => ({ state, create: (input) => { const document = createKnowledgeDocument(input); mutate((current) => ({ ...current, documents: [document, ...current.documents] })); return document; }, update: (id, input) => mutate((current) => ({ ...current, documents: current.documents.map((document) => document.id === id ? { ...createKnowledgeDocument(input), id, createdAt: document.createdAt, version: document.version + 1 } : document) })), remove: (id) => mutate((current) => ({ ...current, documents: current.documents.filter((document) => document.id !== id) })), get: (id) => state.documents.find((document) => document.id === id), clear: () => mutate(() => ({ schemaVersion: 2, documents: [], contextLinks: [] })) }), [state]); return <Context.Provider value={value}>{children}</Context.Provider>; }
export function useKnowledge() { const value = useContext(Context); if (!value) throw new Error("Missing KnowledgeProvider"); return value; }
