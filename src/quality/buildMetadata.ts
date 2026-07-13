export interface BuildMetadata {
  version: string
  commitSha: string
  branch: string
  buildTimestamp: string
  deploymentEnvironment: string
  publicSiteUrl: string
}

export interface RawBuildMetadata {
  version?: string
  commitSha?: string
  branch?: string
  buildTimestamp?: string
  deploymentEnvironment?: string
  publicSiteUrl?: string
}

/**
 * Pure fallback logic, kept separate from the module-level constant below so it is
 * unit-testable regardless of whether Vite's `define` actually injected anything.
 * Never fabricates a value — a missing input becomes an explicit, honest fallback.
 */
export function resolveBuildMetadata(raw: RawBuildMetadata): BuildMetadata {
  return {
    version: raw.version || 'local',
    commitSha: raw.commitSha || 'local',
    branch: raw.branch || 'unknown',
    buildTimestamp: raw.buildTimestamp || 'not available',
    deploymentEnvironment: raw.deploymentEnvironment || 'local',
    publicSiteUrl: raw.publicSiteUrl || 'https://shabi-s-ai-academy.vercel.app',
  }
}

/**
 * Non-sensitive build metadata injected by Vite's `define` (see vite.config.ts) via
 * literal identifier replacement at build time — application version, short commit
 * SHA, branch, and build timestamp only. No tokens, credentials, usernames, or
 * machine paths are ever read here.
 */
export const buildMetadata: BuildMetadata = resolveBuildMetadata({
  version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : undefined,
  commitSha: typeof __COMMIT_SHA__ !== 'undefined' ? __COMMIT_SHA__ : undefined,
  branch: typeof __BRANCH__ !== 'undefined' ? __BRANCH__ : undefined,
  buildTimestamp: typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : undefined,
  deploymentEnvironment: typeof __DEPLOYMENT_ENVIRONMENT__ !== 'undefined' ? __DEPLOYMENT_ENVIRONMENT__ : undefined,
  publicSiteUrl: typeof __PUBLIC_SITE_URL__ !== 'undefined' ? __PUBLIC_SITE_URL__ : undefined,
})
