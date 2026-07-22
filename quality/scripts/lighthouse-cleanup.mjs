import { rm } from "node:fs/promises";
import { join } from "node:path";

export function isWindowsLighthouseCleanupOnlyFailure(output, platform = process.platform) {
  return platform === "win32"
    && /EPERM, Permission denied:/i.test(output)
    && /Launcher\.destroyTmp|chrome-launcher[\\/]dist[\\/]chrome-launcher\.js/i.test(output)
    && !/Assertion failed|assertion failure|threshold failed/i.test(output);
}

export function lighthouseTempPaths(output, tempRoot) {
  const names = [...output.matchAll(/lighthouse\.\d+/g)].map((match) => match[0]);
  return [...new Set(names)].map((name) => join(tempRoot, name));
}

export function extractCompletedLighthouseReport(output) {
  for (let start = output.indexOf("{"); start >= 0; start = output.indexOf("{", start + 1)) {
    let depth = 0;
    let quoted = false;
    let escaped = false;
    for (let index = start; index < output.length; index += 1) {
      const character = output[index];
      if (quoted) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') quoted = false;
        continue;
      }
      if (character === '"') quoted = true;
      else if (character === "{") depth += 1;
      else if (character === "}" && --depth === 0) {
        try {
          const report = JSON.parse(output.slice(start, index + 1));
          if (typeof report.lighthouseVersion === "string" && typeof report.finalUrl === "string" && report.audits && report.categories) return report;
        } catch { /* Continue scanning for the completed Lighthouse result. */ }
        break;
      }
    }
  }
  return null;
}

export async function removeWithBoundedRetry(path, remove = rm) {
  await remove(path, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
