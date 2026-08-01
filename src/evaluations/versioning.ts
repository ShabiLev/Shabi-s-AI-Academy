import { deterministicHash, immutableCopy } from "./hash";
import type { EntityVersion, ImmutableSnapshot, LocalizedText, VersionedEntityRef } from "./types";
import { SAFE_ID } from "./validation";

const VERSION = /^[0-9]+(?:\.[0-9]+){0,2}$/;

export function createEntityVersion<T>(
  existing: readonly EntityVersion<T>[],
  input: { entityId: string; version: string; content: T; changelog: LocalizedText; createdAt: string; activate?: boolean; parentRef?: VersionedEntityRef; authorSource?: string },
): EntityVersion<T>[] {
  if (!SAFE_ID.test(input.entityId) || !VERSION.test(input.version)) throw new Error("Invalid entity version.");
  if (existing.some((item) => item.entityId === input.entityId && item.version === input.version)) {
    throw new Error("Version already exists; immutable versions cannot be overwritten.");
  }
  const next = existing.map((item) => input.activate && item.entityId === input.entityId && item.status === "active"
    ? { ...item, status: "inactive" as const } : item);
  const parent = input.parentRef ? existing.find((item) => item.entityId === input.parentRef!.entityId && item.version === input.parentRef!.version) : undefined;
  if (input.parentRef && (!parent || parent.contentHash !== input.parentRef.contentHash)) throw new Error("Version parent reference is invalid.");
  const before = parent && parent.content && typeof parent.content === "object" ? parent.content as Record<string, unknown> : {};
  const after = input.content && typeof input.content === "object" ? input.content as Record<string, unknown> : {};
  const fieldChanges = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((key) => deterministicHash({ value: before[key] ?? null }) !== deterministicHash({ value: after[key] ?? null })).slice(0, 100).map((key) => ({
    path: key,
    before: JSON.stringify(before[key] ?? null).slice(0, 500),
    after: JSON.stringify(after[key] ?? null).slice(0, 500),
  }));
  return [...next, immutableCopy({
    schemaVersion: 1 as const,
    entityId: input.entityId,
    version: input.version,
    contentHash: deterministicHash(input.content),
    content: input.content,
    ...(input.parentRef ? { parentRef: input.parentRef } : {}),
    authorSource: input.authorSource ?? "local-user",
    fieldChanges,
    changelog: input.changelog,
    status: input.activate ? "active" as const : "inactive" as const,
    createdAt: input.createdAt,
  })];
}

export function markVersionActive<T>(versions: readonly EntityVersion<T>[], ref: Pick<VersionedEntityRef, "entityId" | "version">): EntityVersion<T>[] {
  if (!versions.some((item) => item.entityId === ref.entityId && item.version === ref.version)) throw new Error("Unknown version.");
  return versions.map((item) => item.entityId !== ref.entityId ? item
    : { ...item, status: item.version === ref.version ? "active" as const : item.status === "deprecated" ? "deprecated" as const : "inactive" as const });
}

export function deprecateVersion<T>(versions: readonly EntityVersion<T>[], ref: Pick<VersionedEntityRef, "entityId" | "version">): EntityVersion<T>[] {
  return versions.map((item) => item.entityId === ref.entityId && item.version === ref.version
    ? { ...item, status: "deprecated" as const } : item);
}

export function rollbackAsNewVersion<T>(
  versions: readonly EntityVersion<T>[],
  source: Pick<VersionedEntityRef, "entityId" | "version">,
  newVersion: string,
  createdAt: string,
): EntityVersion<T>[] {
  const previous = versions.find((item) => item.entityId === source.entityId && item.version === source.version);
  if (!previous) throw new Error("Rollback source does not exist.");
  return createEntityVersion(versions, {
    entityId: previous.entityId,
    version: newVersion,
    content: previous.content,
    changelog: { he: `Rollback מגרסה ${source.version}`, en: `Rollback from version ${source.version}` },
    createdAt,
    activate: true,
  });
}

export function createImmutableSnapshot<T>(id: string, entity: EntityVersion<T>, createdAt: string): ImmutableSnapshot<T> {
  if (!SAFE_ID.test(id)) throw new Error("Invalid snapshot ID.");
  return immutableCopy({
    schemaVersion: 1,
    id,
    entityRef: { entityId: entity.entityId, version: entity.version, contentHash: entity.contentHash },
    value: entity.content,
    createdAt,
  });
}

export function hasVersionDrift(frozen: readonly VersionedEntityRef[], current: readonly VersionedEntityRef[]): boolean {
  if (frozen.length !== current.length) return true;
  const currentById = new Map(current.map((item) => [`${item.entityId}@${item.version}`, item.contentHash]));
  return frozen.some((item) => currentById.get(`${item.entityId}@${item.version}`) !== item.contentHash);
}
