import { runtimeError } from "../runtimeErrors";
import type { ProviderStatus } from "../types";
import type { RuntimeProvider } from "./types";

export class ProviderRegistry {
  private readonly providers = new Map<string, RuntimeProvider>();
  constructor(providers: readonly RuntimeProvider[] = []) {
    providers.forEach((provider) => this.register(provider));
  }
  register(provider: RuntimeProvider) {
    if (this.providers.has(provider.id))
      throw new Error(`Provider already registered: ${provider.id}`);
    this.providers.set(provider.id, provider);
  }
  get(id: string) {
    const provider = this.providers.get(id);
    if (!provider)
      return {
        ok: false as const,
        error: runtimeError(
          "unknownProvider",
          "The selected Runtime provider is unknown.",
          "provider",
          false,
          "Choose the Mock Provider.",
        ),
      };
    return { ok: true as const, provider };
  }
  statuses(): ProviderStatus[] {
    return [
      ...Array.from(this.providers.values(), (provider) =>
        provider.getStatus(),
      ),
      {
        id: "liveReserved",
        name: "Live Provider",
        status: "notConfigured" as const,
        capabilities: [],
        reason: "Live execution is not available in Version 0.7.0-alpha.1.",
      },
    ];
  }
}
