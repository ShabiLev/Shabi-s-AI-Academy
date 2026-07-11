import type { ReactNode } from 'react'
export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'online' | 'neutral' }) {
  return <span className={`status-badge status-${tone}`}>{tone === 'online' && <span className="status-dot" />}{children}</span>
}
