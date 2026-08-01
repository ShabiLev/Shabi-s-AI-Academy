const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);

function canonicalize(value: unknown, seen: Set<object>): string {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("Non-finite numbers cannot be hashed.");
    return Object.is(value, -0) ? "0" : JSON.stringify(value);
  }
  if (typeof value === "undefined") throw new TypeError("Undefined values cannot be hashed.");
  if (typeof value !== "object") throw new TypeError("Unsupported value cannot be hashed.");
  if (seen.has(value)) throw new TypeError("Cyclic values cannot be hashed.");
  seen.add(value);
  try {
    if (Array.isArray(value)) return `[${value.map((item) => canonicalize(item, seen)).join(",")}]`;
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    if (keys.some((key) => FORBIDDEN_KEYS.has(key))) throw new TypeError("Dangerous object key.");
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalize(record[key], seen)}`).join(",")}}`;
  } finally {
    seen.delete(value);
  }
}

export function canonicalJson(value: unknown): string {
  return canonicalize(value, new Set());
}

export function deterministicHash(value: unknown): string {
  const bytes = new TextEncoder().encode(canonicalJson(value));
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function deterministicSeed(seed: string, namespace: string, index = 0): number {
  const hex = deterministicHash({ seed, namespace, index }).slice(-8);
  return Number.parseInt(hex, 16) >>> 0;
}

export function immutableCopy<T>(value: T): T {
  return deepFreeze(structuredClone(value));
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}
