import { useEffect, useState } from "react";
import type { AosSnapshot, AosSnapshotLoadResult } from "./types";

const SNAPSHOT_URL = "/generated/aos-snapshot.json";

function isAosSnapshot(value: unknown): value is AosSnapshot {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.aosVersion === "string" &&
    typeof candidate.applicationVersion === "string" &&
    typeof candidate.modules === "object"
  );
}

/**
 * Loads the AOS status snapshot produced by `npm run aos:snapshot`
 * (scripts/generate-aos-snapshot.mjs) into `public/generated/aos-snapshot.json`.
 * No polling: fetched once per page visit. If the file is missing (never
 * generated in this environment) the caller renders an explicit
 * "not generated yet" state rather than a fabricated status.
 */
export function useAosSnapshot(): AosSnapshotLoadResult {
  const [result, setResult] = useState<AosSnapshotLoadResult>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch(SNAPSHOT_URL, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setResult({ kind: "notGenerated" });
          return;
        }
        if (!isAosSnapshot(data)) {
          setResult({ kind: "error", message: "AOS snapshot file has an unexpected shape." });
          return;
        }
        setResult({ kind: "ok", snapshot: data });
      })
      .catch(() => {
        if (!cancelled) setResult({ kind: "notGenerated" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return result;
}
