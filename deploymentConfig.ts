export type DeploymentEnvironment = Record<string, string | undefined>

export interface DeploymentConfig {
  basePath: string
  routerMode: 'browser' | 'hash'
  deploymentProvider: string
  deploymentEnvironment: string
  publicSiteUrl: string
}

function normalizeBasePath(value: string | undefined): string {
  if (!value || value === '/') return '/'
  return `/${value.replace(/^\/+|\/+$/g, '')}/`
}

function normalizePublicUrl(value: string): string {
  return value.replace(/\/+$/, '')
}

export function resolveDeploymentConfig(env: DeploymentEnvironment): DeploymentConfig {
  const deploymentProvider = env.VITE_DEPLOYMENT_PROVIDER || (env.VERCEL ? 'vercel' : 'local')
  const vercelUrl = env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined

  return {
    basePath: normalizeBasePath(env.VITE_BASE_PATH),
    routerMode: env.VITE_ROUTER_MODE === 'hash' ? 'hash' : 'browser',
    deploymentProvider,
    deploymentEnvironment: env.VERCEL_ENV || deploymentProvider,
    publicSiteUrl: normalizePublicUrl(
      env.VITE_PUBLIC_SITE_URL || vercelUrl || 'https://shabi-s-ai-academy.vercel.app',
    ),
  }
}
