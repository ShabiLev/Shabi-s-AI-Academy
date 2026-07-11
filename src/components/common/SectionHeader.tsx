import type { ReactNode } from 'react'
export function SectionHeader({ title, accessory }: { title: string; accessory?: ReactNode }) {
  return <div className="section-header"><h2>{title}</h2>{accessory}</div>
}
