export type RouterMode = 'browser' | 'hash'

export function resolveRouterMode(value: string | undefined): RouterMode {
  return value === 'hash' ? 'hash' : 'browser'
}

export const configuredRouterMode = resolveRouterMode(import.meta.env.VITE_ROUTER_MODE)
