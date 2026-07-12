/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createPrompt,
  duplicatePrompt,
  editPrompt,
  loadPromptState,
  savePromptState,
} from "./promptStorage";
import type { Prompt, PromptFilters, PromptInput, PromptState } from "./types";
import { importCatalogEntry } from "./catalog/catalogImport";
import type { CatalogEntry } from "./catalog/types";
interface Value {
  state: PromptState;
  create: (i: PromptInput) => Prompt;
  update: (id: string, i: PromptInput) => Prompt | undefined;
  duplicate: (id: string, s: string) => Prompt | undefined;
  remove: (id: string) => void;
  favorite: (id: string) => void;
  setFilters: (f: Partial<PromptFilters>) => void;
  saveDraft: (d?: Partial<Prompt>) => void;
  get: (id: string) => Prompt | undefined;
  importFromCatalog: (entry: CatalogEntry) => Prompt;
}
const Context = createContext<Value | null>(null);
export function PromptLibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadPromptState);
  const mutate = (fn: (s: PromptState) => PromptState) => {
    let next!: PromptState;
    setState((s) => {
      next = fn(s);
      savePromptState(next);
      return next;
    });
    return next;
  };
  const value = useMemo<Value>(
    () => ({
      state,
      create: (input) => {
        const p = createPrompt(input);
        mutate((s) => ({
          ...s,
          prompts: [p, ...s.prompts],
          draft: undefined,
          lastOpenedPromptId: p.id,
        }));
        return p;
      },
      update: (id, input) => {
        const old = state.prompts.find((p) => p.id === id);
        if (!old) return;
        const p = editPrompt(old, input);
        mutate((s) => ({
          ...s,
          prompts: s.prompts.map((x) => (x.id === id ? p : x)),
        }));
        return p;
      },
      duplicate: (id, suffix) => {
        const old = state.prompts.find((p) => p.id === id);
        if (!old) return;
        const p = duplicatePrompt(old, suffix);
        mutate((s) => ({ ...s, prompts: [p, ...s.prompts] }));
        return p;
      },
      remove: (id) =>
        mutate((s) => ({
          ...s,
          prompts: s.prompts.filter((p) => p.id !== id),
        })),
      favorite: (id) =>
        mutate((s) => ({
          ...s,
          prompts: s.prompts.map((p) =>
            p.id === id ? { ...p, isFavorite: !p.isFavorite } : p,
          ),
        })),
      setFilters: (f) =>
        mutate((s) => ({ ...s, filters: { ...s.filters, ...f } })),
      saveDraft: (d) => mutate((s) => ({ ...s, draft: d })),
      get: (id) => state.prompts.find((p) => p.id === id),
      importFromCatalog: (entry) => {
        const prompt = importCatalogEntry(entry);
        mutate((current) => ({
          ...current,
          prompts: [prompt, ...current.prompts],
          lastOpenedPromptId: prompt.id,
        }));
        return prompt;
      },
    }),
    [state],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePromptLibrary() {
  const c = useContext(Context);
  if (!c) throw new Error("Missing PromptLibraryProvider");
  return c;
}
