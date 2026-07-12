import { RuntimeEngine } from "./runtimeEngine";
import { browserRuntimeFactory, type RuntimeFactory } from "./runtimeFactory";
import { RuntimeHistory } from "./runtimeHistory";
import { BrowserRuntimeStorage, type RuntimeStorage } from "./runtimeStorage";
import { MockProvider } from "./providers/MockProvider";
import { ProviderRegistry } from "./providers/ProviderRegistry";
import { ToolRegistry } from "./tools/ToolRegistry";

export function createRuntimeEngine(
  options: { storage?: RuntimeStorage; factory?: RuntimeFactory } = {},
) {
  const factory = options.factory ?? browserRuntimeFactory();
  return new RuntimeEngine(
    new ProviderRegistry([new MockProvider()]),
    new ToolRegistry(),
    new RuntimeHistory(options.storage ?? new BrowserRuntimeStorage()),
    factory,
  );
}
