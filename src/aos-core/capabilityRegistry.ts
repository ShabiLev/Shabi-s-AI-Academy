export type CapabilityRisk = "low" | "medium" | "high" | "critical";
export type CapabilityAvailability = "available" | "unavailable" | "degraded" | "planned";

export interface CapabilityRecord {
  readonly id: string;
  readonly title: { readonly he: string; readonly en: string };
  readonly description: { readonly he: string; readonly en: string };
  readonly version: string;
  readonly owner: string;
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  readonly permissions: readonly string[];
  readonly dependencies: readonly string[];
  readonly provider: string;
  readonly modelRequirements: readonly string[];
  readonly mcpRequirements: readonly string[];
  readonly availability: CapabilityAvailability;
  readonly riskLevel: CapabilityRisk;
  readonly latencyClass: "instant" | "interactive" | "background";
  readonly costClass: "none" | "low" | "variable";
  readonly modes: readonly ("online" | "offline")[];
  readonly health: "healthy" | "degraded" | "unverified";
  readonly lastVerifiedAt?: string;
  readonly documentationUrl: string;
}

const text = (value: unknown, max: number): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= max;
const stringList = (value: unknown, max = 20): value is string[] => Array.isArray(value) && value.length <= max && value.every((item) => text(item, 120));

export function parseCapabilityRecord(value: unknown): CapabilityRecord | undefined {
  if (!value || typeof value !== "object") return undefined;
  const item = value as Record<string, unknown>;
  const title = item.title as Record<string, unknown> | undefined;
  const description = item.description as Record<string, unknown> | undefined;
  if (!text(item.id, 80) || !/^[a-z][a-z0-9.-]+$/.test(item.id)) return undefined;
  if (!title || !text(title.he, 120) || !text(title.en, 120) || !description || !text(description.he, 500) || !text(description.en, 500)) return undefined;
  if (!text(item.version, 30) || !/^\d+\.\d+\.\d+/.test(item.version) || !text(item.owner, 100) || !text(item.provider, 100) || !text(item.documentationUrl, 240) || !item.documentationUrl.startsWith("/")) return undefined;
  if (!stringList(item.inputs) || !stringList(item.outputs) || !stringList(item.permissions) || !stringList(item.dependencies) || !stringList(item.modelRequirements) || !stringList(item.mcpRequirements)) return undefined;
  if (!["available", "unavailable", "degraded", "planned"].includes(String(item.availability)) || !["low", "medium", "high", "critical"].includes(String(item.riskLevel)) || !["instant", "interactive", "background"].includes(String(item.latencyClass)) || !["none", "low", "variable"].includes(String(item.costClass)) || !["healthy", "degraded", "unverified"].includes(String(item.health))) return undefined;
  if (!Array.isArray(item.modes) || !item.modes.length || item.modes.some((mode) => mode !== "online" && mode !== "offline")) return undefined;
  if (item.lastVerifiedAt !== undefined && (!text(item.lastVerifiedAt, 40) || Number.isNaN(Date.parse(item.lastVerifiedAt)))) return undefined;
  return item as unknown as CapabilityRecord;
}

export class CapabilityRegistry {
  private readonly capabilities = new Map<string, CapabilityRecord>();

  constructor(records: readonly unknown[] = []) {
    for (const value of records) this.register(value);
  }

  register(value: unknown): CapabilityRecord {
    const capability = parseCapabilityRecord(value);
    if (!capability) throw new Error("Invalid capability record");
    if (this.capabilities.has(capability.id)) throw new Error(`Capability already registered: ${capability.id}`);
    this.capabilities.set(capability.id, capability);
    return capability;
  }

  get(id: string): CapabilityRecord | undefined {
    return this.capabilities.get(id);
  }

  search(query = "", filters: { availability?: CapabilityAvailability; riskLevel?: CapabilityRisk; mode?: "online" | "offline" } = {}): readonly CapabilityRecord[] {
    const normalized = query.trim().toLocaleLowerCase();
    return [...this.capabilities.values()].filter((capability) => {
      if (filters.availability && capability.availability !== filters.availability) return false;
      if (filters.riskLevel && capability.riskLevel !== filters.riskLevel) return false;
      if (filters.mode && !capability.modes.includes(filters.mode)) return false;
      if (!normalized) return true;
      return [capability.id, capability.title.he, capability.title.en, capability.description.he, capability.description.en, capability.owner, capability.provider]
        .some((field) => field.toLocaleLowerCase().includes(normalized));
    });
  }
}

