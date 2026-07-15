import { execFileSync } from "node:child_process";

export async function waitForServer(url, options = {}) {
  const timeoutMs = options.timeoutMs ?? 30_000;
  const intervalMs = options.intervalMs ?? 200;
  const request = options.request ?? fetch;
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await request(url);
      if (response.ok) return;
      lastError = new Error(`Server returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(
    `Server did not become ready at ${url}: ${lastError?.message ?? "timeout"}`,
  );
}

export function terminateProcessTree(child, options = {}) {
  if (!child?.pid) return;

  const platform = options.platform ?? process.platform;
  const execute = options.execute ?? execFileSync;

  if (platform === "win32") {
    try {
      execute("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } catch {
      // taskkill exits non-zero when the process already stopped.
    }
    return;
  }

  try {
    child.kill("SIGTERM");
  } catch {
    // The process may already have exited.
  }
}
